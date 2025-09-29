import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from '../services/departments.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let departmentsService: jest.Mocked<DepartmentsService>;

  const mockDepartment = {
    id: '1',
    name: 'Engineering',
    department_name: 'Engineering Department',
    description: 'Software Engineering Department',
    manager_id: 'manager1',
    parent_department: null,
    disabled: false,
    tenant_id: 'tenant1',
    owner: 'admin@test.com',
    created_at: new Date(),
    updated_at: new Date(),
    employees: [],
  };

  const mockCreateDepartmentDto: CreateDepartmentDto = {
    name: 'Engineering',
    department_name: 'Engineering Department',
    description: 'Software Engineering Department',
    manager_id: 'manager1',
    parent_department: null,
  };

  const mockUpdateDepartmentDto: UpdateDepartmentDto = {
    name: 'Software Engineering',
    description: 'Updated Software Engineering Department',
  };

  beforeEach(async () => {
    const mockDepartmentsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByName: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getActiveDepartments: jest.fn(),
      getDepartmentHierarchy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        {
          provide: DepartmentsService,
          useValue: mockDepartmentsService,
        },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    departmentsService = module.get(DepartmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new department successfully', async () => {
      departmentsService.create.mockResolvedValue(mockDepartment);

      const result = await controller.create(mockCreateDepartmentDto);

      expect(departmentsService.create).toHaveBeenCalledWith(mockCreateDepartmentDto);
      expect(result).toEqual(mockDepartment);
    });

    it('should throw ConflictException when department name already exists', async () => {
      departmentsService.create.mockRejectedValue(new ConflictException('Department with this name already exists'));

      await expect(controller.create(mockCreateDepartmentDto)).rejects.toThrow(ConflictException);
      expect(departmentsService.create).toHaveBeenCalledWith(mockCreateDepartmentDto);
    });

    it('should handle department creation with parent department', async () => {
      const createDtoWithParent = {
        ...mockCreateDepartmentDto,
        parent_department: 'parent-dept-id',
      };
      const departmentWithParent = {
        ...mockDepartment,
        parent_department: 'parent-dept-id',
      };
      departmentsService.create.mockResolvedValue(departmentWithParent);

      const result = await controller.create(createDtoWithParent);

      expect(departmentsService.create).toHaveBeenCalledWith(createDtoWithParent);
      expect(result).toEqual(departmentWithParent);
    });

    it('should handle department creation with minimal data', async () => {
      const minimalCreateDto = {
        name: 'HR',
        department_name: 'Human Resources',
      };
      const minimalDepartment = {
        ...mockDepartment,
        name: 'HR',
        department_name: 'Human Resources',
        description: null,
        manager_id: null,
      };
      departmentsService.create.mockResolvedValue(minimalDepartment);

      const result = await controller.create(minimalCreateDto);

      expect(departmentsService.create).toHaveBeenCalledWith(minimalCreateDto);
      expect(result).toEqual(minimalDepartment);
    });
  });

  describe('findAll', () => {
    it('should return all departments', async () => {
      const mockDepartments = [mockDepartment];
      departmentsService.findAll.mockResolvedValue(mockDepartments);

      const result = await controller.findAll();

      expect(departmentsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockDepartments);
    });

    it('should return empty array when no departments found', async () => {
      departmentsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(departmentsService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return multiple departments', async () => {
      const mockDepartments = [
        mockDepartment,
        { ...mockDepartment, id: '2', name: 'HR', department_name: 'Human Resources' },
        { ...mockDepartment, id: '3', name: 'Finance', department_name: 'Finance Department' },
      ];
      departmentsService.findAll.mockResolvedValue(mockDepartments);

      const result = await controller.findAll();

      expect(departmentsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockDepartments);
      expect(result).toHaveLength(3);
    });
  });

  describe('getActiveDepartments', () => {
    it('should return active departments', async () => {
      const mockActiveDepartments = [mockDepartment];
      departmentsService.getActiveDepartments.mockResolvedValue(mockActiveDepartments);

      const result = await controller.getActiveDepartments();

      expect(departmentsService.getActiveDepartments).toHaveBeenCalled();
      expect(result).toEqual(mockActiveDepartments);
    });

    it('should return empty array when no active departments', async () => {
      departmentsService.getActiveDepartments.mockResolvedValue([]);

      const result = await controller.getActiveDepartments();

      expect(departmentsService.getActiveDepartments).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should filter out disabled departments', async () => {
      const activeDepartment = { ...mockDepartment, disabled: false };
      const mockActiveDepartments = [activeDepartment];
      departmentsService.getActiveDepartments.mockResolvedValue(mockActiveDepartments);

      const result = await controller.getActiveDepartments();

      expect(departmentsService.getActiveDepartments).toHaveBeenCalled();
      expect(result).toEqual(mockActiveDepartments);
      expect(result.every(dept => !dept.disabled)).toBe(true);
    });
  });

  describe('getDepartmentHierarchy', () => {
    it('should return department hierarchy', async () => {
      const mockHierarchy = [mockDepartment];
      departmentsService.getDepartmentHierarchy.mockResolvedValue(mockHierarchy);

      const result = await controller.getDepartmentHierarchy();

      expect(departmentsService.getDepartmentHierarchy).toHaveBeenCalled();
      expect(result).toEqual(mockHierarchy);
    });

    it('should return empty array when no departments in hierarchy', async () => {
      departmentsService.getDepartmentHierarchy.mockResolvedValue([]);

      const result = await controller.getDepartmentHierarchy();

      expect(departmentsService.getDepartmentHierarchy).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return only root departments in hierarchy', async () => {
      const rootDepartment1 = { ...mockDepartment, id: '1', parent_department: null };
      const rootDepartment2 = { ...mockDepartment, id: '2', name: 'HR', parent_department: null };
      const mockHierarchy = [rootDepartment1, rootDepartment2];
      departmentsService.getDepartmentHierarchy.mockResolvedValue(mockHierarchy);

      const result = await controller.getDepartmentHierarchy();

      expect(departmentsService.getDepartmentHierarchy).toHaveBeenCalled();
      expect(result).toEqual(mockHierarchy);
      expect(result.every(dept => dept.parent_department === null)).toBe(true);
    });
  });

  describe('findByName', () => {
    it('should return department by name', async () => {
      departmentsService.findByName.mockResolvedValue(mockDepartment);

      const result = await controller.findByName('Engineering');

      expect(departmentsService.findByName).toHaveBeenCalledWith('Engineering');
      expect(result).toEqual(mockDepartment);
    });

    it('should throw NotFoundException when department not found', async () => {
      departmentsService.findByName.mockRejectedValue(new NotFoundException('Department not found'));

      await expect(controller.findByName('NonExistent')).rejects.toThrow(NotFoundException);
      expect(departmentsService.findByName).toHaveBeenCalledWith('NonExistent');
    });

    it('should handle names with special characters', async () => {
      const specialName = 'R&D Department';
      const specialDepartment = { ...mockDepartment, name: specialName };
      departmentsService.findByName.mockResolvedValue(specialDepartment);

      const result = await controller.findByName(specialName);

      expect(departmentsService.findByName).toHaveBeenCalledWith(specialName);
      expect(result).toEqual(specialDepartment);
    });

    it('should handle names with spaces', async () => {
      const nameWithSpaces = 'Human Resources';
      const departmentWithSpaces = { ...mockDepartment, name: nameWithSpaces };
      departmentsService.findByName.mockResolvedValue(departmentWithSpaces);

      const result = await controller.findByName(nameWithSpaces);

      expect(departmentsService.findByName).toHaveBeenCalledWith(nameWithSpaces);
      expect(result).toEqual(departmentWithSpaces);
    });

    it('should be case sensitive', async () => {
      departmentsService.findByName.mockRejectedValue(new NotFoundException('Department not found'));

      await expect(controller.findByName('engineering')).rejects.toThrow(NotFoundException);
      expect(departmentsService.findByName).toHaveBeenCalledWith('engineering');
    });
  });

  describe('findOne', () => {
    it('should return department by id', async () => {
      departmentsService.findOne.mockResolvedValue(mockDepartment);

      const result = await controller.findOne('1');

      expect(departmentsService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockDepartment);
    });

    it('should throw NotFoundException when department not found', async () => {
      departmentsService.findOne.mockRejectedValue(new NotFoundException('Department not found'));

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(departmentsService.findOne).toHaveBeenCalledWith('999');
    });

    it('should handle UUID format ids', async () => {
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      const departmentWithUuid = { ...mockDepartment, id: uuidId };
      departmentsService.findOne.mockResolvedValue(departmentWithUuid);

      const result = await controller.findOne(uuidId);

      expect(departmentsService.findOne).toHaveBeenCalledWith(uuidId);
      expect(result).toEqual(departmentWithUuid);
    });

    it('should handle numeric string ids', async () => {
      const numericId = '123';
      const departmentWithNumericId = { ...mockDepartment, id: numericId };
      departmentsService.findOne.mockResolvedValue(departmentWithNumericId);

      const result = await controller.findOne(numericId);

      expect(departmentsService.findOne).toHaveBeenCalledWith(numericId);
      expect(result).toEqual(departmentWithNumericId);
    });
  });

  describe('update', () => {
    it('should update department successfully', async () => {
      const updatedDepartment = { ...mockDepartment, ...mockUpdateDepartmentDto };
      departmentsService.update.mockResolvedValue(updatedDepartment);

      const result = await controller.update('1', mockUpdateDepartmentDto);

      expect(departmentsService.update).toHaveBeenCalledWith('1', mockUpdateDepartmentDto);
      expect(result).toEqual(updatedDepartment);
    });

    it('should throw NotFoundException when department not found', async () => {
      departmentsService.update.mockRejectedValue(new NotFoundException('Department not found'));

      await expect(controller.update('999', mockUpdateDepartmentDto)).rejects.toThrow(NotFoundException);
      expect(departmentsService.update).toHaveBeenCalledWith('999', mockUpdateDepartmentDto);
    });

    it('should throw ConflictException when updating to existing department name', async () => {
      departmentsService.update.mockRejectedValue(new ConflictException('Department with this name already exists'));

      await expect(controller.update('1', mockUpdateDepartmentDto)).rejects.toThrow(ConflictException);
      expect(departmentsService.update).toHaveBeenCalledWith('1', mockUpdateDepartmentDto);
    });

    it('should handle partial updates', async () => {
      const partialUpdateDto = { description: 'Updated description only' };
      const partiallyUpdatedDepartment = { ...mockDepartment, description: 'Updated description only' };
      departmentsService.update.mockResolvedValue(partiallyUpdatedDepartment);

      const result = await controller.update('1', partialUpdateDto);

      expect(departmentsService.update).toHaveBeenCalledWith('1', partialUpdateDto);
      expect(result).toEqual(partiallyUpdatedDepartment);
    });

    it('should handle updating manager', async () => {
      const managerUpdateDto = { manager_id: 'new-manager-id' };
      const updatedDepartment = { ...mockDepartment, manager_id: 'new-manager-id' };
      departmentsService.update.mockResolvedValue(updatedDepartment);

      const result = await controller.update('1', managerUpdateDto);

      expect(departmentsService.update).toHaveBeenCalledWith('1', managerUpdateDto);
      expect(result).toEqual(updatedDepartment);
    });

    it('should handle updating parent department', async () => {
      const parentUpdateDto = { parent_department: 'new-parent-id' };
      const updatedDepartment = { ...mockDepartment, parent_department: 'new-parent-id' };
      departmentsService.update.mockResolvedValue(updatedDepartment);

      const result = await controller.update('1', parentUpdateDto);

      expect(departmentsService.update).toHaveBeenCalledWith('1', parentUpdateDto);
      expect(result).toEqual(updatedDepartment);
    });

    it('should handle disabling department', async () => {
      const disableUpdateDto = { disabled: true };
      const disabledDepartment = { ...mockDepartment, disabled: true };
      departmentsService.update.mockResolvedValue(disabledDepartment);

      const result = await controller.update('1', disableUpdateDto);

      expect(departmentsService.update).toHaveBeenCalledWith('1', disableUpdateDto);
      expect(result.disabled).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove department successfully', async () => {
      departmentsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(departmentsService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when department not found', async () => {
      departmentsService.remove.mockRejectedValue(new NotFoundException('Department not found'));

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(departmentsService.remove).toHaveBeenCalledWith('999');
    });

    it('should throw ConflictException when department has employees', async () => {
      departmentsService.remove.mockRejectedValue(new ConflictException('Cannot delete department with existing employees'));

      await expect(controller.remove('1')).rejects.toThrow(ConflictException);
      expect(departmentsService.remove).toHaveBeenCalledWith('1');
    });

    it('should handle UUID format ids for removal', async () => {
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      departmentsService.remove.mockResolvedValue(undefined);

      await controller.remove(uuidId);

      expect(departmentsService.remove).toHaveBeenCalledWith(uuidId);
    });

    it('should handle numeric string ids for removal', async () => {
      const numericId = '123';
      departmentsService.remove.mockResolvedValue(undefined);

      await controller.remove(numericId);

      expect(departmentsService.remove).toHaveBeenCalledWith(numericId);
    });

    it('should return void on successful removal', async () => {
      departmentsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(departmentsService.remove).toHaveBeenCalledWith('1');
    });
  });
});