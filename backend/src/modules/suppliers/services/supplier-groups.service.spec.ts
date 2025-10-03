import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { SupplierGroupsService } from './supplier-groups.service';
import { SupplierGroup } from '../../../entities/supplier-group.entity';
import { CreateSupplierGroupDto } from '../dto/create-supplier-group.dto';
import { UpdateSupplierGroupDto } from '../dto/update-supplier-group.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('SupplierGroupsService', () => {
  let service: SupplierGroupsService;
  let supplierGroupRepository: Repository<SupplierGroup>;

  const mockRequest = {
    tenant_id: 'test-tenant',
    user: {
      id: 1,
      email: 'test@example.com',
      tenant_id: 'test-tenant',
    },
  };

  const mockSupplierGroupRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierGroupsService,
        {
          provide: getRepositoryToken(SupplierGroup),
          useValue: mockSupplierGroupRepository,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = module.get<SupplierGroupsService>(SupplierGroupsService);
    supplierGroupRepository = module.get<Repository<SupplierGroup>>(getRepositoryToken(SupplierGroup));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createSupplierGroupDto: CreateSupplierGroupDto = {
      supplier_group_name: 'Test Group',
      is_group: true,
      parent_supplier_group: null,
    };

    it('should create a supplier group successfully', async () => {
      const expectedGroup = {
        id: '1',
        ...createSupplierGroupDto,
        tenant_id: 'test-tenant',
        owner: 'test@example.com',
      };

      mockSupplierGroupRepository.findOne.mockResolvedValue(null); // No existing group
      mockSupplierGroupRepository.create.mockReturnValue(expectedGroup);
      mockSupplierGroupRepository.save.mockResolvedValue(expectedGroup);

      const result = await service.create(createSupplierGroupDto);

      expect(supplierGroupRepository.findOne).toHaveBeenCalledWith({
        where: {
          supplier_group_name: createSupplierGroupDto.supplier_group_name,
          tenant_id: 'test-tenant',
        },
      });
      expect(supplierGroupRepository.create).toHaveBeenCalledWith({
        ...createSupplierGroupDto,
        tenant_id: 'test-tenant',
        owner: 'test@example.com',
        parent_supplier_group: null,
      });
      expect(result).toEqual(expectedGroup);
    });

    it('should throw ConflictException when group name already exists', async () => {
      mockSupplierGroupRepository.findOne.mockResolvedValue({ id: '1', supplier_group_name: 'Test Group' });

      await expect(service.create(createSupplierGroupDto)).rejects.toThrow(ConflictException);
      expect(supplierGroupRepository.findOne).toHaveBeenCalledWith({
        where: {
          supplier_group_name: createSupplierGroupDto.supplier_group_name,
          tenant_id: 'test-tenant',
        },
      });
    });

    it('should create group with parent successfully', async () => {
      const createWithParentDto = {
        ...createSupplierGroupDto,
        parent_supplier_group: 'parent-id',
      };

      const parentGroup = {
        id: 'parent-id',
        supplier_group_name: 'Parent Group',
        is_group: false,
        tenant_id: 'test-tenant',
      };

      const expectedGroup = {
        id: '1',
        ...createWithParentDto,
        tenant_id: 'test-tenant',
        owner: 'test@example.com',
        parent_supplier_group: 'parent-id',
      };

      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(null); // No existing group
      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(parentGroup); // Parent group exists
      mockSupplierGroupRepository.save.mockResolvedValueOnce({ ...parentGroup, is_group: true }); // Save parent as group
      mockSupplierGroupRepository.create.mockReturnValue(expectedGroup);
      mockSupplierGroupRepository.save.mockResolvedValueOnce(expectedGroup);

      const result = await service.create(createWithParentDto);

      expect(result).toEqual(expectedGroup);
      expect(supplierGroupRepository.save).toHaveBeenCalledWith({ ...parentGroup, is_group: true });
    });

    it('should throw NotFoundException when parent group not found', async () => {
      const createWithParentDto = {
        ...createSupplierGroupDto,
        parent_supplier_group: 'non-existent-parent',
      };

      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(null); // No existing group
      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(null); // Parent not found

      await expect(service.create(createWithParentDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all supplier groups for tenant', async () => {
      const expectedGroups = [
        { id: '1', supplier_group_name: 'Group 1', tenant_id: 'test-tenant' },
        { id: '2', supplier_group_name: 'Group 2', tenant_id: 'test-tenant' },
      ];

      mockSupplierGroupRepository.find.mockResolvedValue(expectedGroups);

      const result = await service.findAll();

      expect(supplierGroupRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'test-tenant' },
        order: { supplier_group_name: 'ASC' },
      });
      expect(result).toEqual(expectedGroups);
    });
  });

  describe('findTree', () => {
    it('should return groups in tree structure', async () => {
      const allGroups = [
        { id: '1', supplier_group_name: 'Root 1', parent_supplier_group: null, tenant_id: 'test-tenant' },
        { id: '2', supplier_group_name: 'Child 1', parent_supplier_group: '1', tenant_id: 'test-tenant' },
        { id: '3', supplier_group_name: 'Root 2', parent_supplier_group: null, tenant_id: 'test-tenant' },
        { id: '4', supplier_group_name: 'Child 2', parent_supplier_group: '1', tenant_id: 'test-tenant' },
      ];

      mockSupplierGroupRepository.find.mockResolvedValue(allGroups);

      const result = await service.findTree();

      expect(supplierGroupRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'test-tenant' },
        order: { supplier_group_name: 'ASC' },
      });
      expect(result).toHaveLength(2); // Two root groups
      expect(result[0].children).toHaveLength(2); // Root 1 has 2 children
      expect(result[1].children).toHaveLength(0); // Root 2 has no children
    });

    it('should handle orphaned groups (parent not in tenant)', async () => {
      const allGroups = [
        { id: '1', supplier_group_name: 'Orphaned', parent_supplier_group: 'non-existent', tenant_id: 'test-tenant' },
      ];

      mockSupplierGroupRepository.find.mockResolvedValue(allGroups);

      const result = await service.findTree();

      expect(result).toHaveLength(1); // Orphaned group becomes root
      expect(result[0].id).toBe('1');
    });
  });

  describe('findOne', () => {
    it('should return a supplier group by id', async () => {
      const expectedGroup = {
        id: '1',
        supplier_group_name: 'Test Group',
        tenant_id: 'test-tenant',
        suppliers: [],
      };

      mockSupplierGroupRepository.findOne.mockResolvedValue(expectedGroup);

      const result = await service.findOne('1');

      expect(supplierGroupRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', tenant_id: 'test-tenant' },
        relations: ['suppliers'],
      });
      expect(result).toEqual(expectedGroup);
    });

    it('should throw NotFoundException when group not found', async () => {
      mockSupplierGroupRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findChildren', () => {
    it('should return children of a supplier group', async () => {
      const expectedChildren = [
        { id: '2', supplier_group_name: 'Child 1', parent_supplier_group: '1' },
        { id: '3', supplier_group_name: 'Child 2', parent_supplier_group: '1' },
      ];

      mockSupplierGroupRepository.find.mockResolvedValue(expectedChildren);

      const result = await service.findChildren('1');

      expect(supplierGroupRepository.find).toHaveBeenCalledWith({
        where: {
          parent_supplier_group: '1',
          tenant_id: 'test-tenant',
        },
        order: { supplier_group_name: 'ASC' },
      });
      expect(result).toEqual(expectedChildren);
    });
  });

  describe('update', () => {
    const updateSupplierGroupDto: UpdateSupplierGroupDto = {
      supplier_group_name: 'Updated Group',
    };

    it('should update a supplier group successfully', async () => {
      const existingGroup = {
        id: '1',
        supplier_group_name: 'Test Group',
        tenant_id: 'test-tenant',
        suppliers: [],
      };

      const updatedGroup = {
        ...existingGroup,
        ...updateSupplierGroupDto,
        modified_by: 'test@example.com',
      };

      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(existingGroup); // findOne call
      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(null); // No existing group with new name
      mockSupplierGroupRepository.save.mockResolvedValue(updatedGroup);

      const result = await service.update('1', updateSupplierGroupDto);

      expect(result).toEqual(updatedGroup);
      expect(result.modified_by).toBe('test@example.com');
    });

    it('should throw ConflictException when updated name already exists', async () => {
      const existingGroup = {
        id: '1',
        supplier_group_name: 'Test Group',
        tenant_id: 'test-tenant',
        suppliers: [],
      };

      const conflictingGroup = {
        id: '2',
        supplier_group_name: 'Updated Group',
        tenant_id: 'test-tenant',
      };

      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(existingGroup); // findOne call
      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(conflictingGroup); // Existing group with new name

      await expect(service.update('1', updateSupplierGroupDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when trying to set self as parent', async () => {
      const existingGroup = {
        id: '1',
        supplier_group_name: 'Test Group',
        tenant_id: 'test-tenant',
        suppliers: [],
      };

      const updateWithSelfParent = {
        parent_supplier_group: '1',
      };

      mockSupplierGroupRepository.findOne.mockResolvedValue(existingGroup);

      await expect(service.update('1', updateWithSelfParent)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when parent group not found', async () => {
      const existingGroup = {
        id: '1',
        supplier_group_name: 'Test Group',
        tenant_id: 'test-tenant',
        suppliers: [],
      };

      const updateWithInvalidParent = {
        parent_supplier_group: 'non-existent',
      };

      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(existingGroup); // findOne call
      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(null); // Parent not found

      await expect(service.update('1', updateWithInvalidParent)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a supplier group successfully', async () => {
      const group = {
        id: '1',
        supplier_group_name: 'Test Group',
        tenant_id: 'test-tenant',
        suppliers: [],
      };

      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(group); // findOne call
      mockSupplierGroupRepository.find.mockResolvedValue([]); // No children
      mockSupplierGroupRepository.remove.mockResolvedValue(group);

      await service.remove('1');

      expect(supplierGroupRepository.remove).toHaveBeenCalledWith(group);
    });

    it('should throw ConflictException when group has children', async () => {
      const group = {
        id: '1',
        supplier_group_name: 'Test Group',
        tenant_id: 'test-tenant',
        suppliers: [],
      };

      const children = [
        { id: '2', supplier_group_name: 'Child Group', parent_supplier_group: '1' },
      ];

      mockSupplierGroupRepository.findOne.mockResolvedValue(group);
      mockSupplierGroupRepository.find.mockResolvedValue(children);

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when group has suppliers', async () => {
      const group = {
        id: '1',
        supplier_group_name: 'Test Group',
        tenant_id: 'test-tenant',
        suppliers: [{ id: '1', supplier_name: 'Test Supplier' }],
      };

      mockSupplierGroupRepository.findOne.mockResolvedValue(group);
      mockSupplierGroupRepository.find.mockResolvedValue([]); // No children

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });
  });

  describe('getGroupStats', () => {
    it('should return group statistics', async () => {
      const group = {
        id: '1',
        supplier_group_name: 'Test Group',
        tenant_id: 'test-tenant',
        suppliers: [
          { id: '1', supplier_name: 'Supplier 1', disabled: false },
          { id: '2', supplier_name: 'Supplier 2', disabled: true },
          { id: '3', supplier_name: 'Supplier 3', disabled: false },
        ],
      };

      const children = [
        { id: '2', supplier_group_name: 'Child 1' },
        { id: '3', supplier_group_name: 'Child 2' },
      ];

      mockSupplierGroupRepository.findOne.mockResolvedValue(group);
      mockSupplierGroupRepository.find.mockResolvedValue(children);

      const result = await service.getGroupStats('1');

      expect(result).toEqual({
        totalSuppliers: 3,
        activeSuppliers: 2,
        disabledSuppliers: 1,
        childGroups: 2,
      });
    });

    it('should handle group with no suppliers', async () => {
      const group = {
        id: '1',
        supplier_group_name: 'Test Group',
        tenant_id: 'test-tenant',
        suppliers: [],
      };

      mockSupplierGroupRepository.findOne.mockResolvedValue(group);
      mockSupplierGroupRepository.find.mockResolvedValue([]);

      const result = await service.getGroupStats('1');

      expect(result).toEqual({
        totalSuppliers: 0,
        activeSuppliers: 0,
        disabledSuppliers: 0,
        childGroups: 0,
      });
    });
  });

  describe('moveGroup', () => {
    it('should move group to new parent successfully', async () => {
      const group = {
        id: '1',
        supplier_group_name: 'Test Group',
        parent_supplier_group: null,
        tenant_id: 'test-tenant',
      };

      const newParent = {
        id: '2',
        supplier_group_name: 'New Parent',
        is_group: false,
        tenant_id: 'test-tenant',
      };

      const movedGroup = {
        ...group,
        parent_supplier_group: '2',
        modified_by: 'test@example.com',
      };

      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(group); // findOne call
      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(newParent); // New parent exists
      mockSupplierGroupRepository.save.mockResolvedValueOnce({ ...newParent, is_group: true }); // Save parent as group
      mockSupplierGroupRepository.save.mockResolvedValueOnce(movedGroup);

      const result = await service.moveGroup('1', '2');

      expect(result).toEqual(movedGroup);
      expect(supplierGroupRepository.save).toHaveBeenCalledWith({ ...newParent, is_group: true });
    });

    it('should move group to root (null parent)', async () => {
      const group = {
        id: '1',
        supplier_group_name: 'Test Group',
        parent_supplier_group: '2',
        tenant_id: 'test-tenant',
      };

      const movedGroup = {
        ...group,
        parent_supplier_group: null,
        modified_by: 'test@example.com',
      };

      mockSupplierGroupRepository.findOne.mockResolvedValue(group);
      mockSupplierGroupRepository.save.mockResolvedValue(movedGroup);

      const result = await service.moveGroup('1', null);

      expect(result).toEqual(movedGroup);
    });

    it('should throw ConflictException when trying to set self as parent', async () => {
      const group = {
        id: '1',
        supplier_group_name: 'Test Group',
        tenant_id: 'test-tenant',
      };

      mockSupplierGroupRepository.findOne.mockResolvedValue(group);

      await expect(service.moveGroup('1', '1')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when new parent not found', async () => {
      const group = {
        id: '1',
        supplier_group_name: 'Test Group',
        tenant_id: 'test-tenant',
      };

      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(group); // findOne call
      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(null); // New parent not found

      await expect(service.moveGroup('1', 'non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getGroupHierarchy', () => {
    it('should return complete hierarchy for a group', async () => {
      const group = {
        id: '3',
        supplier_group_name: 'Current Group',
        parent_supplier_group: '2',
        tenant_id: 'test-tenant',
      };

      const parent = {
        id: '2',
        supplier_group_name: 'Parent Group',
        parent_supplier_group: '1',
        tenant_id: 'test-tenant',
      };

      const grandparent = {
        id: '1',
        supplier_group_name: 'Grandparent Group',
        parent_supplier_group: null,
        tenant_id: 'test-tenant',
      };

      const children = [
        { id: '4', supplier_group_name: 'Child 1', parent_supplier_group: '3' },
      ];

      const grandchildren = [
        { id: '5', supplier_group_name: 'Grandchild 1', parent_supplier_group: '4' },
      ];

      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(group); // findOne call
      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(parent); // Parent
      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(grandparent); // Grandparent
      mockSupplierGroupRepository.findOne.mockResolvedValueOnce(null); // No more ancestors
      mockSupplierGroupRepository.find.mockResolvedValueOnce(children); // Direct children
      mockSupplierGroupRepository.find.mockResolvedValueOnce(grandchildren); // Grandchildren
      mockSupplierGroupRepository.find.mockResolvedValueOnce([]); // No more descendants

      const result = await service.getGroupHierarchy('3');

      expect(result.group).toEqual(group);
      expect(result.ancestors).toEqual([grandparent, parent]);
      expect(result.descendants).toEqual([...children, ...grandchildren]);
    });

    it('should handle group with no ancestors or descendants', async () => {
      const group = {
        id: '1',
        supplier_group_name: 'Isolated Group',
        parent_supplier_group: null,
        tenant_id: 'test-tenant',
      };

      mockSupplierGroupRepository.findOne.mockResolvedValue(group);
      mockSupplierGroupRepository.find.mockResolvedValue([]);

      const result = await service.getGroupHierarchy('1');

      expect(result.group).toEqual(group);
      expect(result.ancestors).toEqual([]);
      expect(result.descendants).toEqual([]);
    });
  });
});