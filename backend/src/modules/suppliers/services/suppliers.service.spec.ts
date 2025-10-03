import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { SuppliersService } from './suppliers.service';
import { Supplier } from '../../../entities/supplier.entity';
import { SupplierGroup } from '../../../entities/supplier-group.entity';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { SupplierQueryDto } from '../dto/supplier-query.dto';
import { DepartmentAccessService } from '../../../common/services/department-access.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let supplierRepository: Repository<Supplier>;
  let supplierGroupRepository: Repository<SupplierGroup>;
  let departmentAccessService: DepartmentAccessService;

  const mockRequest = {
    tenant_id: 'test-tenant',
    user: {
      id: 1,
      email: 'test@example.com',
      tenant_id: 'test-tenant',
      department_id: 1,
    },
  };

  const mockSupplierRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockSupplierGroupRepository = {
    findOne: jest.fn(),
  };

  const mockDepartmentAccessService = {
    canAccessDepartment: jest.fn(),
    getAccessibleDepartmentIds: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getMany: jest.fn(),
    getCount: jest.fn(),
    getRawMany: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        {
          provide: getRepositoryToken(Supplier),
          useValue: mockSupplierRepository,
        },
        {
          provide: getRepositoryToken(SupplierGroup),
          useValue: mockSupplierGroupRepository,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
        {
          provide: DepartmentAccessService,
          useValue: mockDepartmentAccessService,
        },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
    supplierRepository = module.get<Repository<Supplier>>(getRepositoryToken(Supplier));
    supplierGroupRepository = module.get<Repository<SupplierGroup>>(getRepositoryToken(SupplierGroup));
    departmentAccessService = module.get<DepartmentAccessService>(DepartmentAccessService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createSupplierDto: CreateSupplierDto = {
      supplier_name: 'Test Supplier',
      supplier_code: 'SUP001',
      supplier_type: 'Company',
      email: 'supplier@test.com',
      supplier_group: 1,
      department_id: 1,
    };

    it('should create a supplier successfully', async () => {
      const expectedSupplier = {
        id: 1,
        ...createSupplierDto,
        tenant_id: 'test-tenant',
        owner: 'test@example.com',
      };

      mockSupplierRepository.findOne.mockResolvedValueOnce(null); // No existing supplier
      mockSupplierRepository.findOne.mockResolvedValueOnce(null); // No existing code
      mockSupplierGroupRepository.findOne.mockResolvedValue({ id: 1, supplier_group_name: 'Test Group' });
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);
      mockSupplierRepository.create.mockReturnValue(expectedSupplier);
      mockSupplierRepository.save.mockResolvedValue(expectedSupplier);

      const result = await service.create(createSupplierDto);

      expect(supplierRepository.findOne).toHaveBeenCalledWith({
        where: { supplier_name: createSupplierDto.supplier_name, tenant_id: 'test-tenant' },
      });
      expect(supplierRepository.create).toHaveBeenCalledWith({
        ...createSupplierDto,
        department_id: 1,
        tenant_id: 'test-tenant',
        owner: 'test@example.com',
      });
      expect(result).toEqual(expectedSupplier);
    });

    it('should throw ConflictException when supplier name already exists', async () => {
      mockSupplierRepository.findOne.mockResolvedValue({ id: 1, supplier_name: 'Test Supplier' });

      await expect(service.create(createSupplierDto)).rejects.toThrow(ConflictException);
      expect(supplierRepository.findOne).toHaveBeenCalledWith({
        where: { supplier_name: createSupplierDto.supplier_name, tenant_id: 'test-tenant' },
      });
    });

    it('should throw ConflictException when supplier code already exists', async () => {
      mockSupplierRepository.findOne.mockResolvedValueOnce(null); // No existing name
      mockSupplierRepository.findOne.mockResolvedValueOnce({ id: 1, supplier_code: 'SUP001' }); // Existing code

      await expect(service.create(createSupplierDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when supplier group not found', async () => {
      mockSupplierRepository.findOne.mockResolvedValue(null);
      mockSupplierGroupRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createSupplierDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when department access denied', async () => {
      mockSupplierRepository.findOne.mockResolvedValue(null);
      mockSupplierGroupRepository.findOne.mockResolvedValue({ id: 1 });
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(false);

      await expect(service.create(createSupplierDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    const queryDto: SupplierQueryDto = {
      page: 1,
      limit: 10,
      search: 'test',
      sort_by: 'supplier_name',
      sort_order: 'ASC',
    };

    it('should return paginated suppliers', async () => {
      const expectedSuppliers = [
        { id: 1, supplier_name: 'Test Supplier 1' },
        { id: 2, supplier_name: 'Test Supplier 2' },
      ];
      const expectedTotal = 2;

      mockDepartmentAccessService.getAccessibleDepartmentIds.mockReturnValue([1, 2]);
      mockSupplierRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([expectedSuppliers, expectedTotal]);

      const result = await service.findAll(queryDto);

      expect(supplierRepository.createQueryBuilder).toHaveBeenCalledWith('supplier');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('supplier.supplierGroup', 'supplierGroup');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('supplier.tenant_id = :tenant_id', { tenant_id: 'test-tenant' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('supplier.department_id IN (:...departmentIds)', { departmentIds: [1, 2] });
      expect(result).toEqual({ suppliers: expectedSuppliers, total: expectedTotal });
    });

    it('should return empty result when no accessible departments', async () => {
      mockDepartmentAccessService.getAccessibleDepartmentIds.mockReturnValue([]);

      const result = await service.findAll(queryDto);

      expect(result).toEqual({ suppliers: [], total: 0 });
    });

    it('should apply search filter', async () => {
      mockDepartmentAccessService.getAccessibleDepartmentIds.mockReturnValue(null);
      mockSupplierRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(queryDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(supplier.supplier_name LIKE :search OR supplier.email LIKE :search OR supplier.supplier_code LIKE :search)',
        { search: '%test%' }
      );
    });
  });

  describe('findOne', () => {
    it('should return a supplier by id', async () => {
      const expectedSupplier = {
        id: 1,
        supplier_name: 'Test Supplier',
        department_id: 1,
        tenant_id: 'test-tenant',
      };

      mockSupplierRepository.findOne.mockResolvedValue(expectedSupplier);
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.findOne('1');

      expect(supplierRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', tenant_id: 'test-tenant' },
        relations: ['supplierGroup'],
      });
      expect(result).toEqual(expectedSupplier);
    });

    it('should throw NotFoundException when supplier not found', async () => {
      mockSupplierRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when department access denied', async () => {
      const supplier = {
        id: 1,
        supplier_name: 'Test Supplier',
        department_id: 1,
        tenant_id: 'test-tenant',
      };

      mockSupplierRepository.findOne.mockResolvedValue(supplier);
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(false);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateSupplierDto: UpdateSupplierDto = {
      supplier_name: 'Updated Supplier',
      email: 'updated@test.com',
    };

    it('should update a supplier successfully', async () => {
      const existingSupplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        email: 'test@example.com',
        tenant_id: 'test-tenant',
        department_id: 1,
      };

      const updatedSupplier = {
        ...existingSupplier,
        ...updateSupplierDto,
        modified_by: 'test@example.com',
      };

      mockSupplierRepository.findOne.mockResolvedValueOnce(existingSupplier); // findOne call
      mockSupplierRepository.findOne.mockResolvedValueOnce(null); // No existing supplier with new name
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);
      mockSupplierRepository.save.mockResolvedValue(updatedSupplier);

      const result = await service.update('1', updateSupplierDto);

      expect(supplierRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        ...existingSupplier,
        ...updateSupplierDto,
        modified_by: 'test@example.com',
      }));
      expect(result).toEqual(updatedSupplier);
    });

    it('should throw ConflictException when updated name already exists', async () => {
      const existingSupplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        tenant_id: 'test-tenant',
        department_id: 1,
      };

      const conflictingSupplier = {
        id: '2',
        supplier_name: 'Updated Supplier',
        tenant_id: 'test-tenant',
      };

      mockSupplierRepository.findOne.mockResolvedValueOnce(existingSupplier); // findOne call
      mockSupplierRepository.findOne.mockResolvedValueOnce(conflictingSupplier); // Existing supplier with new name
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);

      await expect(service.update('1', updateSupplierDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a supplier successfully', async () => {
      const supplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        tenant_id: 'test-tenant',
        department_id: 1,
      };

      mockSupplierRepository.findOne.mockResolvedValue(supplier);
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);
      mockSupplierRepository.remove.mockResolvedValue(supplier);

      await service.remove('1');

      expect(supplierRepository.remove).toHaveBeenCalledWith(supplier);
    });

    it('should throw NotFoundException when supplier not found', async () => {
      mockSupplierRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSupplierStats', () => {
    it('should return supplier statistics', async () => {
      mockSupplierRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getCount.mockResolvedValueOnce(100); // total
      mockQueryBuilder.getCount.mockResolvedValueOnce(80); // active
      mockQueryBuilder.getCount.mockResolvedValueOnce(15); // disabled
      mockQueryBuilder.getCount.mockResolvedValueOnce(5); // onHold
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { type: 'Company', count: '60' },
        { type: 'Individual', count: '40' },
      ]); // typeStats
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { country: 'USA', count: '50' },
        { country: 'Canada', count: '30' },
      ]); // countryStats
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { gst_category: 'Registered', count: '70' },
        { gst_category: 'Unregistered', count: '30' },
      ]); // gstStats
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { group_name: 'Group A', count: '40' },
        { group_name: 'Group B', count: '60' },
      ]); // groupStats

      const result = await service.getSupplierStats();

      expect(result).toEqual({
        total: 100,
        active: 80,
        disabled: 15,
        onHold: 5,
        byType: { Company: 60, Individual: 40 },
        byCountry: { USA: 50, Canada: 30 },
        byGstCategory: { Registered: 70, Unregistered: 30 },
        bySupplierGroup: { 'Group A': 40, 'Group B': 60 },
      });
    });
  });

  describe('getSuppliersByType', () => {
    it('should return suppliers by type', async () => {
      const expectedSuppliers = [
        { id: 1, supplier_name: 'Supplier 1', supplier_type: 'Company' },
        { id: 2, supplier_name: 'Supplier 2', supplier_type: 'Company' },
      ];

      mockDepartmentAccessService.getAccessibleDepartmentIds.mockReturnValue([1, 2]);
      mockSupplierRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(expectedSuppliers);

      const result = await service.getSuppliersByType('Company');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('supplier.supplier_type = :supplierType', { supplierType: 'Company' });
      expect(result).toEqual(expectedSuppliers);
    });
  });

  describe('getSuppliersByCountry', () => {
    it('should return suppliers by country', async () => {
      const expectedSuppliers = [
        { id: 1, supplier_name: 'Supplier 1', country: 'USA' },
        { id: 2, supplier_name: 'Supplier 2', country: 'USA' },
      ];

      mockDepartmentAccessService.getAccessibleDepartmentIds.mockReturnValue([1, 2]);
      mockSupplierRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(expectedSuppliers);

      const result = await service.getSuppliersByCountry('USA');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('supplier.country = :country', { country: 'USA' });
      expect(result).toEqual(expectedSuppliers);
    });
  });

  describe('getSuppliersByGroup', () => {
    it('should return suppliers by group', async () => {
      const expectedSuppliers = [
        { id: 1, supplier_name: 'Supplier 1', supplier_group: '1' },
        { id: 2, supplier_name: 'Supplier 2', supplier_group: '1' },
      ];

      mockSupplierRepository.find.mockResolvedValue(expectedSuppliers);

      const result = await service.getSuppliersByGroup('1');

      expect(supplierRepository.find).toHaveBeenCalledWith({
        where: { supplier_group: '1', tenant_id: 'test-tenant' },
        relations: ['supplierGroup'],
        order: { supplier_name: 'ASC' },
      });
      expect(result).toEqual(expectedSuppliers);
    });
  });

  describe('toggleSupplierStatus', () => {
    it('should toggle supplier status successfully', async () => {
      const supplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        disabled: false,
        tenant_id: 'test-tenant',
        department_id: 1,
      };

      const updatedSupplier = {
        ...supplier,
        disabled: true,
        modified_by: 'test@example.com',
      };

      mockSupplierRepository.findOne.mockResolvedValue(supplier);
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);
      mockSupplierRepository.save.mockResolvedValue(updatedSupplier);

      const result = await service.toggleSupplierStatus('1');

      expect(result.disabled).toBe(true);
      expect(result.modified_by).toBe('test@example.com');
    });
  });

  describe('updateHoldStatus', () => {
    it('should update hold status successfully', async () => {
      const supplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        hold_type: null,
        release_date: null,
        tenant_id: 'test-tenant',
        department_id: 1,
      };

      const updatedSupplier = {
        ...supplier,
        hold_type: 'All',
        release_date: new Date('2024-12-31'),
        modified_by: 'test@example.com',
      };

      mockSupplierRepository.findOne.mockResolvedValue(supplier);
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);
      mockSupplierRepository.save.mockResolvedValue(updatedSupplier);

      const result = await service.updateHoldStatus('1', 'All', '2024-12-31');

      expect(result.hold_type).toBe('All');
      expect(result.release_date).toEqual(new Date('2024-12-31'));
      expect(result.modified_by).toBe('test@example.com');
    });
  });

  describe('bulkUpdateSuppliers', () => {
    it('should bulk update suppliers successfully', async () => {
      const supplierIds = ['1', '2', '3'];
      const updateData = { disabled: true };

      mockSupplierRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.execute.mockResolvedValue({ affected: 3 });

      await service.bulkUpdateSuppliers(supplierIds, updateData);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(Supplier);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        ...updateData,
        modified_by: 'test@example.com',
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id IN (:...ids) AND tenant_id = :tenant_id', {
        ids: supplierIds,
        tenant_id: 'test-tenant',
      });
    });

    it('should throw ConflictException when no supplier IDs provided', async () => {
      await expect(service.bulkUpdateSuppliers([], {})).rejects.toThrow(ConflictException);
    });
  });

  describe('searchSuppliers', () => {
    it('should search suppliers successfully', async () => {
      const expectedSuppliers = [
        { id: 1, supplier_name: 'Test Supplier', email: 'test@example.com' },
      ];

      mockSupplierRepository.find.mockResolvedValue(expectedSuppliers);

      const result = await service.searchSuppliers('test', 10);

      expect(supplierRepository.find).toHaveBeenCalledWith({
        where: [
          { supplier_name: expect.any(Object), tenant_id: 'test-tenant' },
          { email: expect.any(Object), tenant_id: 'test-tenant' },
          { supplier_code: expect.any(Object), tenant_id: 'test-tenant' },
        ],
        relations: ['supplierGroup'],
        take: 10,
        order: { supplier_name: 'ASC' },
      });
      expect(result).toEqual(expectedSuppliers);
    });
  });

  describe('validateSupplierForRFQ', () => {
    it('should validate supplier for RFQ successfully', async () => {
      const supplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        disabled: false,
        prevent_rfqs: false,
        warn_rfqs: false,
        hold_type: null,
        tenant_id: 'test-tenant',
        department_id: 1,
      };

      mockSupplierRepository.findOne.mockResolvedValue(supplier);
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.validateSupplierForRFQ('1');

      expect(result).toEqual({
        canProceed: true,
        warnings: [],
      });
    });

    it('should return warnings for disabled supplier', async () => {
      const supplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        disabled: true,
        prevent_rfqs: false,
        warn_rfqs: true,
        hold_type: 'All',
        tenant_id: 'test-tenant',
        department_id: 1,
      };

      mockSupplierRepository.findOne.mockResolvedValue(supplier);
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.validateSupplierForRFQ('1');

      expect(result.canProceed).toBe(false);
      expect(result.warnings).toContain('Supplier is disabled');
      expect(result.warnings).toContain('Supplier is on hold: All');
    });
  });

  describe('validateSupplierForPO', () => {
    it('should validate supplier for PO successfully', async () => {
      const supplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        disabled: false,
        prevent_pos: false,
        warn_pos: false,
        hold_type: null,
        tenant_id: 'test-tenant',
        department_id: 1,
      };

      mockSupplierRepository.findOne.mockResolvedValue(supplier);
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.validateSupplierForPO('1');

      expect(result).toEqual({
        canProceed: true,
        warnings: [],
      });
    });

    it('should return warnings for supplier with PO restrictions', async () => {
      const supplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        disabled: false,
        prevent_pos: true,
        warn_pos: true,
        hold_type: 'Payments',
        tenant_id: 'test-tenant',
        department_id: 1,
      };

      mockSupplierRepository.findOne.mockResolvedValue(supplier);
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.validateSupplierForPO('1');

      expect(result.canProceed).toBe(false);
      expect(result.warnings).toContain('Purchase Orders are prevented for this supplier');
      expect(result.warnings).toContain('Supplier is on hold: Payments');
    });
  });

  describe('getSupplierPaymentTerms', () => {
    it('should return supplier payment terms', async () => {
      const supplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        default_payment_terms_template: 'Net 30',
        tenant_id: 'test-tenant',
        department_id: 1,
      };

      mockSupplierRepository.findOne.mockResolvedValue(supplier);
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.getSupplierPaymentTerms('1');

      expect(result).toBe('Net 30');
    });

    it('should return supplier group payment terms when supplier has none', async () => {
      const supplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        default_payment_terms_template: null,
        supplierGroup: {
          default_payment_terms_template: 'Net 15',
        },
        tenant_id: 'test-tenant',
        department_id: 1,
      };

      mockSupplierRepository.findOne.mockResolvedValue(supplier);
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.getSupplierPaymentTerms('1');

      expect(result).toBe('Net 15');
    });
  });

  describe('getSupplierPriceList', () => {
    it('should return supplier price list', async () => {
      const supplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        default_price_list: 'Standard Buying',
        tenant_id: 'test-tenant',
        department_id: 1,
      };

      mockSupplierRepository.findOne.mockResolvedValue(supplier);
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.getSupplierPriceList('1');

      expect(result).toBe('Standard Buying');
    });

    it('should return supplier group price list when supplier has none', async () => {
      const supplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        default_price_list: null,
        supplierGroup: {
          default_price_list: 'Group Buying',
        },
        tenant_id: 'test-tenant',
        department_id: 1,
      };

      mockSupplierRepository.findOne.mockResolvedValue(supplier);
      mockDepartmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.getSupplierPriceList('1');

      expect(result).toBe('Group Buying');
    });
  });
});