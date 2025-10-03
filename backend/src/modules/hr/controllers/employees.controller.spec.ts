import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from '../services/employees.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { QueryEmployeeDto } from '../dto/query-employee.dto';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let employeesService: jest.Mocked<EmployeesService>;

  const mockEmployee = {
    id: '1',
    employee_name: 'John Doe',
    employee_number: 'EMP001',
    personal_email: 'john@example.com',
    company_email: 'john@company.com',
    phone: '1234567890',
    address: '123 Main St',
    date_of_birth: new Date('1990-01-01'),
    hire_date: new Date('2023-01-01'),
    status: 'active',
    department_id: 'dept1',
    designation_id: 'des1',
    company_id: 'comp1',
    tenant_id: 'tenant1',
    owner: 'admin@test.com',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateEmployeeDto: CreateEmployeeDto = {
    employee_name: 'John Doe',
    employee_number: 'EMP001',
    personal_email: 'john@example.com',
    company_email: 'john@company.com',
    phone: '1234567890',
    address: '123 Main St',
    date_of_birth: new Date('1990-01-01'),
    hire_date: new Date('2023-01-01'),
    status: 'active',
    department_id: 'dept1',
    designation_id: 'des1',
    company_id: 'comp1',
  };

  const mockUpdateEmployeeDto: UpdateEmployeeDto = {
    employee_name: 'John Smith',
    phone: '0987654321',
  };

  const mockQueryEmployeeDto: QueryEmployeeDto = {
    page: 1,
    limit: 10,
    search: 'John',
    status: 'active',
    department_id: 'dept1',
    designation_id: 'des1',
    company_id: 'comp1',
    sort_by: 'employee_name',
    sort_order: 'ASC',
  };

  const mockPaginatedResult = {
    data: [mockEmployee],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    const mockEmployeesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByName: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getEmployeesByDepartment: jest.fn(),
      getActiveEmployees: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    employeesService = module.get(EmployeesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new employee successfully', async () => {
      employeesService.create.mockResolvedValue(mockEmployee);

      const result = await controller.create(mockCreateEmployeeDto);

      expect(employeesService.create).toHaveBeenCalledWith(mockCreateEmployeeDto);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw ConflictException when employee name already exists', async () => {
      employeesService.create.mockRejectedValue(new ConflictException('Employee with this name already exists'));

      await expect(controller.create(mockCreateEmployeeDto)).rejects.toThrow(ConflictException);
      expect(employeesService.create).toHaveBeenCalledWith(mockCreateEmployeeDto);
    });

    it('should throw ConflictException when employee number already exists', async () => {
      employeesService.create.mockRejectedValue(new ConflictException('Employee with this number already exists'));

      await expect(controller.create(mockCreateEmployeeDto)).rejects.toThrow(ConflictException);
      expect(employeesService.create).toHaveBeenCalledWith(mockCreateEmployeeDto);
    });

    it('should throw ConflictException when personal email already exists', async () => {
      employeesService.create.mockRejectedValue(new ConflictException('Employee with this personal email already exists'));

      await expect(controller.create(mockCreateEmployeeDto)).rejects.toThrow(ConflictException);
      expect(employeesService.create).toHaveBeenCalledWith(mockCreateEmployeeDto);
    });

    it('should throw NotFoundException when department is not accessible', async () => {
      employeesService.create.mockRejectedValue(new NotFoundException('Department not found or not accessible'));

      await expect(controller.create(mockCreateEmployeeDto)).rejects.toThrow(NotFoundException);
      expect(employeesService.create).toHaveBeenCalledWith(mockCreateEmployeeDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated employees with filters', async () => {
      employeesService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(mockQueryEmployeeDto);

      expect(employeesService.findAll).toHaveBeenCalledWith(mockQueryEmployeeDto);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return paginated employees without filters', async () => {
      const queryDto = { page: 1, limit: 10 };
      employeesService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(queryDto);

      expect(employeesService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle search parameter', async () => {
      const queryDto = { page: 1, limit: 10, search: 'John' };
      employeesService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(queryDto);

      expect(employeesService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle status filter', async () => {
      const queryDto = { page: 1, limit: 10, status: 'active' };
      employeesService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(queryDto);

      expect(employeesService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle department filter', async () => {
      const queryDto = { page: 1, limit: 10, department_id: 'dept1' };
      employeesService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(queryDto);

      expect(employeesService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle sorting parameters', async () => {
      const queryDto = { page: 1, limit: 10, sort_by: 'employee_name', sort_order: 'DESC' };
      employeesService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(queryDto);

      expect(employeesService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('getActiveEmployees', () => {
    it('should return active employees', async () => {
      const mockActiveEmployees = [mockEmployee];
      employeesService.getActiveEmployees.mockResolvedValue(mockActiveEmployees);

      const result = await controller.getActiveEmployees();

      expect(employeesService.getActiveEmployees).toHaveBeenCalled();
      expect(result).toEqual(mockActiveEmployees);
    });

    it('should return empty array when no active employees', async () => {
      employeesService.getActiveEmployees.mockResolvedValue([]);

      const result = await controller.getActiveEmployees();

      expect(employeesService.getActiveEmployees).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getEmployeesByDepartment', () => {
    it('should return employees by department', async () => {
      const mockDepartmentEmployees = [mockEmployee];
      employeesService.getEmployeesByDepartment.mockResolvedValue(mockDepartmentEmployees);

      const result = await controller.getEmployeesByDepartment('dept1');

      expect(employeesService.getEmployeesByDepartment).toHaveBeenCalledWith('dept1');
      expect(result).toEqual(mockDepartmentEmployees);
    });

    it('should throw NotFoundException when department is not accessible', async () => {
      employeesService.getEmployeesByDepartment.mockRejectedValue(new NotFoundException('Department not found or not accessible'));

      await expect(controller.getEmployeesByDepartment('dept1')).rejects.toThrow(NotFoundException);
      expect(employeesService.getEmployeesByDepartment).toHaveBeenCalledWith('dept1');
    });

    it('should return empty array when department has no employees', async () => {
      employeesService.getEmployeesByDepartment.mockResolvedValue([]);

      const result = await controller.getEmployeesByDepartment('dept1');

      expect(employeesService.getEmployeesByDepartment).toHaveBeenCalledWith('dept1');
      expect(result).toEqual([]);
    });
  });

  describe('findByName', () => {
    it('should return employee by name', async () => {
      employeesService.findByName.mockResolvedValue(mockEmployee);

      const result = await controller.findByName('John Doe');

      expect(employeesService.findByName).toHaveBeenCalledWith('John Doe');
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException when employee not found', async () => {
      employeesService.findByName.mockRejectedValue(new NotFoundException('Employee not found'));

      await expect(controller.findByName('John Doe')).rejects.toThrow(NotFoundException);
      expect(employeesService.findByName).toHaveBeenCalledWith('John Doe');
    });

    it('should handle names with special characters', async () => {
      const specialName = "O'Connor";
      employeesService.findByName.mockResolvedValue({ ...mockEmployee, employee_name: specialName });

      const result = await controller.findByName(specialName);

      expect(employeesService.findByName).toHaveBeenCalledWith(specialName);
      expect(result.employee_name).toEqual(specialName);
    });
  });

  describe('findOne', () => {
    it('should return employee by id', async () => {
      employeesService.findOne.mockResolvedValue(mockEmployee);

      const result = await controller.findOne('1');

      expect(employeesService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException when employee not found', async () => {
      employeesService.findOne.mockRejectedValue(new NotFoundException('Employee not found'));

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
      expect(employeesService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when department is not accessible', async () => {
      employeesService.findOne.mockRejectedValue(new NotFoundException('Department not found or not accessible'));

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
      expect(employeesService.findOne).toHaveBeenCalledWith('1');
    });

    it('should handle UUID format ids', async () => {
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      employeesService.findOne.mockResolvedValue({ ...mockEmployee, id: uuidId });

      const result = await controller.findOne(uuidId);

      expect(employeesService.findOne).toHaveBeenCalledWith(uuidId);
      expect(result.id).toEqual(uuidId);
    });
  });

  describe('update', () => {
    it('should update employee successfully', async () => {
      const updatedEmployee = { ...mockEmployee, ...mockUpdateEmployeeDto };
      employeesService.update.mockResolvedValue(updatedEmployee);

      const result = await controller.update('1', mockUpdateEmployeeDto);

      expect(employeesService.update).toHaveBeenCalledWith('1', mockUpdateEmployeeDto);
      expect(result).toEqual(updatedEmployee);
    });

    it('should throw NotFoundException when employee not found', async () => {
      employeesService.update.mockRejectedValue(new NotFoundException('Employee not found'));

      await expect(controller.update('1', mockUpdateEmployeeDto)).rejects.toThrow(NotFoundException);
      expect(employeesService.update).toHaveBeenCalledWith('1', mockUpdateEmployeeDto);
    });

    it('should throw ConflictException when updating to existing employee number', async () => {
      const updateDto = { employee_number: 'EMP002' };
      employeesService.update.mockRejectedValue(new ConflictException('Employee with this number already exists'));

      await expect(controller.update('1', updateDto)).rejects.toThrow(ConflictException);
      expect(employeesService.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw ConflictException when updating to existing personal email', async () => {
      const updateDto = { personal_email: 'existing@example.com' };
      employeesService.update.mockRejectedValue(new ConflictException('Employee with this personal email already exists'));

      await expect(controller.update('1', updateDto)).rejects.toThrow(ConflictException);
      expect(employeesService.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should handle partial updates', async () => {
      const partialUpdateDto = { phone: '0987654321' };
      const updatedEmployee = { ...mockEmployee, phone: '0987654321' };
      employeesService.update.mockResolvedValue(updatedEmployee);

      const result = await controller.update('1', partialUpdateDto);

      expect(employeesService.update).toHaveBeenCalledWith('1', partialUpdateDto);
      expect(result).toEqual(updatedEmployee);
    });

    it('should handle status updates', async () => {
      const statusUpdateDto = { status: 'inactive' };
      const updatedEmployee = { ...mockEmployee, status: 'inactive' };
      employeesService.update.mockResolvedValue(updatedEmployee);

      const result = await controller.update('1', statusUpdateDto);

      expect(employeesService.update).toHaveBeenCalledWith('1', statusUpdateDto);
      expect(result.status).toEqual('inactive');
    });
  });

  describe('remove', () => {
    it('should remove employee successfully', async () => {
      employeesService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(employeesService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when employee not found', async () => {
      employeesService.remove.mockRejectedValue(new NotFoundException('Employee not found'));

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
      expect(employeesService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when department is not accessible', async () => {
      employeesService.remove.mockRejectedValue(new NotFoundException('Department not found or not accessible'));

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
      expect(employeesService.remove).toHaveBeenCalledWith('1');
    });

    it('should handle UUID format ids for removal', async () => {
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      employeesService.remove.mockResolvedValue(undefined);

      await controller.remove(uuidId);

      expect(employeesService.remove).toHaveBeenCalledWith(uuidId);
    });
  });
});