import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerQueryDto } from '../dto/customer-query.dto';
import { Customer } from '../../../entities/customer.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CustomersController', () => {
  let controller: CustomersController;
  let customersService: jest.Mocked<CustomersService>;

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

  const mockCustomersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getCustomerStats: jest.fn(),
    searchCustomers: jest.fn(),
    getCustomersByType: jest.fn(),
    getCustomersByCountry: jest.fn(),
    toggleCustomerStatus: jest.fn(),
    toggleFrozenStatus: jest.fn(),
    bulkUpdateCustomers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    customersService = module.get(CustomersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      customersService.create.mockResolvedValue(mockCustomer);

      const result = await controller.create(createCustomerDto);

      expect(customersService.create).toHaveBeenCalledWith(createCustomerDto);
      expect(result).toEqual(mockCustomer);
    });

    it('should throw ConflictException when customer already exists', async () => {
      customersService.create.mockRejectedValue(new ConflictException('Customer already exists'));

      await expect(controller.create(createCustomerDto)).rejects.toThrow(ConflictException);
      expect(customersService.create).toHaveBeenCalledWith(createCustomerDto);
    });

    it('should throw NotFoundException when department access is denied', async () => {
      customersService.create.mockRejectedValue(new NotFoundException('Department not found'));

      await expect(controller.create(createCustomerDto)).rejects.toThrow(NotFoundException);
      expect(customersService.create).toHaveBeenCalledWith(createCustomerDto);
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

    it('should return customers with pagination', async () => {
      const expectedResult = { customers: [mockCustomer], total: 1 };
      customersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(queryDto);

      expect(customersService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty query parameters', async () => {
      const emptyQuery = {};
      const expectedResult = { customers: [mockCustomer], total: 1 };
      customersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(emptyQuery as CustomerQueryDto);

      expect(customersService.findAll).toHaveBeenCalledWith(emptyQuery);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getCustomerStats', () => {
    it('should return customer statistics', async () => {
      const expectedStats = {
        total: 100,
        active: 80,
        frozen: 10,
        disabled: 10,
        byType: { Individual: 60, Corporate: 40 },
        byCountry: { USA: 70, Canada: 30 },
      };
      customersService.getCustomerStats.mockResolvedValue(expectedStats);

      const result = await controller.getCustomerStats();

      expect(customersService.getCustomerStats).toHaveBeenCalled();
      expect(result).toEqual(expectedStats);
    });

    it('should handle empty statistics', async () => {
      const emptyStats = {
        total: 0,
        active: 0,
        frozen: 0,
        disabled: 0,
        byType: {},
        byCountry: {},
      };
      customersService.getCustomerStats.mockResolvedValue(emptyStats);

      const result = await controller.getCustomerStats();

      expect(customersService.getCustomerStats).toHaveBeenCalled();
      expect(result).toEqual(emptyStats);
    });
  });

  describe('searchCustomers', () => {
    it('should search customers with default limit', async () => {
      customersService.searchCustomers.mockResolvedValue([mockCustomer]);

      const result = await controller.searchCustomers('test');

      expect(customersService.searchCustomers).toHaveBeenCalledWith('test', 10);
      expect(result).toEqual([mockCustomer]);
    });

    it('should search customers with custom limit', async () => {
      customersService.searchCustomers.mockResolvedValue([mockCustomer]);

      const result = await controller.searchCustomers('test', 5);

      expect(customersService.searchCustomers).toHaveBeenCalledWith('test', 5);
      expect(result).toEqual([mockCustomer]);
    });

    it('should return empty array when no customers found', async () => {
      customersService.searchCustomers.mockResolvedValue([]);

      const result = await controller.searchCustomers('nonexistent');

      expect(customersService.searchCustomers).toHaveBeenCalledWith('nonexistent', 10);
      expect(result).toEqual([]);
    });
  });

  describe('getCustomersByType', () => {
    it('should return customers by type', async () => {
      customersService.getCustomersByType.mockResolvedValue([mockCustomer]);

      const result = await controller.getCustomersByType('Individual');

      expect(customersService.getCustomersByType).toHaveBeenCalledWith('Individual');
      expect(result).toEqual([mockCustomer]);
    });

    it('should return empty array when no customers of type found', async () => {
      customersService.getCustomersByType.mockResolvedValue([]);

      const result = await controller.getCustomersByType('Corporate');

      expect(customersService.getCustomersByType).toHaveBeenCalledWith('Corporate');
      expect(result).toEqual([]);
    });
  });

  describe('getCustomersByCountry', () => {
    it('should return customers by country', async () => {
      customersService.getCustomersByCountry.mockResolvedValue([mockCustomer]);

      const result = await controller.getCustomersByCountry('USA');

      expect(customersService.getCustomersByCountry).toHaveBeenCalledWith('USA');
      expect(result).toEqual([mockCustomer]);
    });

    it('should return empty array when no customers in country found', async () => {
      customersService.getCustomersByCountry.mockResolvedValue([]);

      const result = await controller.getCustomersByCountry('Canada');

      expect(customersService.getCustomersByCountry).toHaveBeenCalledWith('Canada');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a customer by ID', async () => {
      customersService.findOne.mockResolvedValue(mockCustomer);

      const result = await controller.findOne('1');

      expect(customersService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException when customer not found', async () => {
      customersService.findOne.mockRejectedValue(new NotFoundException('Customer not found'));

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(customersService.findOne).toHaveBeenCalledWith('999');
    });
  });

  describe('update', () => {
    const updateCustomerDto: UpdateCustomerDto = {
      customer_name: 'Updated Customer',
      email: 'updated@example.com',
    };

    it('should update a customer successfully', async () => {
      const updatedCustomer = { ...mockCustomer, ...updateCustomerDto };
      customersService.update.mockResolvedValue(updatedCustomer);

      const result = await controller.update('1', updateCustomerDto);

      expect(customersService.update).toHaveBeenCalledWith('1', updateCustomerDto);
      expect(result).toEqual(updatedCustomer);
    });

    it('should throw NotFoundException when customer not found', async () => {
      customersService.update.mockRejectedValue(new NotFoundException('Customer not found'));

      await expect(controller.update('999', updateCustomerDto)).rejects.toThrow(NotFoundException);
      expect(customersService.update).toHaveBeenCalledWith('999', updateCustomerDto);
    });

    it('should throw ConflictException when customer name already exists', async () => {
      customersService.update.mockRejectedValue(new ConflictException('Customer name already exists'));

      await expect(controller.update('1', { customer_name: 'Existing Name' })).rejects.toThrow(ConflictException);
      expect(customersService.update).toHaveBeenCalledWith('1', { customer_name: 'Existing Name' });
    });
  });

  describe('remove', () => {
    it('should remove a customer successfully', async () => {
      customersService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(customersService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when customer not found', async () => {
      customersService.remove.mockRejectedValue(new NotFoundException('Customer not found'));

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(customersService.remove).toHaveBeenCalledWith('999');
    });
  });

  describe('toggleCustomerStatus', () => {
    it('should toggle customer status successfully', async () => {
      const toggledCustomer = { ...mockCustomer, disabled: true };
      customersService.toggleCustomerStatus.mockResolvedValue(toggledCustomer);

      const result = await controller.toggleCustomerStatus('1');

      expect(customersService.toggleCustomerStatus).toHaveBeenCalledWith('1');
      expect(result).toEqual(toggledCustomer);
    });

    it('should throw NotFoundException when customer not found', async () => {
      customersService.toggleCustomerStatus.mockRejectedValue(new NotFoundException('Customer not found'));

      await expect(controller.toggleCustomerStatus('999')).rejects.toThrow(NotFoundException);
      expect(customersService.toggleCustomerStatus).toHaveBeenCalledWith('999');
    });
  });

  describe('toggleFrozenStatus', () => {
    it('should toggle frozen status successfully', async () => {
      const toggledCustomer = { ...mockCustomer, is_frozen: true };
      customersService.toggleFrozenStatus.mockResolvedValue(toggledCustomer);

      const result = await controller.toggleFrozenStatus('1');

      expect(customersService.toggleFrozenStatus).toHaveBeenCalledWith('1');
      expect(result).toEqual(toggledCustomer);
    });

    it('should throw NotFoundException when customer not found', async () => {
      customersService.toggleFrozenStatus.mockRejectedValue(new NotFoundException('Customer not found'));

      await expect(controller.toggleFrozenStatus('999')).rejects.toThrow(NotFoundException);
      expect(customersService.toggleFrozenStatus).toHaveBeenCalledWith('999');
    });
  });

  describe('bulkUpdateCustomers', () => {
    it('should bulk update customers successfully', async () => {
      customersService.bulkUpdateCustomers.mockResolvedValue(undefined);

      await controller.bulkUpdateCustomers(['1', '2'], { customer_type: 'Corporate' });

      expect(customersService.bulkUpdateCustomers).toHaveBeenCalledWith(['1', '2'], { customer_type: 'Corporate' });
    });

    it('should throw ConflictException when no customer IDs provided', async () => {
      customersService.bulkUpdateCustomers.mockRejectedValue(new ConflictException('No customer IDs provided'));

      await expect(controller.bulkUpdateCustomers([], {})).rejects.toThrow(ConflictException);
      expect(customersService.bulkUpdateCustomers).toHaveBeenCalledWith([], {});
    });

    it('should handle partial update data', async () => {
      customersService.bulkUpdateCustomers.mockResolvedValue(undefined);

      await controller.bulkUpdateCustomers(['1', '2'], { disabled: true });

      expect(customersService.bulkUpdateCustomers).toHaveBeenCalledWith(['1', '2'], { disabled: true });
    });
  });
});