import { Injectable, NotFoundException, BadRequestException, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Quotation } from '../../../entities/quotation.entity';
import { QuotationItem } from '../../../entities/quotation-item.entity';
import { Customer } from '../../../entities/customer.entity';
import { Item } from '../../../entities/item.entity';
import { DepartmentAccessService } from '../../../common/services/department-access.service';

export interface CreateQuotationDto {
  party_name: string;
  customer_name: string;
  transaction_date: string;
  valid_till: string;
  quotation_to?: string;
  order_type?: string;
  currency?: string;
  conversion_rate?: number;
  selling_price_list?: string;
  terms?: string;
  department_id: string;
  items: CreateQuotationItemDto[];
}

export interface CreateQuotationItemDto {
  item_code: string;
  item_name: string;
  description?: string;
  qty: number;
  rate: number;
  uom?: string;
  stock_uom?: string;
  conversion_factor?: number;
  discount_percentage?: number;
  discount_amount?: number;
  warehouse?: string;
}

@Injectable({ scope: Scope.REQUEST })
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    @InjectRepository(QuotationItem)
    private quotationItemRepository: Repository<QuotationItem>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    private readonly departmentAccessService: DepartmentAccessService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(createQuotationDto: CreateQuotationDto, tenant_id: string, userId: string): Promise<Quotation> {
    // Validate customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: createQuotationDto.party_name, tenant_id: tenant_id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${createQuotationDto.party_name} not found`);
    }

    // Validate items exist
    for (const itemDto of createQuotationDto.items) {
      const item = await this.itemRepository.findOne({
        where: { code: itemDto.item_code, tenant_id: tenant_id },
      });

      if (!item) {
        throw new NotFoundException(`Item with code ${itemDto.item_code} not found`);
      }
    }

    // Generate quotation name
    const quotationName = await this.generateQuotationName(tenant_id);

    // Create quotation
    const quotation = this.quotationRepository.create({
      name: quotationName,
      title: createQuotationDto.customer_name,
      quotation_to: createQuotationDto.quotation_to || 'Customer',
      party_name: createQuotationDto.party_name,
      customer_name: createQuotationDto.customer_name,
      transaction_date: new Date(createQuotationDto.transaction_date),
      valid_till: new Date(createQuotationDto.valid_till),
      order_type: createQuotationDto.order_type || 'Sales',
      currency: createQuotationDto.currency || 'ETB',
      conversion_rate: createQuotationDto.conversion_rate || 1,
      selling_price_list: createQuotationDto.selling_price_list,
      terms: createQuotationDto.terms,
      department_id: createQuotationDto.department_id,
      status: 'Draft',
      tenant_id: tenant_id,
      created_by: userId,
      modified_by: userId,
    });

    const savedQuotation = await this.quotationRepository.save(quotation);

    // Create quotation items
    const quotationItems = createQuotationDto.items.map((itemDto, index) => {
      const amount = itemDto.qty * itemDto.rate;
      const discountAmount = itemDto.discount_amount || (amount * (itemDto.discount_percentage || 0)) / 100;
      const netAmount = amount - discountAmount;

      return this.quotationItemRepository.create({
        name: `${quotationName}-${index + 1}`,
        item_code: itemDto.item_code,
        item_name: itemDto.item_name,
        description: itemDto.description,
        qty: itemDto.qty,
        rate: itemDto.rate,
        amount: amount,
        net_amount: netAmount,
        uom: itemDto.uom || 'Nos',
        stock_uom: itemDto.stock_uom || 'Nos',
        conversion_factor: itemDto.conversion_factor || 1,
        discount_percentage: itemDto.discount_percentage || 0,
        discount_amount: discountAmount,
        warehouse: itemDto.warehouse,
        parent: quotationName,
        parentfield: 'items',
        parenttype: 'Quotation',
        idx: index + 1,
        tenant_id: tenant_id,
        created_by: userId,
        modified_by: userId,
      });
    });

    await this.quotationItemRepository.save(quotationItems);

    // Calculate and update totals
    await this.calculateTotals(savedQuotation.id, tenant_id);

    return this.findOne(savedQuotation.id, tenant_id, userId);
  }

  async findAll(tenant_id: string, page: number = 1, limit: number = 10): Promise<{ data: Quotation[]; total: number }> {
    const queryBuilder = this.quotationRepository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.items', 'items')
      .where('q.tenant_id = :tenant_id', { tenant_id })
      .orderBy('q.created_at', 'DESC');

    // Apply department-based filtering
    const user = this.request.user;
    if (user && !this.departmentAccessService.canAccessAllDepartments(user)) {
      const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(user);
      if (accessibleDepartments && accessibleDepartments.length > 0) {
        queryBuilder.andWhere('q.department_id IN (:...departmentIds)', {
          departmentIds: accessibleDepartments,
        });
      } else {
        // User has no department access, return empty result
        queryBuilder.andWhere('1 = 0');
      }
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string, tenant_id: string, userId?: string): Promise<Quotation> {
    const quotation = await this.quotationRepository.findOne({
      where: { id, tenant_id: tenant_id },
      relations: ['items'],
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    // Validate department access
    const user = this.request.user;
    if (user && quotation.department_id && !this.departmentAccessService.canAccessDepartment(user, quotation.department_id)) {
      throw new NotFoundException('Quotation not found');
    }

    return quotation;
  }

  async update(id: string, updateQuotationDto: Partial<CreateQuotationDto>, tenant_id: string, userId: string): Promise<Quotation> {
    const quotation = await this.findOne(id, tenant_id, userId);

    if (quotation.status !== 'Draft') {
      throw new BadRequestException('Cannot update submitted quotation');
    }

    // Update quotation fields
    Object.assign(quotation, {
      ...updateQuotationDto,
      transaction_date: updateQuotationDto.transaction_date ? new Date(updateQuotationDto.transaction_date) : quotation.transaction_date,
      valid_till: updateQuotationDto.valid_till ? new Date(updateQuotationDto.valid_till) : quotation.valid_till,
      modified_by: userId,
    });

    await this.quotationRepository.save(quotation);

    // Update items if provided
    if (updateQuotationDto.items) {
      // Remove existing items
      await this.quotationItemRepository.delete({ parent: quotation.name });

      // Create new items
      const quotationItems = updateQuotationDto.items.map((itemDto, index) => {
        const amount = itemDto.qty * itemDto.rate;
        const discountAmount = itemDto.discount_amount || (amount * (itemDto.discount_percentage || 0)) / 100;
        const netAmount = amount - discountAmount;

        return this.quotationItemRepository.create({
          name: `${quotation.name}-${index + 1}`,
          item_code: itemDto.item_code,
          item_name: itemDto.item_name,
          description: itemDto.description,
          qty: itemDto.qty,
          rate: itemDto.rate,
          amount: amount,
          net_amount: netAmount,
          uom: itemDto.uom || 'Nos',
          stock_uom: itemDto.stock_uom || 'Nos',
          conversion_factor: itemDto.conversion_factor || 1,
          discount_percentage: itemDto.discount_percentage || 0,
          discount_amount: discountAmount,
          warehouse: itemDto.warehouse,
          parent: quotation.name,
          parentfield: 'items',
          parenttype: 'Quotation',
          idx: index + 1,
          tenant_id: tenant_id,
          created_by: userId,
          modified_by: userId,
        });
      });

      await this.quotationItemRepository.save(quotationItems);
      await this.calculateTotals(id, tenant_id);
    }

    return this.findOne(id, tenant_id, userId);
  }

  async remove(id: string, tenant_id: string, userId: string): Promise<void> {
    const quotation = await this.findOne(id, tenant_id, userId);

    if (quotation.status !== 'Draft') {
      throw new BadRequestException('Cannot delete submitted quotation');
    }

    await this.quotationItemRepository.delete({ parent: quotation.name });
    await this.quotationRepository.remove(quotation);
  }

  async submit(id: string, tenant_id: string, userId: string): Promise<Quotation> {
    const quotation = await this.findOne(id, tenant_id, userId);

    if (quotation.status !== 'Draft') {
      throw new BadRequestException('Quotation is already submitted');
    }

    quotation.status = 'Submitted';
    quotation.docstatus = 1;
    quotation.modified_by = userId;

    await this.quotationRepository.save(quotation);
    return quotation;
  }

  async cancel(id: string, tenant_id: string, userId: string): Promise<Quotation> {
    const quotation = await this.findOne(id, tenant_id, userId);

    if (quotation.status === 'Draft') {
      throw new BadRequestException('Cannot cancel draft quotation');
    }

    quotation.status = 'Cancelled';
    quotation.docstatus = 2;
    quotation.modified_by = userId;

    await this.quotationRepository.save(quotation);
    return quotation;
  }

  private async generateQuotationName(tenant_id: string): Promise<string> {
    const count = await this.quotationRepository.count({
      where: { tenant_id: tenant_id },
    });

    const currentYear = new Date().getFullYear();
    return `QTN-${currentYear}-${String(count + 1).padStart(5, '0')}`;
  }

  private async calculateTotals(quotationId: string, tenant_id: string): Promise<void> {
    const quotation = await this.quotationRepository.findOne({
      where: { id: quotationId, tenant_id: tenant_id },
      relations: ['items'],
    });

    if (!quotation) return;

    const totalQty = quotation.items.reduce((sum, item) => sum + item.qty, 0);
    const baseTotal = quotation.items.reduce((sum, item) => sum + item.amount, 0);
    const baseNetTotal = quotation.items.reduce((sum, item) => sum + item.net_amount, 0);

    quotation.total_qty = totalQty;
    quotation.base_total = baseTotal;
    quotation.base_net_total = baseNetTotal;
    quotation.total = baseTotal;
    quotation.net_total = baseNetTotal;
    quotation.base_grand_total = baseNetTotal;
    quotation.grand_total = baseNetTotal;

    await this.quotationRepository.save(quotation);
  }
}