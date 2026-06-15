import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { OrdersModule } from './orders/orders.module';
import { InventoryModule } from './inventory/inventory.module';
import { PredictionModule } from './prediction/prediction.module';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [PrismaModule, OrdersModule, InventoryModule, PredictionModule, AlertsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}