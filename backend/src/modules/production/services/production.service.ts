import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { ProductionPlan, ProductionPlanStatus } from '../entities/production-plan.entity';
import { ProductionPlanItem } from '../entities/production-plan-item.entity';
import { WorkOrder, WorkOrderStatus } from '../entities/work-order.entity';
import { WorkOrderTask, TaskStatus } from '../entities/work-order-task.entity';
import { CreateProductionPlanDto, UpdateProductionPlanDto } from '../dto/production-plan.dto';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from '../dto/work-order.dto';
import { CreateWorkOrderTaskDto, UpdateWorkOrderTaskDto } from '../dto/work-order-task.dto';
import { User } from '../../../entities/user.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { Item } from '../../../entities/item.entity';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionPlan)
    private productionPlanRepository: Repository<ProductionPlan>,
    @InjectRepository(ProductionPlanItem)
    private productionPlanItemRepository: Repository<ProductionPlanItem>,
    @InjectRepository(WorkOrder)
    private workOrderRepository: Repository<WorkOrder>,
    @InjectRepository(WorkOrderTask)
    private workOrderTaskRepository: Repository<WorkOrderTask>,
  ) {}

  // Production Plan Methods
  async createProductionPlan(createDto: CreateProductionPlanDto, tenant_id: string, userId: string): Promise<ProductionPlan> {
    const planNumber = await this.generatePlanNumber(tenant_id);
    
    const productionPlan = this.productionPlanRepository.create({
      ...createDto,
      planNumber,
      tenant_id,
      createdById: userId,
    });

    return await this.productionPlanRepository.save(productionPlan);
  }

  async findAllProductionPlans(
    tenant_id: string,
    page: number = 1,
    limit: number = 10,
    status?: ProductionPlanStatus,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ data: ProductionPlan[]; total: number; page: number; limit: number }> {
    const where: FindOptionsWhere<ProductionPlan> = { tenant_id };
    
    if (status) {
      where.status = status;
    }
    
    if (startDate && endDate) {
      where.startDate = Between(startDate, endDate);
    }

    const [data, total] = await this.productionPlanRepository.findAndCount({
      where,
      relations: ['items', 'workOrders', 'createdBy', 'approvedBy'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findProductionPlanById(id: string, tenant_id: string): Promise<ProductionPlan> {
    const plan = await this.productionPlanRepository.findOne({
      where: { id, tenant_id },
      relations: ['items', 'workOrders', 'createdBy', 'approvedBy'],
    });

    if (!plan) {
      throw new NotFoundException('Production plan not found');
    }

    return plan;
  }

  async updateProductionPlan(id: string, updateDto: UpdateProductionPlanDto, tenant_id: string): Promise<ProductionPlan> {
    const plan = await this.findProductionPlanById(id, tenant_id);
    
    if (plan.status === ProductionPlanStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed production plan');
    }

    Object.assign(plan, updateDto);
    return await this.productionPlanRepository.save(plan);
  }

  async deleteProductionPlan(id: string, tenant_id: string): Promise<void> {
    const plan = await this.findProductionPlanById(id, tenant_id);
    
    if (plan.status !== ProductionPlanStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft production plans');
    }

    await this.productionPlanRepository.remove(plan);
  }

  async approveProductionPlan(id: string, tenant_id: string, userId: string): Promise<ProductionPlan> {
    const plan = await this.findProductionPlanById(id, tenant_id);
    
    if (plan.status !== ProductionPlanStatus.DRAFT) {
      throw new BadRequestException('Can only approve draft production plans');
    }

    plan.status = ProductionPlanStatus.SUBMITTED;
    plan.approvedById = userId;
    plan.approvedAt = new Date();

    return await this.productionPlanRepository.save(plan);
  }

  // Work Order Methods
  async createWorkOrder(createDto: CreateWorkOrderDto, tenant_id: string, userId: string): Promise<WorkOrder> {
    const workOrderNumber = await this.generateWorkOrderNumber(tenant_id);
    
    const workOrder = this.workOrderRepository.create({
      ...createDto,
      workOrderNumber,
      tenant_id,
      createdById: userId,
    });

    return await this.workOrderRepository.save(workOrder);
  }

  async findAllWorkOrders(
    tenant_id: string,
    page: number = 1,
    limit: number = 10,
    status?: WorkOrderStatus,
    productionPlanId?: string
  ): Promise<{ data: WorkOrder[]; total: number; page: number; limit: number }> {
    const where: FindOptionsWhere<WorkOrder> = { tenant_id };
    
    if (status) {
      where.status = status;
    }
    
    if (productionPlanId) {
      where.productionPlanId = productionPlanId;
    }

    const [data, total] = await this.workOrderRepository.findAndCount({
      where,
      relations: ['tasks', 'productionPlan', 'createdBy', 'assignedTo'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findWorkOrderById(id: string, tenant_id: string): Promise<WorkOrder> {
    const workOrder = await this.workOrderRepository.findOne({
      where: { id, tenant_id },
      relations: ['tasks', 'productionPlan', 'createdBy', 'assignedTo'],
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async updateWorkOrder(id: string, updateDto: UpdateWorkOrderDto, tenant_id: string): Promise<WorkOrder> {
    const workOrder = await this.findWorkOrderById(id, tenant_id);
    
    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed work order');
    }

    Object.assign(workOrder, updateDto);
    return await this.workOrderRepository.save(workOrder);
  }

  async startWorkOrder(id: string, tenant_id: string): Promise<WorkOrder> {
    const workOrder = await this.findWorkOrderById(id, tenant_id);
    
    if (workOrder.status !== WorkOrderStatus.RELEASED) {
      throw new BadRequestException('Work order must be released to start');
    }

    workOrder.status = WorkOrderStatus.IN_PROGRESS;
    workOrder.actualStartDate = new Date();

    return await this.workOrderRepository.save(workOrder);
  }

  async completeWorkOrder(id: string, tenant_id: string): Promise<WorkOrder> {
    const workOrder = await this.findWorkOrderById(id, tenant_id);
    
    if (workOrder.status !== WorkOrderStatus.IN_PROGRESS) {
      throw new BadRequestException('Work order must be in progress to complete');
    }

    // Check if all tasks are completed
    const incompleteTasks = workOrder.tasks?.filter(task => task.status !== TaskStatus.COMPLETED) || [];
    if (incompleteTasks.length > 0) {
      throw new BadRequestException('All tasks must be completed before completing work order');
    }

    workOrder.status = WorkOrderStatus.COMPLETED;
    workOrder.actualEndDate = new Date();

    return await this.workOrderRepository.save(workOrder);
  }

  // Work Order Task Methods
  async createWorkOrderTask(createDto: CreateWorkOrderTaskDto, tenant_id: string): Promise<WorkOrderTask> {
    const workOrder = await this.findWorkOrderById(createDto.workOrderId, tenant_id);
    
    const taskNumber = await this.generateTaskNumber(workOrder.workOrderNumber);
    
    const task = this.workOrderTaskRepository.create({
      ...createDto,
      taskNumber,
    });

    return await this.workOrderTaskRepository.save(task);
  }

  async updateWorkOrderTask(id: string, updateDto: UpdateWorkOrderTaskDto, tenant_id: string): Promise<WorkOrderTask> {
    const task = await this.workOrderTaskRepository.findOne({
      where: { id, workOrder: { tenant_id } },
      relations: ['workOrder'],
    });

    if (!task) {
      throw new NotFoundException('Work order task not found');
    }

    Object.assign(task, updateDto);
    return await this.workOrderTaskRepository.save(task);
  }

  async startTask(id: string, tenant_id: string, userId: string): Promise<WorkOrderTask> {
    const task = await this.workOrderTaskRepository.findOne({
      where: { id, workOrder: { tenant_id } },
      relations: ['workOrder'],
    });

    if (!task) {
      throw new NotFoundException('Work order task not found');
    }

    if (task.status !== TaskStatus.PENDING) {
      throw new BadRequestException('Task must be pending to start');
    }

    task.status = TaskStatus.IN_PROGRESS;
    task.actualStartTime = new Date();
    task.assignedToId = userId;

    return await this.workOrderTaskRepository.save(task);
  }

  async completeTask(id: string, tenant_id: string, userId: string): Promise<WorkOrderTask> {
    const task = await this.workOrderTaskRepository.findOne({
      where: { id, workOrder: { tenant_id } },
      relations: ['workOrder'],
    });

    if (!task) {
      throw new NotFoundException('Work order task not found');
    }

    if (task.status !== TaskStatus.IN_PROGRESS) {
      throw new BadRequestException('Task must be in progress to complete');
    }

    task.status = TaskStatus.COMPLETED;
    task.actualEndTime = new Date();
    task.completedById = userId;
    task.completedAt = new Date();

    return await this.workOrderTaskRepository.save(task);
  }

  // Dashboard and Analytics
  async getProductionDashboard(tenant_id: string): Promise<any> {
    const [totalPlans, activePlans, totalWorkOrders, activeWorkOrders] = await Promise.all([
      this.productionPlanRepository.count({ where: { tenant_id } }),
      this.productionPlanRepository.count({ where: { tenant_id, status: ProductionPlanStatus.IN_PROGRESS } }),
      this.workOrderRepository.count({ where: { tenant_id } }),
      this.workOrderRepository.count({ where: { tenant_id, status: WorkOrderStatus.IN_PROGRESS } }),
    ]);

    return {
      totalPlans,
      activePlans,
      totalWorkOrders,
      activeWorkOrders,
      completionRate: totalWorkOrders > 0 ? Math.round(((totalWorkOrders - activeWorkOrders) / totalWorkOrders) * 100) : 0,
    };
  }

  // Helper Methods
  private async generatePlanNumber(tenant_id: string): Promise<string> {
    const count = await this.productionPlanRepository.count({ where: { tenant_id } });
    const year = new Date().getFullYear();
    return `PP-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private async generateWorkOrderNumber(tenant_id: string): Promise<string> {
    const count = await this.workOrderRepository.count({ where: { tenant_id } });
    const year = new Date().getFullYear();
    return `WO-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private async generateTaskNumber(workOrderNumber: string): Promise<string> {
    const taskCount = await this.workOrderTaskRepository.count({
      where: { workOrder: { workOrderNumber } },
    });
    return `${workOrderNumber}-T${String(taskCount + 1).padStart(2, '0')}`;
  }
}