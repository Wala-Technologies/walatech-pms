import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { Department } from '../entities/department.entity';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let departmentRepository: jest.Mocked<Repository<Department>>;
  let mockRequest: any;

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
    const mockDepartmentRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    mockRequest = {
      tenant_id: 'tenant1',
      user: {
        id: 'user1',
        email: 'admin@test.com',
        tenant_id: 'tenant1',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        {
          provide: getRepositoryToken(Department),
          useValue: mockDepartmentRepository,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    departmentRepository = module.get(getRepositoryToken(Department));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new department successfully', async () => {
      departmentRepository.findOne.mockResolvedValue(null);
      departmentRepository.create.mockReturnValue(mockDepartment as Department);
      departmentRepository.save.mockResolvedValue(mockDepartment as Department);

      const result = await service.create(mockCreateDepartmentDto);

      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: {
          name: 'Engineering',
          tenant_id: 'tenant1',
        },
      });
      expect(departmentRepository.create).toHaveBeenCalledWith({
        ...mockCreateDepartmentDto,
        tenant_id: 'tenant1',
        owner: 'admin@test.com',
      });
      expect(departmentRepository.save).toHaveBeenCalledWith(mockDepartment);
      expect(result).toEqual(mockDepartment);
    });

    it('should throw ConflictException when department name already exists', async () => {
      departmentRepository.findOne.mockResolvedValue(mockDepartment as Department);

      await expect(service.create(mockCreateDepartmentDto)).rejects.toThrow(ConflictException);
      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: {
          name: 'Engineering',
          tenant_id: 'tenant1',
        },
      });
      expect(departmentRepository.create).not.toHaveBeenCalled();
      expect(departmentRepository.save).not.toHaveBeenCalled();
    });

    it('should handle request without user context', async () => {
      mockRequest.user = null;
      departmentRepository.findOne.mockResolvedValue(null);
      departmentRepository.create.mockReturnValue(mockDepartment as Department);
      departmentRepository.save.mockResolvedValue(mockDepartment as Department);

      const result = await service.create(mockCreateDepartmentDto);

      expect(departmentRepository.create).toHaveBeenCalledWith({
        ...mockCreateDepartmentDto,
        tenant_id: 'tenant1',
        owner: 'system',
      });
      expect(result).toEqual(mockDepartment);
    });

    it('should handle request with tenant_id from user', async () => {
      mockRequest.tenant_id = null;
      mockRequest.user.tenant_id = 'tenant2';
      departmentRepository.findOne.mockResolvedValue(null);
      departmentRepository.create.mockReturnValue(mockDepartment as Department);
      departmentRepository.save.mockResolvedValue(mockDepartment as Department);

      await service.create(mockCreateDepartmentDto);

      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: {
          name: 'Engineering',
          tenant_id: 'tenant2',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all departments for tenant', async () => {
      const mockDepartments = [mockDepartment];
      departmentRepository.find.mockResolvedValue(mockDepartments as Department[]);

      const result = await service.findAll();

      expect(departmentRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant1' },
        relations: ['employees'],
        order: { department_name: 'ASC' },
      });
      expect(result).toEqual(mockDepartments);
    });

    it('should return empty array when no departments found', async () => {
      departmentRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(departmentRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant1' },
        relations: ['employees'],
        order: { department_name: 'ASC' },
      });
      expect(result).toEqual([]);
    });

    it('should handle different tenant contexts', async () => {
      mockRequest.tenant_id = 'tenant2';
      const mockDepartments = [mockDepartment];
      departmentRepository.find.mockResolvedValue(mockDepartments as Department[]);

      await service.findAll();

      expect(departmentRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant2' },
        relations: ['employees'],
        order: { department_name: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a department by id', async () => {
      departmentRepository.findOne.mockResolvedValue(mockDepartment as Department);

      const result = await service.findOne('1');

      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', tenant_id: 'tenant1' },
        relations: ['employees'],
      });
      expect(result).toEqual(mockDepartment);
    });

    it('should throw NotFoundException when department not found', async () => {
      departmentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', tenant_id: 'tenant1' },
        relations: ['employees'],
      });
    });

    it('should handle UUID format ids', async () => {
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      departmentRepository.findOne.mockResolvedValue({ ...mockDepartment, id: uuidId } as Department);

      const result = await service.findOne(uuidId);

      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: uuidId, tenant_id: 'tenant1' },
        relations: ['employees'],
      });
      expect(result.id).toEqual(uuidId);
    });
  });

  describe('findByName', () => {
    it('should return a department by name', async () => {
      departmentRepository.findOne.mockResolvedValue(mockDepartment as Department);

      const result = await service.findByName('Engineering');

      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Engineering', tenant_id: 'tenant1' },
        relations: ['employees'],
      });
      expect(result).toEqual(mockDepartment);
    });

    it('should throw NotFoundException when department not found', async () => {
      departmentRepository.findOne.mockResolvedValue(null);

      await expect(service.findByName('Engineering')).rejects.toThrow(NotFoundException);
      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Engineering', tenant_id: 'tenant1' },
        relations: ['employees'],
      });
    });

    it('should handle names with special characters', async () => {
      const specialName = 'R&D Department';
      departmentRepository.findOne.mockResolvedValue({ ...mockDepartment, name: specialName } as Department);

      const result = await service.findByName(specialName);

      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: { name: specialName, tenant_id: 'tenant1' },
        relations: ['employees'],
      });
      expect(result.name).toEqual(specialName);
    });

    it('should be case sensitive', async () => {
      departmentRepository.findOne.mockResolvedValue(null);

      await expect(service.findByName('engineering')).rejects.toThrow(NotFoundException);
      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'engineering', tenant_id: 'tenant1' },
        relations: ['employees'],
      });
    });
  });

  describe('update', () => {
    it('should update a department successfully', async () => {
      const updatedDepartment = { ...mockDepartment, ...mockUpdateDepartmentDto, modified_by: 'admin@test.com' };
      departmentRepository.findOne
        .mockResolvedValueOnce(mockDepartment as Department) // findOne call
        .mockResolvedValueOnce(null); // Check for existing name
      departmentRepository.save.mockResolvedValue(updatedDepartment as Department);

      const result = await service.update('1', mockUpdateDepartmentDto);

      expect(departmentRepository.save).toHaveBeenCalledWith({
        ...mockDepartment,
        ...mockUpdateDepartmentDto,
        modified_by: 'admin@test.com',
      });
      expect(result).toEqual(updatedDepartment);
    });

    it('should throw NotFoundException when department not found', async () => {
      departmentRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', mockUpdateDepartmentDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when updating to existing department name', async () => {
      const existingDepartment = { ...mockDepartment, id: '2', name: 'Software Engineering' };
      departmentRepository.findOne
        .mockResolvedValueOnce(mockDepartment as Department) // findOne call
        .mockResolvedValueOnce(existingDepartment as Department); // Check for existing name

      await expect(service.update('1', mockUpdateDepartmentDto)).rejects.toThrow(ConflictException);
    });

    it('should allow updating to same name', async () => {
      const updateDto = { name: 'Engineering' }; // Same name
      const updatedDepartment = { ...mockDepartment, modified_by: 'admin@test.com' };
      departmentRepository.findOne.mockResolvedValue(mockDepartment as Department);
      departmentRepository.save.mockResolvedValue(updatedDepartment as Department);

      const result = await service.update('1', updateDto);

      expect(departmentRepository.save).toHaveBeenCalledWith({
        ...mockDepartment,
        ...updateDto,
        modified_by: 'admin@test.com',
      });
      expect(result).toEqual(updatedDepartment);
    });

    it('should handle partial updates', async () => {
      const partialUpdateDto = { description: 'Updated description only' };
      const updatedDepartment = { ...mockDepartment, ...partialUpdateDto, modified_by: 'admin@test.com' };
      departmentRepository.findOne.mockResolvedValue(mockDepartment as Department);
      departmentRepository.save.mockResolvedValue(updatedDepartment as Department);

      const result = await service.update('1', partialUpdateDto);

      expect(departmentRepository.save).toHaveBeenCalledWith({
        ...mockDepartment,
        ...partialUpdateDto,
        modified_by: 'admin@test.com',
      });
      expect(result).toEqual(updatedDepartment);
    });

    it('should handle request without user context', async () => {
      mockRequest.user = null;
      const updatedDepartment = { ...mockDepartment, ...mockUpdateDepartmentDto, modified_by: 'system' };
      departmentRepository.findOne
        .mockResolvedValueOnce(mockDepartment as Department)
        .mockResolvedValueOnce(null);
      departmentRepository.save.mockResolvedValue(updatedDepartment as Department);

      const result = await service.update('1', mockUpdateDepartmentDto);

      expect(departmentRepository.save).toHaveBeenCalledWith({
        ...mockDepartment,
        ...mockUpdateDepartmentDto,
        modified_by: 'system',
      });
      expect(result).toEqual(updatedDepartment);
    });
  });

  describe('remove', () => {
    it('should remove a department successfully', async () => {
      const departmentWithoutEmployees = { ...mockDepartment, employees: [] };
      departmentRepository.findOne.mockResolvedValue(departmentWithoutEmployees as Department);
      departmentRepository.remove.mockResolvedValue(departmentWithoutEmployees as Department);

      await service.remove('1');

      expect(departmentRepository.remove).toHaveBeenCalledWith(departmentWithoutEmployees);
    });

    it('should throw NotFoundException when department not found', async () => {
      departmentRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
      expect(departmentRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when department has employees', async () => {
      const departmentWithEmployees = {
        ...mockDepartment,
        employees: [{ id: '1', employee_name: 'John Doe' }],
      };
      departmentRepository.findOne.mockResolvedValue(departmentWithEmployees as Department);

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
      expect(departmentRepository.remove).not.toHaveBeenCalled();
    });

    it('should handle department with null employees array', async () => {
      const departmentWithNullEmployees = { ...mockDepartment, employees: null };
      departmentRepository.findOne.mockResolvedValue(departmentWithNullEmployees as Department);
      departmentRepository.remove.mockResolvedValue(departmentWithNullEmployees as Department);

      await service.remove('1');

      expect(departmentRepository.remove).toHaveBeenCalledWith(departmentWithNullEmployees);
    });

    it('should handle department with undefined employees array', async () => {
      const departmentWithUndefinedEmployees = { ...mockDepartment };
      delete departmentWithUndefinedEmployees.employees;
      departmentRepository.findOne.mockResolvedValue(departmentWithUndefinedEmployees as Department);
      departmentRepository.remove.mockResolvedValue(departmentWithUndefinedEmployees as Department);

      await service.remove('1');

      expect(departmentRepository.remove).toHaveBeenCalledWith(departmentWithUndefinedEmployees);
    });
  });

  describe('getActiveDepartments', () => {
    it('should return active departments', async () => {
      const activeDepartments = [mockDepartment];
      departmentRepository.find.mockResolvedValue(activeDepartments as Department[]);

      const result = await service.getActiveDepartments();

      expect(departmentRepository.find).toHaveBeenCalledWith({
        where: {
          disabled: false,
          tenant_id: 'tenant1',
        },
        order: { department_name: 'ASC' },
      });
      expect(result).toEqual(activeDepartments);
    });

    it('should return empty array when no active departments', async () => {
      departmentRepository.find.mockResolvedValue([]);

      const result = await service.getActiveDepartments();

      expect(departmentRepository.find).toHaveBeenCalledWith({
        where: {
          disabled: false,
          tenant_id: 'tenant1',
        },
        order: { department_name: 'ASC' },
      });
      expect(result).toEqual([]);
    });

    it('should filter out disabled departments', async () => {
      const activeDepartment = { ...mockDepartment, disabled: false };
      const disabledDepartment = { ...mockDepartment, id: '2', disabled: true };
      departmentRepository.find.mockResolvedValue([activeDepartment] as Department[]);

      const result = await service.getActiveDepartments();

      expect(result).toEqual([activeDepartment]);
      expect(result).not.toContain(disabledDepartment);
    });
  });

  describe('getDepartmentHierarchy', () => {
    it('should return department hierarchy (root departments)', async () => {
      const rootDepartment = { ...mockDepartment, parent_department: null };
      const childDepartment = { ...mockDepartment, id: '2', parent_department: 'parent1' };
      const allDepartments = [rootDepartment, childDepartment];
      departmentRepository.find.mockResolvedValue(allDepartments as Department[]);

      const result = await service.getDepartmentHierarchy();

      expect(departmentRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant1' },
        order: { department_name: 'ASC' },
      });
      expect(result).toEqual([rootDepartment]);
      expect(result).not.toContain(childDepartment);
    });

    it('should return empty array when no departments', async () => {
      departmentRepository.find.mockResolvedValue([]);

      const result = await service.getDepartmentHierarchy();

      expect(departmentRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant1' },
        order: { department_name: 'ASC' },
      });
      expect(result).toEqual([]);
    });

    it('should return all departments when all are root departments', async () => {
      const dept1 = { ...mockDepartment, id: '1', parent_department: null };
      const dept2 = { ...mockDepartment, id: '2', parent_department: null };
      const allDepartments = [dept1, dept2];
      departmentRepository.find.mockResolvedValue(allDepartments as Department[]);

      const result = await service.getDepartmentHierarchy();

      expect(result).toEqual(allDepartments);
    });

    it('should handle departments with undefined parent_department', async () => {
      const deptWithUndefinedParent = { ...mockDepartment };
      delete deptWithUndefinedParent.parent_department;
      const deptWithNullParent = { ...mockDepartment, id: '2', parent_department: null };
      const allDepartments = [deptWithUndefinedParent, deptWithNullParent];
      departmentRepository.find.mockResolvedValue(allDepartments as Department[]);

      const result = await service.getDepartmentHierarchy();

      expect(result).toEqual(allDepartments);
    });
  });
});