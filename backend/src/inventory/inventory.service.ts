import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { lensType?: string; coating?: string }) {
    const where: any = {};
    if (query.lensType) where.lensType = query.lensType;
    if (query.coating) where.coating = query.coating;

    return this.prisma.lensInventory.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(data: {
    powerSph: number;
    powerCyl?: number;
    powerAxis?: number;
    lensType: string;
    lensIndex: string;
    coating: string;
    quantity: number;
  }) {
    return this.prisma.lensInventory.create({ data });
  }

  async updateQuantity(id: string, quantity: number) {
    const item = await this.prisma.lensInventory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Inventory item ${id} not found`);

    return this.prisma.lensInventory.update({
      where: { id },
      data: { quantity },
    });
  }

  async addStock(id: string, addQuantity: number) {
    const item = await this.prisma.lensInventory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Inventory item ${id} not found`);

    return this.prisma.lensInventory.update({
      where: { id },
      data: { quantity: { increment: addQuantity } },
    });
  }
}