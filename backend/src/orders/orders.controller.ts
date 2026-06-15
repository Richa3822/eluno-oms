import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('lensType') lensType?: string,
    @Query('storeLocation') storeLocation?: string,
  ) {
    return this.ordersService.findAll({ page: Number(page), limit: Number(limit), status, lensType, storeLocation });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Post(':id/predict')
predictBreach(@Param('id') id: string) {
  return this.ordersService.predictBreach(id);
}
}