import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Scope,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { ProductionOrder, ProductionOrderStatus } from '../../../entities/production-order.entity';
import { CreateProductionOrderDto } from '../dto/create-production-order.dto';
import { UpdateProductionOrderDto } from '../dto/update-production-order.dto';
import { DepartmentAccessService } from '../../../common/services/department-access.service';
import { User } from '../../../entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class ProductionOrderService {
  constructor(
    @InjectRepository(ProductionOrder)
    private readonly productionOrderRepository: Repository<ProductionOrder>,
    private readonly departmentAccessService: DepartmentAccessService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  private get tenant_id(): string {
    return this.request.tenant_id || this.request.user?.tenant_id;
  }

  private get user(): User | null {
    return this.request.user || null;
  }

  async create(
    createDto: CreateProductionOrderDto,
    createdById: string,
    tenant_id: string,
  ): Promise<ProductionOrder> {
    // Generate unique order number
    const orderNumber = await this.generateOrderNumber(tenant_id);

    // Validate dates
    const plannedStart = new Date(createDto.plannedStartDate);
    const plannedEnd = new Date(createDto.plannedEndDate);

    if (plannedStart >= plannedEnd) {
      throw new BadRequestException(
        'Planned start date must be before planned end date',
      );
    }

    // Handle department assignment
    const user = this.user;
    let departmentId: string | undefined;

    if (user) {
      // Use user's default department
      departmentId = this.departmentAccessService.getDefaultDepartmentForUser(user) ?? undefined;
    }

    // Note: Department access validation removed as department_id is not part of CreateProductionOrderDto

    const productionOrder = this.productionOrderRepository.create({
      ...createDto,
      orderNumber,
      plannedStartDate: plannedStart,
      plannedEndDate: plannedEnd,
      tenant_id: tenant_id,
      department_id: departmentId,
      createdBy: { id: createdById } as any,
      assignedTo: createDto.assignedTo ? { id: createDto.assignedTo } as any : undefined,
    });

    return await this.productionOrderRepository.save(productionOrder);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: ProductionOrderStatus,
    tenant_id?: string,
    userId?: string,
  ): Promise<{ data: ProductionOrder[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const user = this.user;

    // Build query with department filtering
    const queryBuilder = this.productionOrderRepository.createQueryBuilder('productionOrder')
      .leftJoinAndSelect('productionOrder.createdBy', 'createdBy')
      .leftJoinAndSelect('productionOrder.assignedTo', 'assignedTo')
      .leftJoinAndSelect('productionOrder.workOrders', 'workOrders')
      .leftJoinAndSelect('productionOrder.department', 'department')
      .where('productionOrder.tenant_id = :tenant_id', { tenant_id: tenant_id || this.tenant_id });

    // Apply department filtering
    if (user) {
      const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(user);
      if (accessibleDepartments !== null) {
        if (accessibleDepartments.length > 0) {
          queryBuilder.andWhere('productionOrder.department_id IN (:...accessibleDepartments)', { accessibleDepartments });
        } else {
          // User has no department access, return empty result
          queryBuilder.andWhere('1 = 0');
        }
      }
      // If accessibleDepartments is null, user can access all departments (no additional filter needed)
    }

    if (search) {
      queryBuilder.andWhere('productionOrder.productName LIKE :search', { search: `%${search}%` });
    }

    if (status) {
      queryBuilder.andWhere('productionOrder.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .orderBy('productionOrder.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string, tenant_id: string): Promise<ProductionOrder> {
    const user = this.user;
    
    const queryBuilder = this.productionOrderRepository.createQueryBuilder('productionOrder')
      .leftJoinAndSelect('productionOrder.createdBy', 'createdBy')
      .leftJoinAndSelect('productionOrder.assignedTo', 'assignedTo')
      .leftJoinAndSelect('productionOrder.workOrders', 'workOrders')
      .leftJoinAndSelect('workOrders.tasks', 'tasks')
      .leftJoinAndSelect('productionOrder.department', 'department')
      .where('productionOrder.id = :id', { id })
      .andWhere('productionOrder.tenant_id = :tenant_id', { tenant_id: tenant_id || this.tenant_id });

    // Apply department filtering
    if (user) {
      const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(user);
      if (accessibleDepartments !== null) {
        if (accessibleDepartments.length > 0) {
          queryBuilder.andWhere('productionOrder.department_id IN (:...accessibleDepartments)', { accessibleDepartments });
        } else {
          // User has no department access, return not found
          throw new NotFoundException('Production order not found');
        }
      }
      // If accessibleDepartments is null, user can access all departments (no additional filter needed)
    }

    const productionOrder = await queryBuilder.getOne();

    if (!productionOrder) {
      throw new NotFoundException('Production order not found');
    }

    return productionOrder;
  }

  async update(
    id: string,
    updateDto: UpdateProductionOrderDto,
    tenant_id: string,
  ): Promise<ProductionOrder> {
    const productionOrder = await this.findOne(id, tenant_id);
    const user = this.user;

    // Note: Department access validation removed as department_id is not part of UpdateProductionOrderDto

    // Validate status transition if status is being updated
    if (updateDto.status && updateDto.status !== productionOrder.status) {
      if (!this.isValidStatusTransition(productionOrder.status, updateDto.status)) {
        throw new BadRequestException(
          `Invalid status transition from ${productionOrder.status} to ${updateDto.status}`,
        );
      }
    }

    // Validate dates if they are being updated
    if (updateDto.plannedStartDate || updateDto.plannedEndDate) {
      const plannedStart = updateDto.plannedStartDate
        ? new Date(updateDto.plannedStartDate)
        : productionOrder.plannedStartDate;
      const plannedEnd = updateDto.plannedEndDate
        ? new Date(updateDto.plannedEndDate)
        : productionOrder.plannedEndDate;

      if (plannedStart >= plannedEnd) {
        throw new BadRequestException(
          'Planned start date must be before planned end date',
        );
      }

      // Note: Date conversion is handled in the controller, not here
    }

    Object.assign(productionOrder, updateDto);
    return await this.productionOrderRepository.save(productionOrder);
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const productionOrder = await this.findOne(id, tenant_id);
    await this.productionOrderRepository.remove(productionOrder);
  }

  async getStatistics(tenant_id: string): Promise<{
    total: number;
    byStatus: Record<ProductionOrderStatus, number>;
    averageCompletionTime: number;
  }> {
    const total = await this.productionOrderRepository.count({
      where: { tenant: { id: tenant_id } },
    });

    const byStatus: Record<ProductionOrderStatus, number> = {} as any;
    for (const status of Object.values(ProductionOrderStatus)) {
      byStatus[status as ProductionOrderStatus] = await this.productionOrderRepository.count({
        where: { status, tenant: { id: tenant_id } },
      });
    }

    // Calculate average completion time for completed production orders
    const completedOrders = await this.productionOrderRepository.find({
      where: { status: ProductionOrderStatus.COMPLETED, tenant: { id: tenant_id } },
      select: ['actualStartDate', 'actualEndDate'],
    });

    let averageCompletionTime = 0;
    if (completedOrders.length > 0) {
      const totalCompletionTime = completedOrders.reduce((sum, order) => {
        if (order.actualStartDate && order.actualEndDate) {
          const completionTime = new Date(order.actualEndDate).getTime() - new Date(order.actualStartDate).getTime();
          return sum + completionTime;
        }
        return sum;
      }, 0);
      averageCompletionTime = totalCompletionTime / completedOrders.length;
    }

    return { total, byStatus, averageCompletionTime };
  }

  private async generateOrderNumber(tenant_id: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PO${year}${month}`;

    const lastOrder = await this.productionOrderRepository.findOne({
      where: { 
        orderNumber: Like(`${prefix}%`),
        tenant_id: tenant_id,
      },
      order: { orderNumber: 'DESC' },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  private isValidStatusTransition(
    currentStatus: ProductionOrderStatus,
    newStatus: ProductionOrderStatus,
  ): boolean {
    const validTransitions: Record<ProductionOrderStatus, ProductionOrderStatus[]> = {
      [ProductionOrderStatus.DRAFT]: [
        ProductionOrderStatus.PLANNED,
        ProductionOrderStatus.CANCELLED,
      ],
      [ProductionOrderStatus.PLANNED]: [
        ProductionOrderStatus.IN_PROGRESS,
        ProductionOrderStatus.CANCELLED,
      ],
      [ProductionOrderStatus.IN_PROGRESS]: [
        ProductionOrderStatus.COMPLETED,
        ProductionOrderStatus.CANCELLED,
      ],
      [ProductionOrderStatus.COMPLETED]: [],
      [ProductionOrderStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}