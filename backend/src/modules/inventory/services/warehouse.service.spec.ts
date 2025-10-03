import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WarehouseService, CreateWarehouseDto, UpdateWarehouseDto, WarehouseQueryDto } from './warehouse.service';
import { Warehouse } from '../entities/warehouse.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';

describe('WarehouseService', () => {
  let service: WarehouseService;
  let warehouseRepository: jest.Mocked<Repository<Warehouse>>;
  let tenantRepository: jest.Mocked<Repository<Tenant>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockTenant = {
    id: 'tenant-1',
    name: 'Test Tenant',
    subdomain: 'test',
  };

  const mockWarehouse = {
    id: 'warehouse-1',
    name: 'Main Warehouse',
    code: 'WH001',
    address: '123 Main St',
    contact_person: 'John Doe',
    phone: '+1234567890',
    email: 'warehouse@test.com',
    is_active: true,
    tenant_id: 'tenant-1',
    bins: [],
  };

  beforeEach(async () => {
    const mockRepositoryFactory = () => ({
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
        getMany: jest.fn(),
      })),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehouseService,
        {
          provide: getRepositoryToken(Warehouse),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: getRepositoryToken(Tenant),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<WarehouseService>(WarehouseService);
    warehouseRepository = module.get(getRepositoryToken(Warehouse));
    tenantRepository = module.get(getRepositoryToken(Tenant));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createWarehouseDto: CreateWarehouseDto = {
      name: 'Main Warehouse',
      code: 'WH001',
      address: '123 Main St',
      contact_person: 'John Doe',
      phone: '+1234567890',
      email: 'warehouse@test.com',
      is_active: true,
    };

    it('should create a warehouse successfully', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant as any);
      warehouseRepository.findOne.mockResolvedValueOnce(null); // name check
      warehouseRepository.findOne.mockResolvedValueOnce(null); // code check
      warehouseRepository.create.mockReturnValue(mockWarehouse as any);
      warehouseRepository.save.mockResolvedValue(mockWarehouse as any);

      const result = await service.create(createWarehouseDto, 'tenant-1', 'user-1');

      expect(result).toEqual(mockWarehouse);
      expect(tenantRepository.findOne).toHaveBeenCalledWith({ where: { id: 'tenant-1' } });
      expect(warehouseRepository.findOne).toHaveBeenCalledWith({
        where: { name: createWarehouseDto.name, tenant_id: 'tenant-1' },
      });
      expect(warehouseRepository.findOne).toHaveBeenCalledWith({
        where: { code: createWarehouseDto.code, tenant_id: 'tenant-1' },
      });
      expect(warehouseRepository.create).toHaveBeenCalledWith({
        name: createWarehouseDto.name,
        code: createWarehouseDto.code,
        address: createWarehouseDto.address,
        contact_person: createWarehouseDto.contact_person,
        phone: createWarehouseDto.phone,
        email: createWarehouseDto.email,
        is_active: true,
        tenant_id: 'tenant-1',
      });
      expect(warehouseRepository.save).toHaveBeenCalledWith(mockWarehouse);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createWarehouseDto, 'tenant-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(tenantRepository.findOne).toHaveBeenCalledWith({ where: { id: 'tenant-1' } });
    });

    it('should throw BadRequestException if warehouse name already exists', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant as any);
      warehouseRepository.findOne.mockResolvedValueOnce(mockWarehouse as any); // name check

      await expect(service.create(createWarehouseDto, 'tenant-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(warehouseRepository.findOne).toHaveBeenCalledWith({
        where: { name: createWarehouseDto.name, tenant_id: 'tenant-1' },
      });
    });

    it('should throw BadRequestException if warehouse code already exists', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant as any);
      warehouseRepository.findOne.mockResolvedValueOnce(null); // name check
      warehouseRepository.findOne.mockResolvedValueOnce(mockWarehouse as any); // code check

      await expect(service.create(createWarehouseDto, 'tenant-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(warehouseRepository.findOne).toHaveBeenCalledWith({
        where: { code: createWarehouseDto.code, tenant_id: 'tenant-1' },
      });
    });

    it('should set is_active to true by default', async () => {
      const createDtoWithoutActive = { ...createWarehouseDto };
      delete createDtoWithoutActive.is_active;

      tenantRepository.findOne.mockResolvedValue(mockTenant as any);
      warehouseRepository.findOne.mockResolvedValueOnce(null); // name check
      warehouseRepository.findOne.mockResolvedValueOnce(null); // code check
      warehouseRepository.create.mockReturnValue(mockWarehouse as any);
      warehouseRepository.save.mockResolvedValue(mockWarehouse as any);

      await service.create(createDtoWithoutActive, 'tenant-1', 'user-1');

      expect(warehouseRepository.create).toHaveBeenCalledWith({
        name: createDtoWithoutActive.name,
        code: createDtoWithoutActive.code,
        address: createDtoWithoutActive.address,
        contact_person: createDtoWithoutActive.contact_person,
        phone: createDtoWithoutActive.phone,
        email: createDtoWithoutActive.email,
        is_active: true,
        tenant_id: 'tenant-1',
      });
    });
  });

  describe('findAll', () => {
    const query: WarehouseQueryDto = {
      is_active: true,
      search: 'main',
      page: 1,
      limit: 10,
    };

    it('should return warehouses with pagination', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockWarehouse], 1]),
      };

      warehouseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(query, 'tenant-1');

      expect(result).toEqual({ warehouses: [mockWarehouse], total: 1 });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('warehouse.tenant_id = :tenant_id', {
        tenant_id: 'tenant-1',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('warehouse.is_active = :is_active', {
        is_active: true,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(warehouse.name ILIKE :search OR warehouse.code ILIKE :search OR warehouse.address ILIKE :search)',
        { search: '%main%' },
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('warehouse.name', 'ASC');
    });

    it('should use default pagination values', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockWarehouse], 1]),
      };

      warehouseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({}, 'tenant-1');

      expect(result).toEqual({ warehouses: [mockWarehouse], total: 1 });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0); // (1-1) * 10
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should not apply filters when not provided', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockWarehouse], 1]),
      };

      warehouseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({}, 'tenant-1');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(0);
    });
  });

  describe('findOne', () => {
    it('should return a warehouse if found', async () => {
      warehouseRepository.findOne.mockResolvedValue(mockWarehouse as any);

      const result = await service.findOne('warehouse-1', 'tenant-1');

      expect(result).toEqual(mockWarehouse);
      expect(warehouseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'warehouse-1', tenant_id: 'tenant-1' },
        relations: ['tenant', 'bins'],
      });
    });

    it('should throw NotFoundException if warehouse not found', async () => {
      warehouseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('warehouse-1', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(warehouseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'warehouse-1', tenant_id: 'tenant-1' },
        relations: ['tenant', 'bins'],
      });
    });
  });

  describe('findByName', () => {
    it('should return a warehouse if found by name', async () => {
      warehouseRepository.findOne.mockResolvedValue(mockWarehouse as any);

      const result = await service.findByName('Main Warehouse', 'tenant-1');

      expect(result).toEqual(mockWarehouse);
      expect(warehouseRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Main Warehouse', tenant_id: 'tenant-1' },
        relations: ['bins'],
      });
    });

    it('should throw NotFoundException if warehouse not found by name', async () => {
      warehouseRepository.findOne.mockResolvedValue(null);

      await expect(service.findByName('Nonexistent Warehouse', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateWarehouseDto: UpdateWarehouseDto = {
      id: 'warehouse-1',
      name: 'Updated Warehouse',
      code: 'WH002',
      address: '456 Updated St',
      is_active: false,
    };

    it('should update a warehouse successfully', async () => {
      const updatedWarehouse = { ...mockWarehouse, ...updateWarehouseDto };
      
      warehouseRepository.findOne.mockResolvedValueOnce(mockWarehouse as any); // findOne call
      warehouseRepository.findOne.mockResolvedValueOnce(null); // name uniqueness check
      warehouseRepository.findOne.mockResolvedValueOnce(null); // code uniqueness check
      warehouseRepository.save.mockResolvedValue(updatedWarehouse as any);

      const result = await service.update(updateWarehouseDto, 'tenant-1', 'user-1');

      expect(result).toEqual(updatedWarehouse);
      expect(warehouseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockWarehouse,
          name: 'Updated Warehouse',
          code: 'WH002',
          address: '456 Updated St',
          is_active: false,
        }),
      );
    });

    it('should throw BadRequestException if new name already exists', async () => {
      const existingWarehouse = { ...mockWarehouse, id: 'warehouse-2' };
      
      warehouseRepository.findOne.mockResolvedValueOnce(mockWarehouse as any); // findOne call
      warehouseRepository.findOne.mockResolvedValueOnce(existingWarehouse as any); // name uniqueness check

      await expect(service.update(updateWarehouseDto, 'tenant-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(warehouseRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Updated Warehouse', tenant_id: 'tenant-1' },
      });
    });

    it('should throw BadRequestException if new code already exists', async () => {
      const existingWarehouse = { ...mockWarehouse, id: 'warehouse-2' };
      
      warehouseRepository.findOne.mockResolvedValueOnce(mockWarehouse as any); // findOne call
      warehouseRepository.findOne.mockResolvedValueOnce(null); // name uniqueness check
      warehouseRepository.findOne.mockResolvedValueOnce(existingWarehouse as any); // code uniqueness check

      await expect(service.update(updateWarehouseDto, 'tenant-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(warehouseRepository.findOne).toHaveBeenCalledWith({
        where: { code: 'WH002', tenant_id: 'tenant-1' },
      });
    });

    it('should not check uniqueness if name/code unchanged', async () => {
      const updateDtoSameName = { ...updateWarehouseDto, name: mockWarehouse.name, code: mockWarehouse.code };
      
      warehouseRepository.findOne.mockResolvedValueOnce(mockWarehouse as any); // findOne call
      warehouseRepository.save.mockResolvedValue(mockWarehouse as any);

      await service.update(updateDtoSameName, 'tenant-1', 'user-1');

      // Should only be called once for findOne, not for uniqueness checks
      expect(warehouseRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should only update provided fields', async () => {
      const partialUpdateDto: UpdateWarehouseDto = {
        id: 'warehouse-1',
        name: 'Partially Updated',
      };
      
      warehouseRepository.findOne.mockResolvedValueOnce(mockWarehouse as any); // findOne call
      warehouseRepository.findOne.mockResolvedValueOnce(null); // name uniqueness check
      warehouseRepository.save.mockResolvedValue(mockWarehouse as any);

      await service.update(partialUpdateDto, 'tenant-1', 'user-1');

      expect(warehouseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockWarehouse,
          name: 'Partially Updated',
          // Other fields should remain unchanged
          code: mockWarehouse.code,
          address: mockWarehouse.address,
        }),
      );
    });
  });

  describe('remove', () => {
    it('should remove a warehouse successfully', async () => {
      warehouseRepository.findOne.mockResolvedValue(mockWarehouse as any);
      warehouseRepository.remove.mockResolvedValue(mockWarehouse as any);

      await service.remove('warehouse-1', 'tenant-1');

      expect(warehouseRepository.remove).toHaveBeenCalledWith(mockWarehouse);
    });

    it('should throw NotFoundException if warehouse not found', async () => {
      warehouseRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('warehouse-1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWarehouseHierarchy', () => {
    it('should return all warehouses for tenant ordered by name', async () => {
      const warehouses = [mockWarehouse];
      warehouseRepository.find.mockResolvedValue(warehouses as any);

      const result = await service.getWarehouseHierarchy('tenant-1');

      expect(result).toEqual(warehouses);
      expect(warehouseRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-1' },
        order: { name: 'ASC' },
      });
    });
  });

  describe('getChildWarehouses', () => {
    it('should return empty array since parent-child relationship is removed', async () => {
      const result = await service.getChildWarehouses('Main Warehouse', 'tenant-1');

      expect(result).toEqual([]);
    });
  });

  describe('getAllChildWarehouses', () => {
    it('should return empty array since parent-child relationship is removed', async () => {
      const result = await service.getAllChildWarehouses('Main Warehouse', 'tenant-1');

      expect(result).toEqual([]);
    });
  });
});