import { Injectable, NotFoundException, ConflictException, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { SupplierQuotation } from '../../../entities/supplier-quotation.entity';
import { SupplierQuotationItem } from '../../../entities/supplier-quotation.entity';
import { Supplier } from '../../../entities/supplier.entity';
import { CreateSupplierQuotationDto } from '../dto/create-supplier-quotation.dto';
import { UpdateSupplierQuotationDto } from '../dto/update-supplier-quotation.dto';

@Injectable({ scope: Scope.REQUEST })
export class SupplierQuotationsService {
  constructor(
    @InjectRepository(SupplierQuotation)
    private quotationRepository: Repository<SupplierQuotation>,
    @InjectRepository(SupplierQuotationItem)
    private quotationItemRepository: Repository<SupplierQuotationItem>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @Inject(REQUEST) private request: any,
  ) {}

  private get tenant_id(): string {
    return this.request.tenant_id || this.request.user?.tenant_id;
  }

  async create(createQuotationDto: CreateSupplierQuotationDto): Promise<SupplierQuotation> {
    // Validate supplier exists
    const supplier = await this.supplierRepository.findOne({
      where: {
        id: createQuotationDto.supplier_id,
        tenant_id: this.tenant_id,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Generate quotation number if not provided
    let quotationNumber = createQuotationDto.quotation_number;
    if (!quotationNumber) {
      quotationNumber = await this.generateQuotationNumber();
    } else {
      // Check if quotation number is unique
      const existingQuotation = await this.quotationRepository.findOne({
        where: {
          quotation_number: quotationNumber,
          tenant_id: this.tenant_id,
        },
      });

      if (existingQuotation) {
        throw new ConflictException('Quotation number already exists');
      }
    }

    // Create quotation
    const quotation = this.quotationRepository.create({
      ...createQuotationDto,
      quotation_number: quotationNumber,
      tenant_id: this.tenant_id,
      owner: this.request.user?.email || 'system',
    });

    const savedQuotation = await this.quotationRepository.save(quotation);

    // Create quotation items
    if (createQuotationDto.items && createQuotationDto.items.length > 0) {
      const items = createQuotationDto.items.map(itemDto => {
        const amount = itemDto.qty * itemDto.rate;
        const discountAmount = itemDto.discount_percentage 
          ? (amount * itemDto.discount_percentage) / 100 
          : (itemDto.discount_amount || 0);
        const netAmount = amount - discountAmount;

        return this.quotationItemRepository.create({
          ...itemDto,
          amount,
          discount_amount: discountAmount,
          net_amount: netAmount,
          quotation_id: savedQuotation.id,
          tenant_id: this.tenant_id,
          owner: this.request.user?.email || 'system',
        });
      });

      await this.quotationItemRepository.save(items);

      // Update quotation totals
      await this.updateQuotationTotals(savedQuotation.id);
    }

    return this.findOne(savedQuotation.id);
  }

  async findAll(query: any = {}): Promise<{ quotations: SupplierQuotation[]; total: number }> {
    const { page = 1, limit = 10, search, status, supplier_id, ...filters } = query;
    const skip = (page - 1) * limit;

    const queryBuilder: SelectQueryBuilder<SupplierQuotation> = this.quotationRepository
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.supplier', 'supplier')
      .leftJoinAndSelect('quotation.items', 'items')
      .where('quotation.tenant_id = :tenant_id', { tenant_id: this.tenant_id });

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(quotation.quotation_number LIKE :search OR supplier.supplier_name LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
    if (status) {
      queryBuilder.andWhere('quotation.status = :status', { status });
    }

    if (supplier_id) {
      queryBuilder.andWhere('quotation.supplier_id = :supplier_id', { supplier_id });
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryBuilder.andWhere(`quotation.${key} = :${key}`, { [key]: value });
      }
    });

    // Apply sorting
    queryBuilder.orderBy('quotation.quotation_date', 'DESC');

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [quotations, total] = await queryBuilder.getManyAndCount();

    return { quotations, total };
  }

  async findOne(id: string): Promise<SupplierQuotation> {
    const quotation = await this.quotationRepository.findOne({
      where: { id, tenant_id: this.tenant_id },
      relations: ['supplier', 'items'],
    });

    if (!quotation) {
      throw new NotFoundException('Supplier quotation not found');
    }

    return quotation;
  }

  async update(id: string, updateQuotationDto: UpdateSupplierQuotationDto): Promise<SupplierQuotation> {
    const quotation = await this.findOne(id);

    // Check if quotation can be updated
    if (quotation.status === 'Ordered' || quotation.status === 'Cancelled') {
      throw new ConflictException(`Cannot update quotation with status: ${quotation.status}`);
    }

    // Validate supplier if being updated
    if (updateQuotationDto.supplier_id && updateQuotationDto.supplier_id !== quotation.supplier_id) {
      const supplier = await this.supplierRepository.findOne({
        where: {
          id: updateQuotationDto.supplier_id,
          tenant_id: this.tenant_id,
        },
      });

      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    // Check quotation number uniqueness if being updated
    if (updateQuotationDto.quotation_number && 
        updateQuotationDto.quotation_number !== quotation.quotation_number) {
      const existingQuotation = await this.quotationRepository.findOne({
        where: {
          quotation_number: updateQuotationDto.quotation_number,
          tenant_id: this.tenant_id,
        },
      });

      if (existingQuotation && existingQuotation.id !== id) {
        throw new ConflictException('Quotation number already exists');
      }
    }

    // Update quotation
    Object.assign(quotation, updateQuotationDto);
    quotation.modified_by = this.request.user?.email || 'system';

    // Update items if provided
    if (updateQuotationDto.items) {
      // Remove existing items
      await this.quotationItemRepository.delete({
        quotation_id: id,
        tenant_id: this.tenant_id,
      });

      // Create new items
      if (updateQuotationDto.items.length > 0) {
        const items = updateQuotationDto.items.map(itemDto => {
          const amount = itemDto.qty * itemDto.rate;
          const discountAmount = itemDto.discount_percentage 
            ? (amount * itemDto.discount_percentage) / 100 
            : (itemDto.discount_amount || 0);
          const netAmount = amount - discountAmount;

          return this.quotationItemRepository.create({
            ...itemDto,
            amount,
            discount_amount: discountAmount,
            net_amount: netAmount,
            quotation_id: id,
            tenant_id: this.tenant_id,
            owner: this.request.user?.email || 'system',
          });
        });

        await this.quotationItemRepository.save(items);
      }

      // Update quotation totals
      await this.updateQuotationTotals(id);
    }

    await this.quotationRepository.save(quotation);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const quotation = await this.findOne(id);

    // Check if quotation can be deleted
    if (quotation.status === 'Ordered') {
      throw new ConflictException('Cannot delete quotation that has been ordered');
    }

    // Remove items first
    await this.quotationItemRepository.delete({
      quotation_id: id,
      tenant_id: this.tenant_id,
    });

    // Remove quotation
    await this.quotationRepository.remove(quotation);
  }

  async updateStatus(id: string, status: string): Promise<SupplierQuotation> {
    const quotation = await this.findOne(id);

    // Validate status transition
    const validTransitions = {
      'Draft': ['Submitted', 'Cancelled'],
      'Submitted': ['Ordered', 'Cancelled', 'Expired'],
      'Ordered': [], // Cannot change from ordered
      'Cancelled': [], // Cannot change from cancelled
      'Expired': ['Submitted'], // Can resubmit expired quotations
    };

    const allowedStatuses = validTransitions[quotation.status] || [];
    if (!allowedStatuses.includes(status)) {
      throw new ConflictException(`Cannot change status from ${quotation.status} to ${status}`);
    }

    quotation.status = status;
    quotation.modified_by = this.request.user?.email || 'system';

    return this.quotationRepository.save(quotation);
  }

  async getQuotationStats(): Promise<{
    total: number;
    byStatus: { [key: string]: number };
    bySupplier: { [key: string]: number };
    totalValue: number;
    averageValue: number;
  }> {
    const queryBuilder = this.quotationRepository
      .createQueryBuilder('quotation')
      .leftJoin('quotation.supplier', 'supplier')
      .where('quotation.tenant_id = :tenant_id', { tenant_id: this.tenant_id });

    const total = await queryBuilder.getCount();

    // Get stats by status
    const statusStats = await queryBuilder
      .clone()
      .select('quotation.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('quotation.status')
      .getRawMany();

    const byStatus = statusStats.reduce((acc, stat) => {
      acc[stat.status || 'Unknown'] = parseInt(stat.count);
      return acc;
    }, {});

    // Get stats by supplier
    const supplierStats = await queryBuilder
      .clone()
      .select('supplier.supplier_name', 'supplier_name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('supplier.supplier_name')
      .getRawMany();

    const bySupplier = supplierStats.reduce((acc, stat) => {
      acc[stat.supplier_name || 'Unknown'] = parseInt(stat.count);
      return acc;
    }, {});

    // Get value stats
    const valueStats = await queryBuilder
      .clone()
      .select('SUM(quotation.grand_total)', 'total_value')
      .addSelect('AVG(quotation.grand_total)', 'average_value')
      .getRawOne();

    return {
      total,
      byStatus,
      bySupplier,
      totalValue: parseFloat(valueStats.total_value) || 0,
      averageValue: parseFloat(valueStats.average_value) || 0,
    };
  }

  async compareQuotations(quotationIds: string[]): Promise<{
    quotations: SupplierQuotation[];
    comparison: any;
  }> {
    if (quotationIds.length < 2) {
      throw new ConflictException('At least 2 quotations are required for comparison');
    }

    const quotations = await Promise.all(
      quotationIds.map(id => this.findOne(id))
    );

    // Build comparison data
    const comparison = {
      suppliers: quotations.map(q => ({
        id: q.supplier.id,
        name: q.supplier.supplier_name,
        quotation_id: q.id,
        quotation_number: q.quotation_number,
        total: q.grand_total,
        currency: q.currency,
        valid_till: q.valid_till,
      })),
      items: this.buildItemComparison(quotations),
    };

    return { quotations, comparison };
  }

  private buildItemComparison(quotations: SupplierQuotation[]): any {
    const itemMap = new Map<string, any>();

    quotations.forEach(quotation => {
      quotation.items.forEach(item => {
        const key = item.item_code;
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            item_code: item.item_code,
            item_name: item.item_name,
            suppliers: {},
          });
        }

        const itemData = itemMap.get(key);
        itemData.suppliers[quotation.supplier.supplier_name] = {
          qty: item.qty,
          rate: item.rate,
          amount: item.amount,
          discount_percentage: item.discount_percentage,
          net_amount: item.net_amount,
          expected_delivery_date: item.expected_delivery_date,
        };
      });
    });

    return Array.from(itemMap.values());
  }

  private async generateQuotationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SQ-${year}-`;
    
    const lastQuotation = await this.quotationRepository
      .createQueryBuilder('quotation')
      .where('quotation.quotation_number LIKE :prefix', { prefix: `${prefix}%` })
      .andWhere('quotation.tenant_id = :tenant_id', { tenant_id: this.tenant_id })
      .orderBy('quotation.quotation_number', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastQuotation) {
      const lastNumber = parseInt(lastQuotation.quotation_number.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  private async updateQuotationTotals(quotationId: string): Promise<void> {
    const items = await this.quotationItemRepository.find({
      where: {
        quotation_id: quotationId,
        tenant_id: this.tenant_id,
      },
    });

    const base_net_total = items.reduce((sum, item) => sum + (item.net_amount || 0), 0);
    const total_taxes_and_charges = 0; // This would be calculated based on tax templates
    const grand_total = base_net_total + total_taxes_and_charges;

    await this.quotationRepository.update(
      { id: quotationId, tenant_id: this.tenant_id },
      {
        base_net_total,
        total_taxes_and_charges,
        grand_total,
        modified_by: this.request.user?.email || 'system',
      }
    );
  }
}