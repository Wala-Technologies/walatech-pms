import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Scope,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { WorkOrder, WorkOrderStatus } from '../../../entities/work-order.entity';
import { DepartmentAccessService } from '../../../common/services/department-access.service';
import { User } from '../../../entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class WorkOrderService {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly workOrderRepository: Repository<WorkOrder>,
    private readonly departmentAccessService: DepartmentAccessService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  private get tenant_id(): string {
    return this.request.tenant_id || this.request.user?.tenant_id;
  }

  private get user(): User | null {
    return this.request.user || null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    tenant_id: string,
    search?: string,
    status?: WorkOrderStatus,
    productionOrderId?: string,
  ): Promise<{ data: WorkOrder[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const user = this.user;
    
    const queryBuilder = this.workOrderRepository
      .createQueryBuilder('workOrder')
      .leftJoinAndSelect('workOrder.productionOrder', 'productionOrder')
      .leftJoinAndSelect('workOrder.createdBy', 'createdBy')
      .leftJoinAndSelect('workOrder.assignedTo', 'assignedTo')
      .leftJoinAndSelect('workOrder.departmentEntity', 'department')
      .where('workOrder.tenant_id = :tenant_id', { tenant_id: tenant_id || this.tenant_id })
      .skip(skip)
      .take(limit)
      .orderBy('workOrder.createdAt', 'DESC');

    // Apply department filtering
    if (user) {
      const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(user);
      if (accessibleDepartments !== null) {
        if (accessibleDepartments.length > 0) {
          queryBuilder.andWhere('workOrder.department_id IN (:...accessibleDepartments)', { accessibleDepartments });
        } else {
          // User has no department access, return empty result
          queryBuilder.andWhere('1 = 0');
        }
      }
      // If accessibleDepartments is null, user can access all departments (no additional filter needed)
    }

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
    const user = this.user;
    
    const queryBuilder = this.workOrderRepository.createQueryBuilder('workOrder')
      .leftJoinAndSelect('workOrder.productionOrder', 'productionOrder')
      .leftJoinAndSelect('workOrder.createdBy', 'createdBy')
      .leftJoinAndSelect('workOrder.assignedTo', 'assignedTo')
      .leftJoinAndSelect('workOrder.tasks', 'tasks')
      .leftJoinAndSelect('workOrder.departmentEntity', 'department')
      .where('workOrder.id = :id', { id })
      .andWhere('workOrder.tenant_id = :tenant_id', { tenant_id: tenant_id || this.tenant_id });

    // Apply department filtering
    if (user) {
      const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(user);
      if (accessibleDepartments !== null) {
        if (accessibleDepartments.length > 0) {
          queryBuilder.andWhere('workOrder.department_id IN (:...accessibleDepartments)', { accessibleDepartments });
        } else {
          // User has no department access, return not found
          throw new NotFoundException('Work order not found');
        }
      }
      // If accessibleDepartments is null, user can access all departments (no additional filter needed)
    }

    const workOrder = await queryBuilder.getOne();

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
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
    const user = this.user;
    
    // Build base query with department filtering
    const baseQueryBuilder = this.workOrderRepository.createQueryBuilder('workOrder')
      .where('workOrder.tenant_id = :tenant_id', { tenant_id: tenant_id || this.tenant_id });

    // Apply department filtering
    if (user) {
      const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(user);
      if (accessibleDepartments !== null) {
        if (accessibleDepartments.length > 0) {
          baseQueryBuilder.andWhere('workOrder.department_id IN (:...accessibleDepartments)', { accessibleDepartments });
        } else {
          // User has no department access, return zero stats
          const byStatus = {} as Record<WorkOrderStatus, number>;
          for (const status of Object.values(WorkOrderStatus)) {
            byStatus[status as WorkOrderStatus] = 0;
          }
          return { total: 0, byStatus, averageCompletionTime: 0 };
        }
      }
      // If accessibleDepartments is null, user can access all departments (no additional filter needed)
    }

    const total = await baseQueryBuilder.getCount();
    
    const byStatus = {} as Record<WorkOrderStatus, number>;
    for (const status of Object.values(WorkOrderStatus)) {
      const statusQueryBuilder = this.workOrderRepository.createQueryBuilder('workOrder')
        .where('workOrder.tenant_id = :tenant_id', { tenant_id: tenant_id || this.tenant_id })
        .andWhere('workOrder.status = :status', { status });

      // Apply same department filtering for status counts
      if (user) {
        const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(user);
        if (accessibleDepartments !== null && accessibleDepartments.length > 0) {
          statusQueryBuilder.andWhere('workOrder.department_id IN (:...accessibleDepartments)', { accessibleDepartments });
        }
      }

      byStatus[status as WorkOrderStatus] = await statusQueryBuilder.getCount();
    }

    // Calculate average completion time for completed work orders
    const completedQueryBuilder = this.workOrderRepository.createQueryBuilder('workOrder')
      .select(['workOrder.actualStartTime', 'workOrder.actualEndTime'])
      .where('workOrder.status = :status', { status: WorkOrderStatus.COMPLETED })
      .andWhere('workOrder.tenant_id = :tenant_id', { tenant_id: tenant_id || this.tenant_id });

    // Apply same department filtering for completed orders
    if (user) {
      const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(user);
      if (accessibleDepartments !== null && accessibleDepartments.length > 0) {
        completedQueryBuilder.andWhere('workOrder.department_id IN (:...accessibleDepartments)', { accessibleDepartments });
      }
    }

    const completedOrders = await completedQueryBuilder.getMany();

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