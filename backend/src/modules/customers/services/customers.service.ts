import { Injectable, NotFoundException, ConflictException, Scope, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Customer } from '../../../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerQueryDto } from '../dto/customer-query.dto';
import { DepartmentAccessService } from '../../../common/services/department-access.service';

@Injectable({ scope: Scope.REQUEST })
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @Inject(REQUEST) private request: any,
    private departmentAccessService: DepartmentAccessService,
  ) {}

  private get tenant_id(): string {
    return this.request.tenant_id || this.request.user?.tenant_id;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const userId = this.request.user?.user_id;
    const departmentId = createCustomerDto.department_id || this.request.user?.default_department_id;

    // Validate department access
    if (!departmentId) {
      throw new BadRequestException('Department ID is required');
    }

    const canAccess = await this.departmentAccessService.canAccessDepartment(userId, departmentId);
    if (!canAccess) {
      throw new BadRequestException('You do not have access to create customers in this department');
    }

    // Check if customer with same name already exists for this tenant
    const existingCustomer = await this.customerRepository.findOne({
      where: {
        customer_name: createCustomerDto.customer_name,
        tenant_id: this.tenant_id,
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
          tenant_id: this.tenant_id,
        },
      });

      if (existingCode) {
        throw new ConflictException('Customer with this code already exists');
      }
    }

    const customer = this.customerRepository.create({
      ...createCustomerDto,
      department_id: departmentId,
      tenant_id: this.tenant_id,
      owner: this.request.user?.email || 'system',
    });

    return this.customerRepository.save(customer);
  }

  async findAll(query: CustomerQueryDto): Promise<{ customers: Customer[]; total: number }> {
    const { page = 1, limit = 10, search, sort_by = 'customer_name', sort_order = 'ASC', ...filters } = query;
    const skip = (page - 1) * limit;
    const userId = this.request.user?.user_id;

    const queryBuilder: SelectQueryBuilder<Customer> = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.tenant_id = :tenant_id', { tenant_id: this.tenant_id });

    // Apply department filtering
    const canAccessAllDepartments = this.departmentAccessService.canAccessAllDepartments(this.request.user);
    if (!canAccessAllDepartments) {
      const accessibleDepartmentIds = this.departmentAccessService.getAccessibleDepartmentIds(this.request.user);
      if (accessibleDepartmentIds !== null) {
        if (accessibleDepartmentIds.length === 0) {
          return { customers: [], total: 0 };
        }
        queryBuilder.andWhere('customer.department_id IN (:...departmentIds)', { departmentIds: accessibleDepartmentIds });
      }
    }

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
      where: { id, tenant_id: this.tenant_id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Validate department access
    const userId = this.request.user?.user_id;
    const canAccess = await this.departmentAccessService.canAccessDepartment(userId, customer.department_id);
    if (!canAccess) {
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
          tenant_id: this.tenant_id,
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
          tenant_id: this.tenant_id,
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
    const userId = this.request.user?.user_id;
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.tenant_id = :tenant_id', { tenant_id: this.tenant_id });

    // Apply department filtering
    const canAccessAllDepartments = this.departmentAccessService.canAccessAllDepartments(this.request.user);
    if (!canAccessAllDepartments) {
      const accessibleDepartmentIds = this.departmentAccessService.getAccessibleDepartmentIds(this.request.user);
      if (accessibleDepartmentIds !== null) {
        if (accessibleDepartmentIds.length === 0) {
          return { total: 0, active: 0, frozen: 0, disabled: 0, byType: {}, byCountry: {} };
        }
        queryBuilder.andWhere('customer.department_id IN (:...departmentIds)', { departmentIds: accessibleDepartmentIds });
      }
    }

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
    const userId = this.request.user?.user_id;
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.customer_type = :customerType AND customer.tenant_id = :tenant_id', { 
        customerType, 
        tenant_id: this.tenant_id 
      });

    // Apply department filtering
    const canAccessAllDepartments = this.departmentAccessService.canAccessAllDepartments(this.request.user);
    if (!canAccessAllDepartments) {
      const accessibleDepartmentIds = this.departmentAccessService.getAccessibleDepartmentIds(this.request.user);
      if (accessibleDepartmentIds !== null) {
        if (accessibleDepartmentIds.length === 0) {
          return [];
        }
        queryBuilder.andWhere('customer.department_id IN (:...departmentIds)', { departmentIds: accessibleDepartmentIds });
      }
    }

    return queryBuilder.orderBy('customer.customer_name', 'ASC').getMany();
  }

  async getCustomersByCountry(country: string): Promise<Customer[]> {
    const userId = this.request.user?.user_id;
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.country = :country AND customer.tenant_id = :tenant_id', { 
        country, 
        tenant_id: this.tenant_id 
      });

    // Apply department filtering
    const canAccessAllDepartments = this.departmentAccessService.canAccessAllDepartments(this.request.user);
    if (!canAccessAllDepartments) {
      const accessibleDepartmentIds = this.departmentAccessService.getAccessibleDepartmentIds(this.request.user);
      if (accessibleDepartmentIds !== null) {
        if (accessibleDepartmentIds.length === 0) {
          return [];
        }
        queryBuilder.andWhere('customer.department_id IN (:...departmentIds)', { departmentIds: accessibleDepartmentIds });
      }
    }

    return queryBuilder.orderBy('customer.customer_name', 'ASC').getMany();
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
      .where('id IN (:...ids) AND tenant_id = :tenant_id', {
        ids: customerIds,
        tenant_id: this.tenant_id,
      })
      .execute();
  }

  async searchCustomers(searchTerm: string, limit: number = 10): Promise<Customer[]> {
    const userId = this.request.user?.user_id;
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.tenant_id = :tenant_id', { tenant_id: this.tenant_id })
      .andWhere(
        '(customer.customer_name LIKE :search OR customer.email LIKE :search OR customer.customer_code LIKE :search)',
        { search: `%${searchTerm}%` }
      );

    // Apply department filtering
    const canAccessAllDepartments = this.departmentAccessService.canAccessAllDepartments(this.request.user);
    if (!canAccessAllDepartments) {
      const accessibleDepartmentIds = this.departmentAccessService.getAccessibleDepartmentIds(this.request.user);
      if (accessibleDepartmentIds !== null) {
        if (accessibleDepartmentIds.length === 0) {
          return [];
        }
        queryBuilder.andWhere('customer.department_id IN (:...departmentIds)', { departmentIds: accessibleDepartmentIds });
      }
    }

    return queryBuilder
      .take(limit)
      .orderBy('customer.customer_name', 'ASC')
      .getMany();
  }
}