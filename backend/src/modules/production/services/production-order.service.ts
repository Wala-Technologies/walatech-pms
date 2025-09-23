import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { ProductionOrder, ProductionOrderStatus } from '../../../entities/production-order.entity';
import { CreateProductionOrderDto } from '../dto/create-production-order.dto';
import { UpdateProductionOrderDto } from '../dto/update-production-order.dto';

@Injectable()
export class ProductionOrderService {
  constructor(
    @InjectRepository(ProductionOrder)
    private readonly productionOrderRepository: Repository<ProductionOrder>,
  ) {}

  async create(
    createDto: CreateProductionOrderDto,
    createdById: string,
    tenantId: string,
  ): Promise<ProductionOrder> {
    // Generate unique order number
    const orderNumber = await this.generateOrderNumber(tenantId);

    // Validate dates
    const plannedStart = new Date(createDto.plannedStartDate);
    const plannedEnd = new Date(createDto.plannedEndDate);

    if (plannedStart >= plannedEnd) {
      throw new BadRequestException(
        'Planned start date must be before planned end date',
      );
    }

    const productionOrder = this.productionOrderRepository.create({
      ...createDto,
      orderNumber,
      plannedStartDate: plannedStart,
      plannedEndDate: plannedEnd,
      tenant_id: tenantId,
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
    tenantId?: string,
  ): Promise<{ data: ProductionOrder[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<ProductionOrder> = {
      tenant: { id: tenantId },
    };

    if (search) {
      where.productName = Like(`%${search}%`);
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await this.productionOrderRepository.findAndCount({
      where,
      relations: ['createdBy', 'assignedTo', 'workOrders'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string, tenantId: string): Promise<ProductionOrder> {
    const productionOrder = await this.productionOrderRepository.findOne({
      where: { id, tenant: { id: tenantId } },
      relations: ['createdBy', 'assignedTo', 'workOrders'],
    });

    if (!productionOrder) {
      throw new NotFoundException(`Production order with ID ${id} not found`);
    }

    return productionOrder;
  }

  async update(id: string, updateDto: Partial<ProductionOrder>, tenantId: string): Promise<ProductionOrder> {
    const productionOrder = await this.findOne(id, tenantId);
    
    Object.assign(productionOrder, updateDto);
    return await this.productionOrderRepository.save(productionOrder);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const productionOrder = await this.findOne(id, tenantId);
    await this.productionOrderRepository.remove(productionOrder);
  }

  async getStatistics(tenantId: string): Promise<{
    total: number;
    byStatus: Record<ProductionOrderStatus, number>;
    averageCompletionTime: number;
  }> {
    const total = await this.productionOrderRepository.count({
      where: { tenant: { id: tenantId } },
    });

    const byStatus: Record<ProductionOrderStatus, number> = {} as any;
    for (const status of Object.values(ProductionOrderStatus)) {
      byStatus[status as ProductionOrderStatus] = await this.productionOrderRepository.count({
        where: { status, tenant: { id: tenantId } },
      });
    }

    // Calculate average completion time for completed production orders
    const completedOrders = await this.productionOrderRepository.find({
      where: { status: ProductionOrderStatus.COMPLETED, tenant: { id: tenantId } },
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

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PO${year}${month}`;

    const lastOrder = await this.productionOrderRepository.findOne({
      where: { 
        orderNumber: Like(`${prefix}%`),
        tenant_id: tenantId,
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