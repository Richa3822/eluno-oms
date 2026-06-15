import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PredictionModule } from 'src/prediction/prediction.module';
import { AlertsModule } from 'src/alerts/alerts.module';

@Module({
  imports: [PredictionModule,AlertsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}