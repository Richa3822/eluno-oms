import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PredictionService } from 'src/prediction/prediction.service';
import { AlertsService } from 'src/alerts/alerts.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prediction: PredictionService,
    private readonly alerts: AlertsService,
  ) {}

  async create(dto: CreateOrderDto) {
    // Step 1: Get SLA config for this lens type
    const slaConfig = await this.prisma.slaConfig.findUnique({
      where: { lensType: dto.lensType },
    });

    if (!slaConfig) {
      throw new NotFoundException(`No SLA config found for lens type: ${dto.lensType}`);
    }

    // Step 2: Calculate SLA deadline
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + slaConfig.tatHours);

    // Step 3: Check inventory
    const prescription = dto.prescription as any;
    const inventoryItem = await this.prisma.lensInventory.findFirst({
      where: {
        powerSph: prescription.rightEye.sph,
        powerCyl: prescription.rightEye.cyl,
        lensType: dto.lensType,
        lensIndex: dto.lensIndex,
        coating: dto.coating,
        quantity: { gt: 0 },
      },
    });

    const inStock = !!inventoryItem;
    const initialStatus = inStock ? 'LENS_CUTTING' : 'ORDER_PLACED';

    // Step 4: Create order + first status log in one transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerName: dto.customerName,
          storeLocation: dto.storeLocation,
          prescription: dto.prescription,
          frameId: dto.frameId,
          lensType: dto.lensType,
          lensIndex: dto.lensIndex,
          coating: dto.coating,
          status: initialStatus,
          slaDeadline,
        },
      });

      // Write first status log
      await tx.orderStatusLog.create({
        data: {
          orderId: newOrder.id,
          fromStatus: null,
          toStatus: initialStatus,
          reason: inStock ? 'Lens in stock, moved to cutting' : 'Lens not in stock, awaiting procurement',
          updatedBy: 'system',
        },
      });

      // Step 5: Decrement inventory if in stock
      if (inStock && inventoryItem) {
        await tx.lensInventory.update({
          where: { id: inventoryItem.id },
          data: { quantity: { decrement: 1 } },
        });
      }

      return newOrder;
    });

    if (!inStock) {
      console.warn(`⚠️ Lens not in stock for order ${order.id} — procurement team should be notified`);
    }

    return {
      ...order,
      inStock,
      message: inStock
        ? 'Order created — lens in stock, moved to LENS_CUTTING'
        : 'Order created — lens not in stock, awaiting procurement',
    };
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    lensType?: string;
    storeLocation?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.lensType) where.lensType = query.lensType;
    if (query.storeLocation) where.storeLocation = query.storeLocation;

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { breachAlerts: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    // Add time remaining and breach flag to each order
    const now = new Date();
    const enrichedOrders = orders.map((order) => {
      const hoursRemaining = Math.round(
        (new Date(order.slaDeadline).getTime() - now.getTime()) / (1000 * 60 * 60)
      );
      const isBreached = hoursRemaining < 0;
      const isAtRisk = hoursRemaining >= 0 && hoursRemaining <= 4;
      const latestAlert = order.breachAlerts?.[order.breachAlerts.length - 1];

      return {
        ...order,
        hoursRemaining,
        isBreached,
        isAtRisk,
        breachRisk: latestAlert?.breachRisk ?? null,
      };
    });

    return {
      data: enrichedOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        statusLogs: { orderBy: { createdAt: 'asc' } },
        breachAlerts: true,
      },
    });

    if (!order) throw new NotFoundException(`Order ${id} not found`);

    const hoursRemaining = Math.round(
      (new Date(order.slaDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60)
    );

    return {
      ...order,
      hoursRemaining,
      isBreached: hoursRemaining < 0,
      isAtRisk: hoursRemaining >= 0 && hoursRemaining <= 4,
    };
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: dto.status },
      });

      await tx.orderStatusLog.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: dto.status,
          reason: dto.reason,
          updatedBy: dto.updatedBy ?? 'ops_team',
        },
      });

      return updatedOrder;
    });

    return updated;
  }

  // async predictBreach(id: string) {
  //   const order = await this.prisma.order.findUnique({ where: { id } });
  //   if (!order) throw new NotFoundException(`Order ${id} not found`);
  
  //   const result = await this.prediction.predictForOrder(id);
  
  //   const slaDeadlineMs = new Date(order.slaDeadline).getTime();
  
  //   const alert = await this.prisma.breachAlert.create({
  //     data: {
  //       orderId: id,
  //       predictedBreachAt: new Date(slaDeadlineMs),
  //       breachRisk: result.riskBand,
  //       riskReason: result.reason,
  //     },
  //   });
  
  //   return {
  //     orderId: id,
  //     riskBand: result.riskBand,
  //     reason: result.reason,
  //     alertId: alert.id,
  //   };
  // }

  async predictBreach(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
  
    const result = await this.prediction.predictForOrder(id);
  
    const slaDeadlineMs = new Date(order.slaDeadline).getTime();
    const hoursRemaining = Math.round((slaDeadlineMs - Date.now()) / (1000 * 60 * 60));
  
    let alertSentAt: Date | null = null;
    let channel: string | null = null;
  
    if (result.riskBand === 'HIGH') {
      const sendResult = await this.alerts.sendBreachAlert({
        orderId: id,
        customerName: order.customerName,
        storeLocation: order.storeLocation,
        lensType: order.lensType,
        status: order.status,
        riskBand: result.riskBand,
        reason: result.reason,
        hoursRemaining,
      });
  
      if (sendResult.sent) {
        alertSentAt = new Date();
        channel = sendResult.channel;
      }
    }
  
    const alert = await this.prisma.breachAlert.create({
      data: {
        orderId: id,
        predictedBreachAt: new Date(slaDeadlineMs),
        breachRisk: result.riskBand,
        riskReason: result.reason,
        alertSentAt,
        channel,
      },
    });
  
    return {
      orderId: id,
      riskBand: result.riskBand,
      reason: result.reason,
      alertSent: !!alertSentAt,
      alertId: alert.id,
    };
  }
}