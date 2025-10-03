import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryBuilder, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from '../../../entities/customer.entity';
import { DepartmentAccessService } from '../../departments/services/department-access.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerQueryDto } from '../dto/customer-query.dto';

describe('CustomersService', () => {
  let service: CustomersService;
  let customerRepository: jest.Mocked<Repository<Customer>>;
  let departmentAccessService: jest.Mocked<DepartmentAccessService>;
  let mockRequest: any;

  const mockCustomer: Customer = {
    id: '1',
    customer_name: 'Test Customer',
    customer_code: 'TC001',
    email: 'test@example.com',
    phone: '+1234567890',
    customer_type: 'Individual',
    country: 'USA',
    city: 'New York',
    address: '123 Test St',
    postal_code: '12345',
    department_id: 'dept-1',
    tenant_id: 'tenant-1',
    disabled: false,
    is_frozen: false,
    created_by: 'test@example.com',
    modified_by: 'test@example.com',
    created_at: new Date(),
    updated_at: new Date(),
  } as Customer;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
    getMany: jest.fn(),
    clone: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  beforeEach(async () => {
    mockRequest = {
      user: {
        user_id: 'user-1',
        email: 'test@example.com',
        tenant_id: 'tenant-1',
      },
    };

    const mockCustomerRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    const mockDepartmentAccessService = {
      canAccessDepartment: jest.fn(),
      canAccessAllDepartments: jest.fn(),
      getAccessibleDepartmentIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
        {
          provide: DepartmentAccessService,
          useValue: mockDepartmentAccessService,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    customerRepository = module.get(getRepositoryToken(Customer));
    departmentAccessService = module.get(DepartmentAccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCustomerDto: CreateCustomerDto = {
      customer_name: 'New Customer',
      customer_code: 'NC001',
      email: 'new@example.com',
      phone: '+1234567890',
      customer_type: 'Individual',
      country: 'USA',
      city: 'New York',
      address: '123 New St',
      postal_code: '12345',
      department_id: 'dept-1',
    };

    it('should create a customer successfully', async () => {
      departmentAccessService.canAccessDepartment.mockResolvedValue(true);
      customerRepository.findOne.mockResolvedValue(null);
      customerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.create(createCustomerDto);

      expect(departmentAccessService.canAccessDepartment).toHaveBeenCalledWith('user-1', 'dept-1');
      expect(customerRepository.findOne).toHaveBeenCalledTimes(2);
      expect(customerRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException when department access is denied', async () => {
      departmentAccessService.canAccessDepartment.mockResolvedValue(false);

      await expect(service.create(createCustomerDto)).rejects.toThrow(NotFoundException);
      expect(departmentAccessService.canAccessDepartment).toHaveBeenCalledWith('user-1', 'dept-1');
    });

    it('should throw ConflictException when customer name already exists', async () => {
      departmentAccessService.canAccessDepartment.mockResolvedValue(true);
      customerRepository.findOne.mockResolvedValueOnce(mockCustomer);

      await expect(service.create(createCustomerDto)).rejects.toThrow(ConflictException);
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: {
          customer_name: createCustomerDto.customer_name,
          tenant_id: 'tenant-1',
        },
      });
    });

    it('should throw ConflictException when customer code already exists', async () => {
      departmentAccessService.canAccessDepartment.mockResolvedValue(true);
      customerRepository.findOne
        .mockResolvedValueOnce(null) // name check
        .mockResolvedValueOnce(mockCustomer); // code check

      await expect(service.create(createCustomerDto)).rejects.toThrow(ConflictException);
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: {
          customer_code: createCustomerDto.customer_code,
          tenant_id: 'tenant-1',
        },
      });
    });
  });

  describe('findAll', () => {
    const queryDto: CustomerQueryDto = {
      page: 1,
      limit: 10,
      sort_by: 'customer_name',
      sort_order: 'ASC',
      search: 'test',
      customer_type: 'Individual',
      country: 'USA',
      disabled: false,
      is_frozen: false,
    };

    it('should return customers with pagination for users with all department access', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(true);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockCustomer], 1]);

      const result = await service.findAll(queryDto);

      expect(departmentAccessService.canAccessAllDepartments).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('customer.tenant_id = :tenant_id', { tenant_id: 'tenant-1' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(customer.customer_name LIKE :search OR customer.email LIKE :search OR customer.customer_code LIKE :search)',
        { search: '%test%' }
      );
      expect(result).toEqual({ customers: [mockCustomer], total: 1 });
    });

    it('should return customers with department filtering for restricted users', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(false);
      departmentAccessService.getAccessibleDepartmentIds.mockReturnValue(['dept-1', 'dept-2']);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockCustomer], 1]);

      const result = await service.findAll(queryDto);

      expect(departmentAccessService.getAccessibleDepartmentIds).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('customer.department_id IN (:...departmentIds)', {
        departmentIds: ['dept-1', 'dept-2'],
      });
      expect(result).toEqual({ customers: [mockCustomer], total: 1 });
    });

    it('should return empty result when user has no accessible departments', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(false);
      departmentAccessService.getAccessibleDepartmentIds.mockReturnValue([]);

      const result = await service.findAll(queryDto);

      expect(result).toEqual({ customers: [], total: 0 });
    });
  });

  describe('findOne', () => {
    it('should return a customer when found and accessible', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      departmentAccessService.canAccessDepartment.mockResolvedValue(true);

      const result = await service.findOne('1');

      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', tenant_id: 'tenant-1' },
      });
      expect(departmentAccessService.canAccessDepartment).toHaveBeenCalledWith('user-1', 'dept-1');
      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException when customer not found', async () => {
      customerRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when department access is denied', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      departmentAccessService.canAccessDepartment.mockResolvedValue(false);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateCustomerDto: UpdateCustomerDto = {
      customer_name: 'Updated Customer',
      email: 'updated@example.com',
    };

    it('should update a customer successfully', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      departmentAccessService.canAccessDepartment.mockResolvedValue(true);
      customerRepository.save.mockResolvedValue({ ...mockCustomer, ...updateCustomerDto });

      const result = await service.update('1', updateCustomerDto);

      expect(customerRepository.save).toHaveBeenCalled();
      expect(result.customer_name).toBe(updateCustomerDto.customer_name);
    });

    it('should throw ConflictException when updating to existing customer name', async () => {
      const existingCustomer = { ...mockCustomer, id: '2' };
      customerRepository.findOne
        .mockResolvedValueOnce(mockCustomer) // findOne call
        .mockResolvedValueOnce(existingCustomer); // name uniqueness check
      departmentAccessService.canAccessDepartment.mockResolvedValue(true);

      await expect(service.update('1', { customer_name: 'Existing Name' })).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when updating to existing customer code', async () => {
      const existingCustomer = { ...mockCustomer, id: '2' };
      customerRepository.findOne
        .mockResolvedValueOnce(mockCustomer) // findOne call
        .mockResolvedValueOnce(null) // name check
        .mockResolvedValueOnce(existingCustomer); // code check
      departmentAccessService.canAccessDepartment.mockResolvedValue(true);

      await expect(service.update('1', { customer_code: 'EXISTING' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a customer successfully', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      departmentAccessService.canAccessDepartment.mockResolvedValue(true);
      customerRepository.remove.mockResolvedValue(mockCustomer);

      await service.remove('1');

      expect(customerRepository.remove).toHaveBeenCalledWith(mockCustomer);
    });

    it('should throw NotFoundException when customer not found', async () => {
      customerRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCustomerStats', () => {
    it('should return customer statistics for users with all department access', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(true);
      mockQueryBuilder.getCount
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80) // active
        .mockResolvedValueOnce(10) // frozen
        .mockResolvedValueOnce(10); // disabled

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { type: 'Individual', count: '60' },
          { type: 'Corporate', count: '40' },
        ]) // type stats
        .mockResolvedValueOnce([
          { country: 'USA', count: '70' },
          { country: 'Canada', count: '30' },
        ]); // country stats

      const result = await service.getCustomerStats();

      expect(result).toEqual({
        total: 100,
        active: 80,
        frozen: 10,
        disabled: 10,
        byType: { Individual: 60, Corporate: 40 },
        byCountry: { USA: 70, Canada: 30 },
      });
    });

    it('should return empty stats when user has no accessible departments', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(false);
      departmentAccessService.getAccessibleDepartmentIds.mockReturnValue([]);

      const result = await service.getCustomerStats();

      expect(result).toEqual({
        total: 0,
        active: 0,
        frozen: 0,
        disabled: 0,
        byType: {},
        byCountry: {},
      });
    });
  });

  describe('getCustomersByType', () => {
    it('should return customers by type', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(true);
      mockQueryBuilder.getMany.mockResolvedValue([mockCustomer]);

      const result = await service.getCustomersByType('Individual');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'customer.customer_type = :customerType AND customer.tenant_id = :tenant_id',
        { customerType: 'Individual', tenant_id: 'tenant-1' }
      );
      expect(result).toEqual([mockCustomer]);
    });

    it('should return empty array when user has no accessible departments', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(false);
      departmentAccessService.getAccessibleDepartmentIds.mockReturnValue([]);

      const result = await service.getCustomersByType('Individual');

      expect(result).toEqual([]);
    });
  });

  describe('getCustomersByCountry', () => {
    it('should return customers by country', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(true);
      mockQueryBuilder.getMany.mockResolvedValue([mockCustomer]);

      const result = await service.getCustomersByCountry('USA');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'customer.country = :country AND customer.tenant_id = :tenant_id',
        { country: 'USA', tenant_id: 'tenant-1' }
      );
      expect(result).toEqual([mockCustomer]);
    });
  });

  describe('toggleCustomerStatus', () => {
    it('should toggle customer disabled status', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      departmentAccessService.canAccessDepartment.mockResolvedValue(true);
      const updatedCustomer = { ...mockCustomer, disabled: true };
      customerRepository.save.mockResolvedValue(updatedCustomer);

      const result = await service.toggleCustomerStatus('1');

      expect(result.disabled).toBe(true);
      expect(customerRepository.save).toHaveBeenCalled();
    });
  });

  describe('toggleFrozenStatus', () => {
    it('should toggle customer frozen status', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      departmentAccessService.canAccessDepartment.mockResolvedValue(true);
      const updatedCustomer = { ...mockCustomer, is_frozen: true };
      customerRepository.save.mockResolvedValue(updatedCustomer);

      const result = await service.toggleFrozenStatus('1');

      expect(result.is_frozen).toBe(true);
      expect(customerRepository.save).toHaveBeenCalled();
    });
  });

  describe('bulkUpdateCustomers', () => {
    it('should bulk update customers successfully', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: 2 });

      await service.bulkUpdateCustomers(['1', '2'], { customer_type: 'Corporate' });

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(Customer);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        customer_type: 'Corporate',
        modified_by: 'test@example.com',
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id IN (:...ids) AND tenant_id = :tenant_id', {
        ids: ['1', '2'],
        tenant_id: 'tenant-1',
      });
    });

    it('should throw ConflictException when no customer IDs provided', async () => {
      await expect(service.bulkUpdateCustomers([], {})).rejects.toThrow(ConflictException);
      await expect(service.bulkUpdateCustomers(null, {})).rejects.toThrow(ConflictException);
    });
  });

  describe('searchCustomers', () => {
    it('should search customers by term', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(true);
      mockQueryBuilder.getMany.mockResolvedValue([mockCustomer]);

      const result = await service.searchCustomers('test', 5);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(customer.customer_name LIKE :search OR customer.email LIKE :search OR customer.customer_code LIKE :search)',
        { search: '%test%' }
      );
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockCustomer]);
    });

    it('should return empty array when user has no accessible departments', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(false);
      departmentAccessService.getAccessibleDepartmentIds.mockReturnValue([]);

      const result = await service.searchCustomers('test');

      expect(result).toEqual([]);
    });
  });
});