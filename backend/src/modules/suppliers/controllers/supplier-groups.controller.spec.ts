import { Test, TestingModule } from '@nestjs/testing';
import { SupplierGroupsController } from './supplier-groups.controller';
import { SupplierGroupsService } from '../services/supplier-groups.service';
import { CreateSupplierGroupDto } from '../dto/create-supplier-group.dto';
import { UpdateSupplierGroupDto } from '../dto/update-supplier-group.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('SupplierGroupsController', () => {
  let controller: SupplierGroupsController;
  let service: SupplierGroupsService;

  const mockSupplierGroupsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findTree: jest.fn(),
    findOne: jest.fn(),
    findChildren: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getGroupStats: jest.fn(),
    moveGroup: jest.fn(),
    getGroupHierarchy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierGroupsController],
      providers: [
        {
          provide: SupplierGroupsService,
          useValue: mockSupplierGroupsService,
        },
      ],
    }).compile();

    controller = module.get<SupplierGroupsController>(SupplierGroupsController);
    service = module.get<SupplierGroupsService>(SupplierGroupsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      mockSupplierGroupsService.create.mockResolvedValue(expectedGroup);

      const result = await controller.create(createSupplierGroupDto);

      expect(service.create).toHaveBeenCalledWith(createSupplierGroupDto);
      expect(result).toEqual(expectedGroup);
    });

    it('should handle ConflictException when group name already exists', async () => {
      mockSupplierGroupsService.create.mockRejectedValue(new ConflictException('Supplier group with this name already exists'));

      await expect(controller.create(createSupplierGroupDto)).rejects.toThrow(ConflictException);
      expect(service.create).toHaveBeenCalledWith(createSupplierGroupDto);
    });

    it('should handle NotFoundException when parent group not found', async () => {
      const createWithParentDto = {
        ...createSupplierGroupDto,
        parent_supplier_group: 'non-existent-parent',
      };

      mockSupplierGroupsService.create.mockRejectedValue(new NotFoundException('Parent supplier group not found'));

      await expect(controller.create(createWithParentDto)).rejects.toThrow(NotFoundException);
      expect(service.create).toHaveBeenCalledWith(createWithParentDto);
    });
  });

  describe('findAll', () => {
    it('should return all supplier groups with total count', async () => {
      const expectedGroups = [
        { id: '1', supplier_group_name: 'Group 1' },
        { id: '2', supplier_group_name: 'Group 2' },
      ];

      mockSupplierGroupsService.findAll.mockResolvedValue(expectedGroups);

      const result = await controller.findAll({});

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        groups: expectedGroups,
        total: expectedGroups.length,
      });
    });

    it('should handle empty result', async () => {
      mockSupplierGroupsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll({});

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        groups: [],
        total: 0,
      });
    });
  });

  describe('getTree', () => {
    it('should return supplier groups in tree structure', async () => {
      const expectedTree = [
        {
          id: '1',
          supplier_group_name: 'Root 1',
          children: [
            { id: '2', supplier_group_name: 'Child 1', children: [] },
            { id: '3', supplier_group_name: 'Child 2', children: [] },
          ],
        },
        {
          id: '4',
          supplier_group_name: 'Root 2',
          children: [],
        },
      ];

      mockSupplierGroupsService.findTree.mockResolvedValue(expectedTree);

      const result = await controller.getTree();

      expect(service.findTree).toHaveBeenCalled();
      expect(result).toEqual(expectedTree);
    });

    it('should handle empty tree', async () => {
      mockSupplierGroupsService.findTree.mockResolvedValue([]);

      const result = await controller.getTree();

      expect(service.findTree).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getGroupStats', () => {
    it('should return group statistics', async () => {
      const expectedStats = {
        totalSuppliers: 10,
        activeSuppliers: 8,
        disabledSuppliers: 2,
        childGroups: 3,
      };

      mockSupplierGroupsService.getGroupStats.mockResolvedValue(expectedStats);

      const result = await controller.getGroupStats('1');

      expect(service.getGroupStats).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedStats);
    });

    it('should handle NotFoundException when group not found', async () => {
      mockSupplierGroupsService.getGroupStats.mockRejectedValue(new NotFoundException('Supplier group not found'));

      await expect(controller.getGroupStats('999')).rejects.toThrow(NotFoundException);
      expect(service.getGroupStats).toHaveBeenCalledWith('999');
    });
  });

  describe('findOne', () => {
    it('should return a supplier group by id', async () => {
      const expectedGroup = {
        id: '1',
        supplier_group_name: 'Test Group',
        suppliers: [],
      };

      mockSupplierGroupsService.findOne.mockResolvedValue(expectedGroup);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedGroup);
    });

    it('should handle NotFoundException when group not found', async () => {
      mockSupplierGroupsService.findOne.mockRejectedValue(new NotFoundException('Supplier group not found'));

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith('999');
    });
  });

  describe('getChildren', () => {
    it('should return children of a supplier group', async () => {
      const expectedChildren = [
        { id: '2', supplier_group_name: 'Child 1', parent_supplier_group: '1' },
        { id: '3', supplier_group_name: 'Child 2', parent_supplier_group: '1' },
      ];

      mockSupplierGroupsService.findChildren.mockResolvedValue(expectedChildren);

      const result = await controller.getChildren('1');

      expect(service.findChildren).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedChildren);
    });

    it('should return empty array when group has no children', async () => {
      mockSupplierGroupsService.findChildren.mockResolvedValue([]);

      const result = await controller.getChildren('1');

      expect(service.findChildren).toHaveBeenCalledWith('1');
      expect(result).toEqual([]);
    });
  });

  describe('getHierarchy', () => {
    it('should return complete hierarchy for a group', async () => {
      const hierarchyData = {
        group: { id: '3', supplier_group_name: 'Current Group' },
        ancestors: [
          { id: '1', supplier_group_name: 'Grandparent' },
          { id: '2', supplier_group_name: 'Parent' },
        ],
        descendants: [
          { id: '4', supplier_group_name: 'Child' },
          { id: '5', supplier_group_name: 'Grandchild' },
        ],
      };

      const expectedResult = {
        ancestors: hierarchyData.ancestors,
        current: hierarchyData.group,
        descendants: hierarchyData.descendants,
      };

      mockSupplierGroupsService.getGroupHierarchy.mockResolvedValue(hierarchyData);

      const result = await controller.getHierarchy('3');

      expect(service.getGroupHierarchy).toHaveBeenCalledWith('3');
      expect(result).toEqual(expectedResult);
    });

    it('should handle group with no hierarchy', async () => {
      const hierarchyData = {
        group: { id: '1', supplier_group_name: 'Isolated Group' },
        ancestors: [],
        descendants: [],
      };

      const expectedResult = {
        ancestors: [],
        current: hierarchyData.group,
        descendants: [],
      };

      mockSupplierGroupsService.getGroupHierarchy.mockResolvedValue(hierarchyData);

      const result = await controller.getHierarchy('1');

      expect(service.getGroupHierarchy).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResult);
    });

    it('should handle NotFoundException when group not found', async () => {
      mockSupplierGroupsService.getGroupHierarchy.mockRejectedValue(new NotFoundException('Supplier group not found'));

      await expect(controller.getHierarchy('999')).rejects.toThrow(NotFoundException);
      expect(service.getGroupHierarchy).toHaveBeenCalledWith('999');
    });
  });

  describe('update', () => {
    const updateSupplierGroupDto: UpdateSupplierGroupDto = {
      supplier_group_name: 'Updated Group',
    };

    it('should update a supplier group successfully', async () => {
      const expectedGroup = {
        id: '1',
        ...updateSupplierGroupDto,
        modified_by: 'test@example.com',
      };

      mockSupplierGroupsService.update.mockResolvedValue(expectedGroup);

      const result = await controller.update('1', updateSupplierGroupDto);

      expect(service.update).toHaveBeenCalledWith('1', updateSupplierGroupDto);
      expect(result).toEqual(expectedGroup);
    });

    it('should handle ConflictException when updated name already exists', async () => {
      mockSupplierGroupsService.update.mockRejectedValue(new ConflictException('Supplier group with this name already exists'));

      await expect(controller.update('1', updateSupplierGroupDto)).rejects.toThrow(ConflictException);
      expect(service.update).toHaveBeenCalledWith('1', updateSupplierGroupDto);
    });

    it('should handle ConflictException for circular reference', async () => {
      const updateWithCircularRef = {
        parent_supplier_group: '1',
      };

      mockSupplierGroupsService.update.mockRejectedValue(new ConflictException('Circular reference detected in group hierarchy'));

      await expect(controller.update('1', updateWithCircularRef)).rejects.toThrow(ConflictException);
      expect(service.update).toHaveBeenCalledWith('1', updateWithCircularRef);
    });

    it('should handle NotFoundException when group not found', async () => {
      mockSupplierGroupsService.update.mockRejectedValue(new NotFoundException('Supplier group not found'));

      await expect(controller.update('999', updateSupplierGroupDto)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith('999', updateSupplierGroupDto);
    });
  });

  describe('moveGroup', () => {
    it('should move group to new parent successfully', async () => {
      const expectedGroup = {
        id: '1',
        supplier_group_name: 'Test Group',
        parent_supplier_group: '2',
        modified_by: 'test@example.com',
      };

      mockSupplierGroupsService.moveGroup.mockResolvedValue(expectedGroup);

      const result = await controller.moveGroup('1', '2');

      expect(service.moveGroup).toHaveBeenCalledWith('1', '2');
      expect(result).toEqual(expectedGroup);
    });

    it('should move group to root (null parent)', async () => {
      const expectedGroup = {
        id: '1',
        supplier_group_name: 'Test Group',
        parent_supplier_group: null,
        modified_by: 'test@example.com',
      };

      mockSupplierGroupsService.moveGroup.mockResolvedValue(expectedGroup);

      const result = await controller.moveGroup('1', null);

      expect(service.moveGroup).toHaveBeenCalledWith('1', null);
      expect(result).toEqual(expectedGroup);
    });

    it('should handle ConflictException for circular reference', async () => {
      mockSupplierGroupsService.moveGroup.mockRejectedValue(new ConflictException('Circular reference detected in group hierarchy'));

      await expect(controller.moveGroup('1', '1')).rejects.toThrow(ConflictException);
      expect(service.moveGroup).toHaveBeenCalledWith('1', '1');
    });

    it('should handle NotFoundException when group not found', async () => {
      mockSupplierGroupsService.moveGroup.mockRejectedValue(new NotFoundException('Supplier group not found'));

      await expect(controller.moveGroup('999', '2')).rejects.toThrow(NotFoundException);
      expect(service.moveGroup).toHaveBeenCalledWith('999', '2');
    });

    it('should handle NotFoundException when new parent not found', async () => {
      mockSupplierGroupsService.moveGroup.mockRejectedValue(new NotFoundException('New parent group not found'));

      await expect(controller.moveGroup('1', 'non-existent')).rejects.toThrow(NotFoundException);
      expect(service.moveGroup).toHaveBeenCalledWith('1', 'non-existent');
    });
  });

  describe('remove', () => {
    it('should remove a supplier group successfully', async () => {
      mockSupplierGroupsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should handle NotFoundException when group not found', async () => {
      mockSupplierGroupsService.remove.mockRejectedValue(new NotFoundException('Supplier group not found'));

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith('999');
    });

    it('should handle ConflictException when group has children', async () => {
      mockSupplierGroupsService.remove.mockRejectedValue(new ConflictException('Cannot delete group that has child groups'));

      await expect(controller.remove('1')).rejects.toThrow(ConflictException);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should handle ConflictException when group has suppliers', async () => {
      mockSupplierGroupsService.remove.mockRejectedValue(new ConflictException('Cannot delete group that has suppliers assigned'));

      await expect(controller.remove('1')).rejects.toThrow(ConflictException);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});