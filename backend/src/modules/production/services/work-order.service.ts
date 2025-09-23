import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { WorkOrder, WorkOrderStatus } from '../../../entities/work-order.entity';

@Injectable()
export class WorkOrderService {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly workOrderRepository: Repository<WorkOrder>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    tenant_id: string,
    search?: string,
    status?: WorkOrderStatus,
    productionOrderId?: string,
  ): Promise<{ data: WorkOrder[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.workOrderRepository
      .createQueryBuilder('workOrder')
      .leftJoinAndSelect('workOrder.productionOrder', 'productionOrder')
      .leftJoinAndSelect('workOrder.createdBy', 'createdBy')
      .leftJoinAndSelect('workOrder.assignedTo', 'assignedTo')
      .where('workOrder.tenant_id = :tenant_id', { tenant_id })
      .skip(skip)
      .take(limit)
      .orderBy('workOrder.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere('workOrder.title LIKE :search', { search: `%${search}%` });
    }

    if (status) {
      queryBuilder.andWhere('workOrder.status = :status', { status });
    }

    if (productionOrderId) {
      queryBuilder.andWhere('workOrder.production_order_id = :productionOrderId', { productionOrderId });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string, tenant_id: string): Promise<WorkOrder> {
    const workOrder = await this.workOrderRepository.findOne({
      where: { id, tenant: { id: tenant_id } },
      relations: ['productionOrder', 'createdBy', 'assignedTo', 'tasks'],
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    return workOrder;
  }

  async updateStatus(id: string, status: WorkOrderStatus, tenant_id: string): Promise<WorkOrder> {
    const workOrder = await this.findOne(id, tenant_id);

    if (!this.isValidStatusTransition(workOrder.status, status)) {
      throw new BadRequestException(
        `Invalid status transition from ${workOrder.status} to ${status}`,
      );
    }

    workOrder.status = status;

    // Set actual times based on status
    if (status === WorkOrderStatus.IN_PROGRESS && !workOrder.actualStartTime) {
      workOrder.actualStartTime = new Date();
    } else if (status === WorkOrderStatus.COMPLETED && !workOrder.actualEndTime) {
      workOrder.actualEndTime = new Date();
    }

    return await this.workOrderRepository.save(workOrder);
  }

  async updateProgress(id: string, progressPercentage: number, tenant_id: string): Promise<WorkOrder> {
    if (progressPercentage < 0 || progressPercentage > 100) {
      throw new BadRequestException('Progress percentage must be between 0 and 100');
    }

    const workOrder = await this.findOne(id, tenant_id);
    workOrder.progressPercentage = progressPercentage;

    // Auto-update status based on progress
    if (progressPercentage === 0 && workOrder.status === WorkOrderStatus.IN_PROGRESS) {
      workOrder.status = WorkOrderStatus.PENDING;
    } else if (progressPercentage > 0 && workOrder.status === WorkOrderStatus.PENDING) {
      workOrder.status = WorkOrderStatus.IN_PROGRESS;
      workOrder.actualStartTime = new Date();
    } else if (progressPercentage === 100 && workOrder.status === WorkOrderStatus.IN_PROGRESS) {
      workOrder.status = WorkOrderStatus.COMPLETED;
      workOrder.actualEndTime = new Date();
    }

    return await this.workOrderRepository.save(workOrder);
  }

  async getStatistics(tenant_id: string): Promise<{
    total: number;
    byStatus: Record<WorkOrderStatus, number>;
    averageCompletionTime: number;
  }> {
    const total = await this.workOrderRepository.count({
      where: { tenant: { id: tenant_id } },
    });
    
    const byStatus = {} as Record<WorkOrderStatus, number>;
    for (const status of Object.values(WorkOrderStatus)) {
      byStatus[status as WorkOrderStatus] = await this.workOrderRepository.count({
        where: { status, tenant: { id: tenant_id } },
      });
    }

    // Calculate average completion time for completed work orders
    const completedOrders = await this.workOrderRepository.find({
      where: { status: WorkOrderStatus.COMPLETED, tenant: { id: tenant_id } },
      select: ['actualStartTime', 'actualEndTime'],
    });

    let averageCompletionTime = 0;
    if (completedOrders.length > 0) {
      const totalTime = completedOrders.reduce((sum, order) => {
        if (order.actualStartTime && order.actualEndTime) {
          return sum + (order.actualEndTime.getTime() - order.actualStartTime.getTime());
        }
        return sum;
      }, 0);
      averageCompletionTime = totalTime / completedOrders.length / (1000 * 60 * 60); // Convert to hours
    }

    return { total, byStatus, averageCompletionTime };
  }

  private isValidStatusTransition(
    currentStatus: WorkOrderStatus,
    newStatus: WorkOrderStatus,
  ): boolean {
    const validTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
      [WorkOrderStatus.PENDING]: [
        WorkOrderStatus.IN_PROGRESS,
        WorkOrderStatus.ON_HOLD,
        WorkOrderStatus.CANCELLED,
      ],
      [WorkOrderStatus.IN_PROGRESS]: [
        WorkOrderStatus.COMPLETED,
        WorkOrderStatus.ON_HOLD,
        WorkOrderStatus.CANCELLED,
      ],
      [WorkOrderStatus.ON_HOLD]: [
        WorkOrderStatus.IN_PROGRESS,
        WorkOrderStatus.CANCELLED,
      ],
      [WorkOrderStatus.COMPLETED]: [],
      [WorkOrderStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}