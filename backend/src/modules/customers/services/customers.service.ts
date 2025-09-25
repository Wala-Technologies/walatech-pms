import { Injectable, NotFoundException, ConflictException, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Customer } from '../../../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerQueryDto } from '../dto/customer-query.dto';

@Injectable({ scope: Scope.REQUEST })
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @Inject(REQUEST) private request: any,
  ) {}

  private get tenantId(): string {
    return this.request.tenant_id || this.request.user?.tenant_id;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Check if customer with same name already exists for this tenant
    const existingCustomer = await this.customerRepository.findOne({
      where: {
        customer_name: createCustomerDto.customer_name,
        tenant_id: this.tenantId,
      },
    });

    if (existingCustomer) {
      throw new ConflictException('Customer with this name already exists');
    }

    // Check if customer code is provided and unique
    if (createCustomerDto.customer_code) {
      const existingCode = await this.customerRepository.findOne({
        where: {
          customer_code: createCustomerDto.customer_code,
          tenant_id: this.tenantId,
        },
      });

      if (existingCode) {
        throw new ConflictException('Customer with this code already exists');
      }
    }

    const customer = this.customerRepository.create({
      ...createCustomerDto,
      tenant_id: this.tenantId,
      owner: this.request.user?.email || 'system',
    });

    return this.customerRepository.save(customer);
  }

  async findAll(query: CustomerQueryDto): Promise<{ customers: Customer[]; total: number }> {
    const { page = 1, limit = 10, search, sort_by = 'customer_name', sort_order = 'ASC', ...filters } = query;
    const skip = (page - 1) * limit;

    const queryBuilder: SelectQueryBuilder<Customer> = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.tenant_id = :tenantId', { tenantId: this.tenantId });

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(customer.customer_name LIKE :search OR customer.email LIKE :search OR customer.customer_code LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryBuilder.andWhere(`customer.${key} = :${key}`, { [key]: value });
      }
    });

    // Apply sorting
    queryBuilder.orderBy(`customer.${sort_by}`, sort_order);

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [customers, total] = await queryBuilder.getManyAndCount();

    return { customers, total };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id, tenant_id: this.tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    // Check if customer name is being updated and is unique
    if (updateCustomerDto.customer_name && updateCustomerDto.customer_name !== customer.customer_name) {
      const existingCustomer = await this.customerRepository.findOne({
        where: {
          customer_name: updateCustomerDto.customer_name,
          tenant_id: this.tenantId,
        },
      });

      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictException('Customer with this name already exists');
      }
    }

    // Check if customer code is being updated and is unique
    if (updateCustomerDto.customer_code && updateCustomerDto.customer_code !== customer.customer_code) {
      const existingCode = await this.customerRepository.findOne({
        where: {
          customer_code: updateCustomerDto.customer_code,
          tenant_id: this.tenantId,
        },
      });

      if (existingCode && existingCode.id !== id) {
        throw new ConflictException('Customer with this code already exists');
      }
    }

    Object.assign(customer, updateCustomerDto);
    customer.modified_by = this.request.user?.email || 'system';

    return this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }

  async getCustomerStats(): Promise<{
    total: number;
    active: number;
    frozen: number;
    disabled: number;
    byType: { [key: string]: number };
    byCountry: { [key: string]: number };
  }> {
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.tenant_id = :tenantId', { tenantId: this.tenantId });

    const total = await queryBuilder.getCount();

    const active = await queryBuilder
      .clone()
      .andWhere('customer.is_frozen = :frozen AND customer.disabled = :disabled', { frozen: 0, disabled: 0 })
      .getCount();

    const frozen = await queryBuilder
      .clone()
      .andWhere('customer.is_frozen = :frozen', { frozen: 1 })
      .getCount();

    const disabled = await queryBuilder
      .clone()
      .andWhere('customer.disabled = :disabled', { disabled: 1 })
      .getCount();

    // Get stats by type
    const typeStats = await queryBuilder
      .clone()
      .select('customer.customer_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('customer.customer_type')
      .getRawMany();

    const byType = typeStats.reduce((acc, stat) => {
      acc[stat.type || 'Unknown'] = parseInt(stat.count);
      return acc;
    }, {});

    // Get stats by country
    const countryStats = await queryBuilder
      .clone()
      .select('customer.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .where('customer.country IS NOT NULL')
      .groupBy('customer.country')
      .getRawMany();

    const byCountry = countryStats.reduce((acc, stat) => {
      acc[stat.country] = parseInt(stat.count);
      return acc;
    }, {});

    return {
      total,
      active,
      frozen,
      disabled,
      byType,
      byCountry,
    };
  }

  async getCustomersByType(customerType: string): Promise<Customer[]> {
    return this.customerRepository.find({
      where: {
        customer_type: customerType,
        tenant_id: this.tenantId,
      },
      order: { customer_name: 'ASC' },
    });
  }

  async getCustomersByCountry(country: string): Promise<Customer[]> {
    return this.customerRepository.find({
      where: {
        country,
        tenant_id: this.tenantId,
      },
      order: { customer_name: 'ASC' },
    });
  }

  async toggleCustomerStatus(id: string): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.disabled = !customer.disabled;
    customer.modified_by = this.request.user?.email || 'system';
    return this.customerRepository.save(customer);
  }

  async toggleFrozenStatus(id: string): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.is_frozen = !customer.is_frozen;
    customer.modified_by = this.request.user?.email || 'system';
    return this.customerRepository.save(customer);
  }

  async bulkUpdateCustomers(customerIds: string[], updateData: Partial<UpdateCustomerDto>): Promise<void> {
    if (!customerIds || customerIds.length === 0) {
      throw new ConflictException('No customer IDs provided');
    }

    await this.customerRepository
      .createQueryBuilder()
      .update(Customer)
      .set({
        ...updateData,
        modified_by: this.request.user?.email || 'system',
      })
      .where('id IN (:...ids) AND tenant_id = :tenantId', {
        ids: customerIds,
        tenantId: this.tenantId,
      })
      .execute();
  }

  async searchCustomers(searchTerm: string, limit: number = 10): Promise<Customer[]> {
    return this.customerRepository.find({
      where: [
        { customer_name: Like(`%${searchTerm}%`), tenant_id: this.tenantId },
        { email: Like(`%${searchTerm}%`), tenant_id: this.tenantId },
        { customer_code: Like(`%${searchTerm}%`), tenant_id: this.tenantId },
      ],
      take: limit,
      order: { customer_name: 'ASC' },
    });
  }
}