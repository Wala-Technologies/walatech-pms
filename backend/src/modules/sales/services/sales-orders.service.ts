import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Scope,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import {
  SalesOrder,
  SalesOrderStatus,
} from '../../../entities/sales-order.entity';
import { SalesOrderItem } from '../../../entities/sales-order-item.entity';
import { Customer } from '../../../entities/customer.entity';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  SalesOrderQueryDto,
} from '../dto/sales-orders';
import { DepartmentAccessService } from '../../../common/services/department-access.service';

@Injectable({ scope: Scope.REQUEST })
export class SalesOrdersService {
  constructor(
    @InjectRepository(SalesOrder)
    private salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(SalesOrderItem)
    private salesOrderItemRepository: Repository<SalesOrderItem>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private readonly departmentAccessService: DepartmentAccessService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(
    createSalesOrderDto: CreateSalesOrderDto,
    tenant_id: string,
  ): Promise<SalesOrder> {
    try {
      // Basic required field validation to return 400 instead of 500 on malformed payloads
      if (
        !createSalesOrderDto.customer_id ||
        !createSalesOrderDto.customer_name
      ) {
        throw new BadRequestException('Customer information is required');
      }
      if (
        !createSalesOrderDto.transaction_date ||
        !createSalesOrderDto.delivery_date
      ) {
        throw new BadRequestException(
          'transaction_date and delivery_date are required',
        );
      }
      if (
        !Array.isArray(createSalesOrderDto.items) ||
        createSalesOrderDto.items.length === 0
      ) {
        throw new BadRequestException('At least one item is required');
      }

      // Validate customer exists and belongs to tenant
      const customer = await this.customerRepository.findOne({
        where: { id: createSalesOrderDto.customer_id, tenant_id: tenant_id },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      // Set default department if not provided and user has limited access
      let departmentId: string | null = createSalesOrderDto.department_id;
      const user = this.request.user;
      if (!departmentId && user) {
        departmentId = this.departmentAccessService.getDefaultDepartmentForUser(user);
      }

      // Validate department access
      if (departmentId && user && !this.departmentAccessService.canAccessDepartment(user, departmentId)) {
        throw new ConflictException('You do not have access to create sales orders in this department');
      }

      // Create sales order (exclude items as they are handled separately)
      const { items: itemsData, ...salesOrderFields } = createSalesOrderDto;
      const salesOrderData: any = {
        ...salesOrderFields,
        department_id: departmentId,
        tenant_id: tenant_id,
        transaction_date: new Date(createSalesOrderDto.transaction_date),
        delivery_date: new Date(createSalesOrderDto.delivery_date),
      };

      if (createSalesOrderDto.customer_po_date) {
        salesOrderData.customer_po_date = new Date(
          createSalesOrderDto.customer_po_date,
        );
      }

      const salesOrder = this.salesOrderRepository.create(
        salesOrderData,
      ) as any as SalesOrder;

      // Calculate totals from items
      let total_qty = 0;
      let total = 0;
      let base_total = 0;
      let net_total = 0;
      let base_net_total = 0;

      const items = createSalesOrderDto.items.map((itemDto) => {
        const amount = itemDto.qty * itemDto.rate;
        const base_amount = amount * (salesOrder.conversion_rate || 1);
        const discount_amount =
          itemDto.discount_amount ||
          (amount * (itemDto.discount_percentage || 0)) / 100;
        const net_rate = itemDto.rate - discount_amount / itemDto.qty;
        const net_amount = amount - discount_amount;
        const base_net_amount = net_amount * (salesOrder.conversion_rate || 1);

        total_qty += itemDto.qty;
        total += amount;
        base_total += base_amount;
        net_total += net_amount;
        base_net_total += base_net_amount;

        return this.salesOrderItemRepository.create({
          ...itemDto,
          tenant_id: tenant_id,
          delivery_date: new Date(itemDto.delivery_date),
          amount,
          base_rate: itemDto.rate * (salesOrder.conversion_rate || 1),
          base_amount,
          discount_amount,
          net_rate,
          net_amount,
        });
      });

      // Update sales order totals
      salesOrder.total_qty = total_qty;
      salesOrder.base_total = base_total;
      salesOrder.base_net_total = base_net_total;
      salesOrder.grand_total = net_total; // Before taxes
      salesOrder.base_grand_total = base_net_total;

      try {
        const savedSalesOrder: SalesOrder =
          await this.salesOrderRepository.save(salesOrder);

        // Save items with sales_order_id
        const salesOrderItems = items.map((item) => ({
          ...item,
          sales_order_id: savedSalesOrder.id,
        }));

        await this.salesOrderItemRepository.save(salesOrderItems);

        return this.findOne(savedSalesOrder.id, tenant_id);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          throw new ConflictException(
            'Sales order with this name already exists',
          );
        }
        throw error;
      }
    } catch (outerError) {
      throw outerError;
    }
  }

  async findAll(
    query: SalesOrderQueryDto,
    tenant_id: string,
  ): Promise<{
    data: SalesOrder[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.createQueryBuilder(tenant_id);

    // Apply department-based filtering
    const user = this.request.user;
    if (user && !this.departmentAccessService.canAccessAllDepartments(user)) {
      const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(user);
      if (accessibleDepartments && accessibleDepartments.length > 0) {
        queryBuilder.andWhere('so.department_id IN (:...departmentIds)', {
          departmentIds: accessibleDepartments,
        });
      } else {
        // User has no department access, return empty result
        queryBuilder.andWhere('1 = 0');
      }
    }

    // Apply filters
    if (query.search) {
      queryBuilder.andWhere(
        '(so.name LIKE :search OR so.customer_name LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      queryBuilder.andWhere('so.status = :status', { status: query.status });
    }

    if (query.order_type) {
      queryBuilder.andWhere('so.order_type = :order_type', {
        order_type: query.order_type,
      });
    }

    if (query.customer_id) {
      queryBuilder.andWhere('so.customer_id = :customer_id', {
        customer_id: query.customer_id,
      });
    }

    if (query.sales_person) {
      queryBuilder.andWhere('so.sales_person = :sales_person', {
        sales_person: query.sales_person,
      });
    }

    if (query.territory) {
      queryBuilder.andWhere('so.territory = :territory', {
        territory: query.territory,
      });
    }

    if (query.from_date) {
      queryBuilder.andWhere('so.transaction_date >= :from_date', {
        from_date: query.from_date,
      });
    }

    if (query.to_date) {
      queryBuilder.andWhere('so.transaction_date <= :to_date', {
        to_date: query.to_date,
      });
    }

    if (query.from_delivery_date) {
      queryBuilder.andWhere('so.delivery_date >= :from_delivery_date', {
        from_delivery_date: query.from_delivery_date,
      });
    }

    if (query.to_delivery_date) {
      queryBuilder.andWhere('so.delivery_date <= :to_delivery_date', {
        to_delivery_date: query.to_delivery_date,
      });
    }

    // Apply sorting
    const sortBy = query.sort_by ?? 'creation';
    const sortOrder = query.sort_order ?? 'DESC';
    queryBuilder.orderBy(`so.${sortBy}`, sortOrder);

    // Apply pagination
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, tenant_id: string): Promise<SalesOrder> {
    const salesOrder = await this.salesOrderRepository.findOne({
      where: { id, tenant_id: tenant_id },
      relations: ['customer', 'items'],
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales order not found');
    }

    // Validate department access
    const user = this.request.user;
    if (user && salesOrder.department_id && !this.departmentAccessService.canAccessDepartment(user, salesOrder.department_id)) {
      throw new NotFoundException('Sales order not found');
    }

    // Provide backwards-compatible 'total' alias expected by tests/UI (mapped to grand_total)
    (salesOrder as unknown as { total: number; grand_total: number }).total = (
      salesOrder as unknown as { grand_total: number }
    ).grand_total;
    return salesOrder;
  }

  async getStats(tenant_id: string): Promise<any> {
    const queryBuilder = this.createQueryBuilder(tenant_id);

    // Get total count
    const total = await queryBuilder.getCount();

    // Get counts by status
    const draft = await this.createQueryBuilder(tenant_id)
      .andWhere('so.status = :status', { status: SalesOrderStatus.DRAFT })
      .getCount();

    const submitted = await this.createQueryBuilder(tenant_id)
      .andWhere('so.status = :status', {
        status: SalesOrderStatus.TO_DELIVER_AND_BILL,
      })
      .getCount();

    const cancelled = await this.createQueryBuilder(tenant_id)
      .andWhere('so.status = :status', { status: SalesOrderStatus.CANCELLED })
      .getCount();

    const closed = await this.createQueryBuilder(tenant_id)
      .andWhere('so.status = :status', { status: SalesOrderStatus.CLOSED })
      .getCount();

    const onHold = await this.createQueryBuilder(tenant_id)
      .andWhere('so.status = :status', { status: SalesOrderStatus.ON_HOLD })
      .getCount();

    // Get total value and calculate average
    const raw = await this.createQueryBuilder(tenant_id)
      .select('SUM(so.grand_total)', 'totalValue')
      .getRawOne<{ totalValue?: string }>();
    const totalValue = raw?.totalValue ? parseFloat(raw.totalValue) : 0;
    const averageValue = total > 0 ? totalValue / total : 0;

    return {
      total,
      draft,
      submitted,
      cancelled,
      closed,
      onHold,
      totalValue,
      averageValue,
    };
  }

  async update(
    id: string,
    updateSalesOrderDto: UpdateSalesOrderDto,
    tenant_id: string,
  ): Promise<SalesOrder> {
    const salesOrder = await this.findOne(id, tenant_id);

    // Check if sales order can be updated
    if (
      salesOrder.status === SalesOrderStatus.COMPLETED ||
      salesOrder.status === SalesOrderStatus.CANCELLED ||
      salesOrder.status === SalesOrderStatus.CLOSED
    ) {
      throw new BadRequestException(
        `Cannot update sales order with status: ${salesOrder.status}`,
      );
    }

    // If items are being updated, recalculate totals
    if (updateSalesOrderDto.items) {
      // Delete existing items
      await this.salesOrderItemRepository.delete({ sales_order_id: id });

      // Calculate new totals
      let total_qty = 0;
      // grand_total derived from net amounts (net_total)
      let base_total = 0;
      let net_total = 0;
      let base_net_total = 0;

      const conversion_rate =
        updateSalesOrderDto.conversion_rate || salesOrder.conversion_rate;

      const items = updateSalesOrderDto.items.map((itemDto) => {
        const amount = itemDto.qty * itemDto.rate;
        const base_amount = amount * conversion_rate;
        const discount_amount =
          itemDto.discount_amount ||
          (amount * (itemDto.discount_percentage || 0)) / 100;
        const net_rate = itemDto.rate - discount_amount / itemDto.qty;
        const net_amount = amount - discount_amount;
        const base_net_amount = net_amount * conversion_rate;

        total_qty += itemDto.qty;
        base_total += base_amount;
        net_total += net_amount;
        base_net_total += base_net_amount;

        return this.salesOrderItemRepository.create({
          ...itemDto,
          sales_order_id: id,
          tenant_id: tenant_id,
          delivery_date: new Date(itemDto.delivery_date),
          amount,
          base_rate: itemDto.rate * conversion_rate,
          base_amount,
          discount_amount,
          net_rate,
          net_amount,
        });
      });

      // Save new items
      await this.salesOrderItemRepository.save(items);

      // Update totals - only set properties that exist in the entity
      const totalsUpdate = {
        total_qty,
        base_total,
        base_net_total,
        grand_total: net_total,
        base_grand_total: base_net_total,
      };

      // Merge totals into update data
      Object.assign(updateSalesOrderDto, totalsUpdate);
    }

    // Update sales order
    const updateData = {
      ...updateSalesOrderDto,
      transaction_date: updateSalesOrderDto.transaction_date
        ? new Date(updateSalesOrderDto.transaction_date)
        : undefined,
      delivery_date: updateSalesOrderDto.delivery_date
        ? new Date(updateSalesOrderDto.delivery_date)
        : undefined,
      customer_po_date: updateSalesOrderDto.customer_po_date
        ? new Date(updateSalesOrderDto.customer_po_date)
        : undefined,
    };

    // Remove relational field to avoid accidental update attempts on one-to-many relation
    // (already handled by manual delete & re-insert logic above)
    delete (updateSalesOrderDto as any).items;

    // Merge fields into the loaded entity then save to leverage entity listeners and proper relation handling
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        (salesOrder as any)[key] = value;
      }
    });

    // Remove items relation to avoid TypeORM attempting to diff one-to-many when saving parent
    delete (salesOrder as any).items;
    await this.salesOrderRepository.save(salesOrder);
    const updated = await this.findOne(id, tenant_id);
    // Normalize numeric fields that might be serialized as strings by the driver
    if (updated && typeof (updated as any).conversion_rate === 'string') {
      (updated as any).conversion_rate = parseFloat(
        (updated as any).conversion_rate,
      );
    }
    if (updated && typeof (updated as any).total_qty === 'string') {
      (updated as any).total_qty = parseFloat((updated as any).total_qty);
    }
    if (updated && typeof (updated as any).total === 'string') {
      (updated as any).total = parseFloat((updated as any).total);
    }
    if (updated && typeof (updated as any).grand_total === 'string') {
      (updated as any).grand_total = parseFloat((updated as any).grand_total);
    }
    return updated;
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const salesOrder = await this.findOne(id, tenant_id);

    // Check if sales order can be deleted
    if (salesOrder.status !== SalesOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft sales orders can be deleted');
    }

    await this.salesOrderRepository.remove(salesOrder);
  }

  async submit(id: string, tenant_id: string): Promise<SalesOrder> {
    const salesOrder = await this.findOne(id, tenant_id);

    if (salesOrder.status !== SalesOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft sales orders can be submitted');
    }

    salesOrder.status = SalesOrderStatus.TO_DELIVER_AND_BILL;
    salesOrder.docstatus = 1; // Submitted
    await this.salesOrderRepository.save(salesOrder);

    return salesOrder;
  }

  async cancel(id: string, tenant_id: string): Promise<SalesOrder> {
    const salesOrder = await this.findOne(id, tenant_id);

    if (
      salesOrder.status === SalesOrderStatus.COMPLETED ||
      salesOrder.status === SalesOrderStatus.CANCELLED ||
      salesOrder.status === SalesOrderStatus.CLOSED
    ) {
      throw new BadRequestException(
        `Cannot cancel sales order with status: ${salesOrder.status}`,
      );
    }

    salesOrder.status = SalesOrderStatus.CANCELLED;
    salesOrder.docstatus = 2; // Cancelled
    await this.salesOrderRepository.save(salesOrder);

    return salesOrder;
  }

  async close(id: string, tenant_id: string): Promise<SalesOrder> {
    const salesOrder = await this.findOne(id, tenant_id);

    if (
      salesOrder.status === SalesOrderStatus.DRAFT ||
      salesOrder.status === SalesOrderStatus.CANCELLED ||
      salesOrder.status === SalesOrderStatus.CLOSED
    ) {
      throw new BadRequestException(
        `Cannot close sales order with status: ${salesOrder.status}`,
      );
    }

    salesOrder.status = SalesOrderStatus.CLOSED;
    await this.salesOrderRepository.save(salesOrder);

    return salesOrder;
  }

  async hold(id: string, tenant_id: string): Promise<SalesOrder> {
    const salesOrder = await this.findOne(id, tenant_id);

    if (
      salesOrder.status !== SalesOrderStatus.TO_DELIVER_AND_BILL &&
      salesOrder.status !== SalesOrderStatus.TO_DELIVER &&
      salesOrder.status !== SalesOrderStatus.TO_BILL
    ) {
      throw new BadRequestException(
        `Cannot hold sales order with status: ${salesOrder.status}`,
      );
    }

    salesOrder.status = SalesOrderStatus.ON_HOLD;
    await this.salesOrderRepository.save(salesOrder);

    return salesOrder;
  }

  async resume(id: string, tenant_id: string): Promise<SalesOrder> {
    const salesOrder = await this.findOne(id, tenant_id);

    if (salesOrder.status !== SalesOrderStatus.ON_HOLD) {
      throw new BadRequestException('Only sales orders on hold can be resumed');
    }

    // Determine the appropriate status to resume to
    salesOrder.status = SalesOrderStatus.TO_DELIVER_AND_BILL;
    await this.salesOrderRepository.save(salesOrder);

    return salesOrder;
  }

  private createQueryBuilder(
    tenant_id: string,
  ): SelectQueryBuilder<SalesOrder> {
    return this.salesOrderRepository
      .createQueryBuilder('so')
      .leftJoinAndSelect('so.customer', 'customer')
      .where('so.tenant_id = :tenant_id', { tenant_id });
  }
}
