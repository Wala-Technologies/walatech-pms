import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { Tenant, TenantStatus, TenantPlan } from '../../../entities/tenant.entity';

describe('TenantsService', () => {
  let service: TenantsService;
  let tenantRepository: jest.Mocked<Repository<Tenant>>;

  const mockTenant: Tenant = {
    id: '1',
    name: 'Test Tenant',
    subdomain: 'test-tenant',
    status: TenantStatus.ACTIVE,
    plan: TenantPlan.BASIC,
    settings: '{}',
    docstatus: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [],
  };

  const mockCreateTenantDto = {
    name: 'Test Tenant',
    subdomain: 'test-tenant',
    status: TenantStatus.ACTIVE,
    plan: TenantPlan.BASIC,
  };

  const mockUpdateTenantDto = {
    name: 'Updated Tenant',
    subdomain: 'updated-tenant',
  };

  beforeEach(async () => {
    const mockTenantRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    tenantRepository = module.get(getRepositoryToken(Tenant));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tenant successfully', async () => {
      tenantRepository.findOne.mockResolvedValue(null);
      tenantRepository.create.mockReturnValue(mockTenant);
      tenantRepository.save.mockResolvedValue(mockTenant);

      const result = await service.create(mockCreateTenantDto);

      expect(result).toEqual(mockTenant);
      expect(tenantRepository.findOne).toHaveBeenCalledWith({
        where: { subdomain: mockCreateTenantDto.subdomain },
      });
      expect(tenantRepository.create).toHaveBeenCalledWith({
        id: expect.any(String),
        ...mockCreateTenantDto,
        status: TenantStatus.ACTIVE,
        plan: TenantPlan.BASIC,
        docstatus: 0,
      });
      expect(tenantRepository.save).toHaveBeenCalledWith(mockTenant);
    });

    it('should use default values when not provided', async () => {
      const createDtoWithoutDefaults = {
        name: 'Test Tenant',
        subdomain: 'test-tenant',
      };

      tenantRepository.findOne.mockResolvedValue(null);
      tenantRepository.create.mockReturnValue(mockTenant);
      tenantRepository.save.mockResolvedValue(mockTenant);

      await service.create(createDtoWithoutDefaults);

      expect(tenantRepository.create).toHaveBeenCalledWith({
        id: expect.any(String),
        ...createDtoWithoutDefaults,
        status: TenantStatus.ACTIVE,
        plan: TenantPlan.BASIC,
        docstatus: 0,
      });
    });

    it('should throw ConflictException if subdomain already exists', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      await expect(service.create(mockCreateTenantDto))
        .rejects.toThrow(ConflictException);
      expect(tenantRepository.findOne).toHaveBeenCalledWith({
        where: { subdomain: mockCreateTenantDto.subdomain },
      });
    });
  });

  describe('findAll', () => {
    it('should return all tenants ordered by creation date', async () => {
      const tenants = [mockTenant];
      tenantRepository.find.mockResolvedValue(tenants);

      const result = await service.findAll();

      expect(result).toEqual(tenants);
      expect(tenantRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a tenant by ID', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOne('1');

      expect(result).toEqual(mockTenant);
      expect(tenantRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if tenant not found', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySubdomain', () => {
    it('should return a tenant by subdomain', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findBySubdomain('test-tenant');

      expect(result).toEqual(mockTenant);
      expect(tenantRepository.findOne).toHaveBeenCalledWith({
        where: { subdomain: 'test-tenant' },
      });
    });

    it('should return null if tenant not found', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      const result = await service.findBySubdomain('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findUserTenants', () => {
    it('should return tenants for a user', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTenant]),
      };

      tenantRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findUserTenants('user1');

      expect(result).toEqual([mockTenant]);
      expect(tenantRepository.createQueryBuilder).toHaveBeenCalledWith('tenant');
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('tenant.users', 'user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.id = :userId', { userId: 'user1' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tenant.status = :status', { status: 'active' });
    });
  });

  describe('update', () => {
    it('should update a tenant successfully', async () => {
      const updatedTenant = { ...mockTenant, ...mockUpdateTenantDto };
      tenantRepository.findOne.mockResolvedValueOnce(mockTenant);
      tenantRepository.findOne.mockResolvedValueOnce(null); // For subdomain check
      tenantRepository.save.mockResolvedValue(updatedTenant);

      const result = await service.update('1', mockUpdateTenantDto);

      expect(result).toEqual(updatedTenant);
      expect(tenantRepository.save).toHaveBeenCalledWith(updatedTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', mockUpdateTenantDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new subdomain already exists', async () => {
      const existingTenantWithSubdomain = { ...mockTenant, id: '2' };
      tenantRepository.findOne.mockResolvedValueOnce(mockTenant);
      tenantRepository.findOne.mockResolvedValueOnce(existingTenantWithSubdomain);

      await expect(service.update('1', mockUpdateTenantDto))
        .rejects.toThrow(ConflictException);
    });

    it('should not check subdomain uniqueness if subdomain is not being updated', async () => {
      const updateDtoWithoutSubdomain = { name: 'Updated Name' };
      const updatedTenant = { ...mockTenant, name: 'Updated Name' };
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      tenantRepository.save.mockResolvedValue(updatedTenant);

      const result = await service.update('1', updateDtoWithoutSubdomain);

      expect(result).toEqual(updatedTenant);
      expect(tenantRepository.findOne).toHaveBeenCalledTimes(1); // Only called once for finding the tenant
    });

    it('should allow updating to the same subdomain', async () => {
      const updateDtoSameSubdomain = { subdomain: 'test-tenant' };
      const updatedTenant = { ...mockTenant };
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      tenantRepository.save.mockResolvedValue(updatedTenant);

      const result = await service.update('1', updateDtoSameSubdomain);

      expect(result).toEqual(updatedTenant);
      expect(tenantRepository.findOne).toHaveBeenCalledTimes(1); // Only called once for finding the tenant
    });
  });

  describe('remove', () => {
    it('should remove a tenant successfully', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      tenantRepository.remove.mockResolvedValue(mockTenant);

      await service.remove('1');

      expect(tenantRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(tenantRepository.remove).toHaveBeenCalledWith(mockTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('activate', () => {
    it('should activate a tenant successfully', async () => {
      const activatedTenant = { ...mockTenant, status: TenantStatus.ACTIVE };
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      tenantRepository.save.mockResolvedValue(activatedTenant);

      const result = await service.activate('1');

      expect(result).toEqual(activatedTenant);
      expect(result.status).toBe(TenantStatus.ACTIVE);
      expect(tenantRepository.save).toHaveBeenCalledWith(activatedTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.activate('999'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('suspend', () => {
    it('should suspend a tenant successfully', async () => {
      const suspendedTenant = { ...mockTenant, status: TenantStatus.SUSPENDED };
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      tenantRepository.save.mockResolvedValue(suspendedTenant);

      const result = await service.suspend('1');

      expect(result).toEqual(suspendedTenant);
      expect(result.status).toBe(TenantStatus.SUSPENDED);
      expect(tenantRepository.save).toHaveBeenCalledWith(suspendedTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.suspend('999'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePlan', () => {
    it('should update tenant plan successfully', async () => {
      const updatedTenant = { ...mockTenant, plan: TenantPlan.PROFESSIONAL };
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      tenantRepository.save.mockResolvedValue(updatedTenant);

      const result = await service.updatePlan('1', TenantPlan.PROFESSIONAL);

      expect(result).toEqual(updatedTenant);
      expect(result.plan).toBe(TenantPlan.PROFESSIONAL);
      expect(tenantRepository.save).toHaveBeenCalledWith(updatedTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.updatePlan('999', TenantPlan.PROFESSIONAL))
        .rejects.toThrow(NotFoundException);
    });
  });
});