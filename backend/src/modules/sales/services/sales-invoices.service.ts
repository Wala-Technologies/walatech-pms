import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Scope,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { SalesInvoice, SalesInvoiceStatus } from '../../../entities/sales-invoice.entity';
import { SalesInvoiceItem } from '../../../entities/sales-invoice-item.entity';
import { Customer } from '../../../entities/customer.entity';
import { Item } from '../../../entities/item.entity';
import { CreateSalesInvoiceDto } from '../dto/create-sales-invoice.dto';
import { UpdateSalesInvoiceDto } from '../dto/update-sales-invoice.dto';
import { DepartmentAccessService } from '../../../common/services/department-access.service';

@Injectable({ scope: Scope.REQUEST })
export class SalesInvoicesService {
  constructor(
    @InjectRepository(SalesInvoice)
    private salesInvoiceRepository: Repository<SalesInvoice>,
    @InjectRepository(SalesInvoiceItem)
    private salesInvoiceItemRepository: Repository<SalesInvoiceItem>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    private dataSource: DataSource,
    private readonly departmentAccessService: DepartmentAccessService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(
    createSalesInvoiceDto: CreateSalesInvoiceDto,
    tenant_id: string,
    userId: string,
  ): Promise<SalesInvoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate customer exists
      const customer = await this.customerRepository.findOne({
        where: { id: createSalesInvoiceDto.customer_id, tenant_id: tenant_id },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      // Validate items exist
      const itemCodes = createSalesInvoiceDto.items.map(item => item.item_code);
      const items = await this.itemRepository.find({
        where: itemCodes.map(code => ({ code: code, tenant_id: tenant_id })),
      });

      if (items.length !== itemCodes.length) {
        const foundCodes = items.map(item => item.code);
        const missingCodes = itemCodes.filter(code => !foundCodes.includes(code));
        throw new BadRequestException(`Items not found: ${missingCodes.join(', ')}`);
      }

      // Generate invoice name if not provided
      const invoiceName = createSalesInvoiceDto.name || await this.generateInvoiceName(tenant_id, queryRunner);

      // Check if invoice name already exists
      const existingInvoice = await queryRunner.manager.findOne(SalesInvoice, {
        where: { name: invoiceName, tenant_id: tenant_id },
      });

      if (existingInvoice) {
        throw new ConflictException(`Sales Invoice with name ${invoiceName} already exists`);
      }

      // Calculate totals
      const { calculatedTotals, itemsWithCalculations } = this.calculateTotals(
        createSalesInvoiceDto.items,
        createSalesInvoiceDto.currency || 'USD',
        createSalesInvoiceDto.conversion_rate || 1,
      );

      // Create sales invoice
      const salesInvoice = queryRunner.manager.create(SalesInvoice, {
        ...createSalesInvoiceDto,
        name: invoiceName,
        tenant_id: tenant_id,
        customer_name: customer.customer_name,
        posting_date: new Date(createSalesInvoiceDto.posting_date),
        due_date: createSalesInvoiceDto.due_date ? new Date(createSalesInvoiceDto.due_date) : null,
        po_date: createSalesInvoiceDto.po_date ? new Date(createSalesInvoiceDto.po_date) : null,
        currency: createSalesInvoiceDto.currency || 'USD',
        conversion_rate: createSalesInvoiceDto.conversion_rate || 1,
        status: createSalesInvoiceDto.status || SalesInvoiceStatus.DRAFT,
        docstatus: 0, // Draft
        created_by: userId,
        modified_by: userId,
        ...calculatedTotals,
      });

      const savedInvoice = await queryRunner.manager.save(SalesInvoice, salesInvoice);

      // Create sales invoice items
      const salesInvoiceItems = itemsWithCalculations.map((itemDto, index) => {
        const item = items.find(i => i.code === itemDto.item_code);
        return queryRunner.manager.create(SalesInvoiceItem, {
          ...itemDto,
          tenant_id: tenant_id,
          sales_invoice_id: savedInvoice.id,
          item_name: item?.name || itemDto.item_name,
          description: item?.description || itemDto.description,
          stock_uom: item?.stockUom || itemDto.uom,
            uom: itemDto.uom || item?.stockUom,
          conversion_factor: 1,
          stock_qty: itemDto.qty,
          idx: index + 1,
          docstatus: 0,
          created_by: userId,
          modified_by: userId,
        });
      });

      await queryRunner.manager.save(SalesInvoiceItem, salesInvoiceItems);

      await queryRunner.commitTransaction();

      // Return the complete invoice with items
      return this.findOne(savedInvoice.id, tenant_id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    tenant_id: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: SalesInvoiceStatus,
    customerId?: string,
  ): Promise<{ data: SalesInvoice[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.salesInvoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('invoice.tenant_id = :tenant_id', { tenant_id })
      .orderBy('invoice.created_at', 'DESC');

    // Apply department-based filtering
    const user = this.request.user;
    if (user && !this.departmentAccessService.canAccessAllDepartments(user)) {
      const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(user);
      if (accessibleDepartments && accessibleDepartments.length > 0) {
        queryBuilder.andWhere('invoice.department_id IN (:...departmentIds)', {
          departmentIds: accessibleDepartments,
        });
      } else {
        // User has no department access, return empty result
        return { data: [], total: 0, page, limit };
      }
    }

    if (status) {
      queryBuilder.andWhere('invoice.status = :status', { status });
    }

    if (customerId) {
      queryBuilder.andWhere('invoice.customer_id = :customerId', { customerId });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string, tenant_id: string, userId: string): Promise<SalesInvoice> {
    const invoice = await this.salesInvoiceRepository.findOne({
      where: { id, tenant_id: tenant_id },
      relations: ['customer', 'items', 'items.item'],
    });

    if (!invoice) {
      throw new NotFoundException(`Sales Invoice with ID ${id} not found`);
    }

    // Check if user has access to the invoice's department
    if (invoice.department_id && this.request.user) {
      const hasAccess = this.departmentAccessService.canAccessDepartment(this.request.user, invoice.department_id);
      if (!hasAccess) {
        throw new NotFoundException(`Sales Invoice with ID ${id} not found`);
      }
    }

    return invoice;
  }

  async update(
    id: string,
    updateSalesInvoiceDto: UpdateSalesInvoiceDto,
    tenant_id: string,
    userId: string,
  ): Promise<SalesInvoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invoice = await queryRunner.manager.findOne(SalesInvoice, {
        where: { id, tenant_id: tenant_id },
        relations: ['items'],
      });

      if (!invoice) {
        throw new NotFoundException('Sales Invoice not found');
      }

      // Check if invoice can be updated (only draft invoices can be updated)
      if (invoice.docstatus !== 0) {
        throw new BadRequestException('Only draft invoices can be updated');
      }

      // Customer cannot be changed after creation (omitted from UpdateSalesInvoiceDto)

      // Handle items update if provided
      if (updateSalesInvoiceDto.items) {
        // Validate items exist
        const itemCodes = updateSalesInvoiceDto.items.map(item => item.item_code);
        const items = await this.itemRepository.find({
          where: itemCodes.map(code => ({ code: code, tenant_id: tenant_id })),
        });

        if (items.length !== itemCodes.length) {
          const foundCodes = items.map(item => item.code);
          const missingCodes = itemCodes.filter(code => !foundCodes.includes(code));
          throw new BadRequestException(`Items not found: ${missingCodes.join(', ')}`);
        }

        // Delete existing items
        await queryRunner.manager.delete(SalesInvoiceItem, {
          sales_invoice_id: id,
          tenant_id: tenant_id,
        });

        // Calculate totals for new items
        const { calculatedTotals, itemsWithCalculations } = this.calculateTotals(
          updateSalesInvoiceDto.items,
          updateSalesInvoiceDto.currency || invoice.currency,
          updateSalesInvoiceDto.conversion_rate || invoice.conversion_rate,
        );

        // Create new items
        const salesInvoiceItems = itemsWithCalculations.map((itemDto, index) => {
          const item = items.find(i => i.code === itemDto.item_code);
          return queryRunner.manager.create(SalesInvoiceItem, {
            ...itemDto,
            tenant_id: tenant_id,
            sales_invoice_id: id,
            item_name: item?.name || itemDto.item_name,
            description: item?.description || itemDto.description,
            stock_uom: item?.stockUom || itemDto.uom,
            uom: itemDto.uom || item?.stockUom,
            conversion_factor: 1,
            stock_qty: itemDto.qty,
            idx: index + 1,
            docstatus: 0,
            modified_by: userId,
          });
        });

        await queryRunner.manager.save(SalesInvoiceItem, salesInvoiceItems);

        // Update totals
        Object.assign(updateSalesInvoiceDto, calculatedTotals);
      }

      // Update invoice
      await queryRunner.manager.update(SalesInvoice, { id, tenant_id: tenant_id }, {
        ...updateSalesInvoiceDto,
        due_date: updateSalesInvoiceDto.due_date ? new Date(updateSalesInvoiceDto.due_date) : undefined,
        po_date: updateSalesInvoiceDto.po_date ? new Date(updateSalesInvoiceDto.po_date) : undefined,
        modified_by: userId,
      });

      await queryRunner.commitTransaction();

      return this.findOne(id, tenant_id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const invoice = await this.salesInvoiceRepository.findOne({
      where: { id, tenant_id: tenant_id },
    });

    if (!invoice) {
      throw new NotFoundException('Sales Invoice not found');
    }

    // Check if invoice can be deleted (only draft invoices can be deleted)
    if (invoice.docstatus !== 0) {
      throw new BadRequestException('Only draft invoices can be deleted');
    }

    await this.salesInvoiceRepository.remove(invoice);
  }

  async submit(id: string, tenant_id: string, userId: string): Promise<SalesInvoice> {
    const invoice = await this.salesInvoiceRepository.findOne({
      where: { id, tenant_id: tenant_id },
      relations: ['items'],
    });

    if (!invoice) {
      throw new NotFoundException('Sales Invoice not found');
    }

    if (invoice.docstatus !== 0) {
      throw new BadRequestException('Only draft invoices can be submitted');
    }

    if (!invoice.items || invoice.items.length === 0) {
      throw new BadRequestException('Cannot submit invoice without items');
    }

    // Update status and docstatus
    await this.salesInvoiceRepository.update(
      { id, tenant_id: tenant_id },
      {
        docstatus: 1,
        status: SalesInvoiceStatus.SUBMITTED,
        outstanding_amount: invoice.grand_total,
        modified_by: userId,
      },
    );

    // Update items docstatus
    await this.salesInvoiceItemRepository.update(
      { sales_invoice_id: id, tenant_id: tenant_id },
      { docstatus: 1, modified_by: userId },
    );

    return this.findOne(id, tenant_id, userId);
  }

  async cancel(id: string, tenant_id: string, userId: string): Promise<SalesInvoice> {
    const invoice = await this.salesInvoiceRepository.findOne({
      where: { id, tenant_id: tenant_id },
    });

    if (!invoice) {
      throw new NotFoundException('Sales Invoice not found');
    }

    if (invoice.docstatus !== 1) {
      throw new BadRequestException('Only submitted invoices can be cancelled');
    }

    // Update status and docstatus
    await this.salesInvoiceRepository.update(
      { id, tenant_id: tenant_id },
      {
        docstatus: 2,
        status: SalesInvoiceStatus.CANCELLED,
        modified_by: userId,
      },
    );

    // Update items docstatus
    await this.salesInvoiceItemRepository.update(
      { sales_invoice_id: id, tenant_id: tenant_id },
      { docstatus: 2, modified_by: userId },
    );

    return this.findOne(id, tenant_id, userId);
  }

  private calculateTotals(
    items: any[],
    currency: string,
    conversionRate: number,
  ): { calculatedTotals: any; itemsWithCalculations: any[] } {
    let totalQty = 0;
    let baseTotal = 0;
    let total = 0;

    const itemsWithCalculations = items.map(item => {
      const qty = item.qty || 0;
      const rate = item.rate || 0;
      const discountPercentage = item.discount_percentage || 0;
      const discountAmount = item.discount_amount || 0;

      // Calculate amount before discount
      let amount = qty * rate;

      // Apply discount
      if (discountPercentage > 0) {
        amount = amount * (1 - discountPercentage / 100);
      } else if (discountAmount > 0) {
        amount = amount - discountAmount;
      }

      const baseAmount = amount * conversionRate;
      const netAmount = amount;
      const baseNetAmount = baseAmount;

      totalQty += qty;
      baseTotal += baseAmount;
      total += amount;

      return {
        ...item,
        amount,
        base_amount: baseAmount,
        net_amount: netAmount,
        base_net_amount: baseNetAmount,
        net_rate: rate,
        base_net_rate: rate * conversionRate,
        base_rate: rate * conversionRate,
      };
    });

    const calculatedTotals = {
      total_qty: totalQty,
      base_total: baseTotal,
      total: total,
      base_net_total: baseTotal,
      net_total: total,
      base_grand_total: baseTotal,
      grand_total: total,
      outstanding_amount: total,
    };

    return { calculatedTotals, itemsWithCalculations };
  }

  private async generateInvoiceName(tenant_id: string, queryRunner: QueryRunner): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SINV-${year}-`;

    const lastInvoice = await queryRunner.manager
      .createQueryBuilder(SalesInvoice, 'invoice')
      .where('invoice.tenant_id = :tenant_id', { tenant_id })
      .andWhere('invoice.name LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('invoice.name', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.name.replace(prefix, ''));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }
}