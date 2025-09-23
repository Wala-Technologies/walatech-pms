import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionOrder } from '../../entities/production-order.entity';
import { WorkOrder } from '../../entities/work-order.entity';
import { WorkOrderTask } from '../../entities/work-order-task.entity';
import { ProductionOrderService } from './services/production-order.service';
import { WorkOrderService } from './services/work-order.service';
import { WorkOrderTaskService } from './services/work-order-task.service';
import { ProductionOrderController } from './controllers/production-order.controller';
import { WorkOrderController } from './controllers/work-order.controller';
import { WorkOrderTaskController } from './controllers/work-order-task.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionOrder,
      WorkOrder,
      WorkOrderTask,
    ]),
  ],
  controllers: [
    ProductionOrderController,
    WorkOrderController,
    WorkOrderTaskController,
  ],
  providers: [
    ProductionOrderService,
    WorkOrderService,
    WorkOrderTaskService,
  ],
  exports: [
    ProductionOrderService,
    WorkOrderService,
    WorkOrderTaskService,
  ],
})
export class ProductionModule {}