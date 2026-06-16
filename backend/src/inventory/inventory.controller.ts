import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { AddStockDto } from './dto/add-stock.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Query('lensType') lensType?: string, @Query('coating') coating?: string) {
    return this.inventoryService.findAll({ lensType, coating });
  }

  @Post()
  create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }

  @Patch(':id')
  updateQuantity(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.inventoryService.updateQuantity(id, quantity);
  }

  @Patch(':id/add-stock')
  addStock(@Param('id') id: string, @Body() dto: AddStockDto) {
    return this.inventoryService.addStock(id, dto.quantity);
  }
}
