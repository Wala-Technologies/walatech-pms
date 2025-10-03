import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee } from '../entities/employee.entity';
import { DepartmentAccessService } from '../../../common/services/department-access.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { QueryEmployeeDto } from '../dto/query-employee.dto';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let employeeRepository: jest.Mocked<Repository<Employee>>;
  let departmentAccessService: jest.Mocked<DepartmentAccessService>;
  let mockRequest: any;

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

  beforeEach(async () => {
    const mockEmployeeRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
    };

    const mockDepartmentAccessService = {
      getAccessibleDepartmentIds: jest.fn(),
      hasAccessToDepartment: jest.fn(),
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
        EmployeesService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepository,
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

    service = module.get<EmployeesService>(EmployeesService);
    employeeRepository = module.get(getRepositoryToken(Employee));
    departmentAccessService = module.get(DepartmentAccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new employee successfully', async () => {
      departmentAccessService.hasAccessToDepartment.mockResolvedValue(true);
      employeeRepository.findOne.mockResolvedValue(null);
      employeeRepository.create.mockReturnValue(mockEmployee as Employee);
      employeeRepository.save.mockResolvedValue(mockEmployee as Employee);

      const result = await service.create(mockCreateEmployeeDto);

      expect(departmentAccessService.hasAccessToDepartment).toHaveBeenCalledWith('dept1');
      expect(employeeRepository.findOne).toHaveBeenCalledTimes(2); // Check for existing name and number
      expect(employeeRepository.create).toHaveBeenCalledWith({
        ...mockCreateEmployeeDto,
        tenant_id: 'tenant1',
        owner: 'admin@test.com',
      });
      expect(employeeRepository.save).toHaveBeenCalledWith(mockEmployee);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException when department is not accessible', async () => {
      departmentAccessService.hasAccessToDepartment.mockResolvedValue(false);

      await expect(service.create(mockCreateEmployeeDto)).rejects.toThrow(NotFoundException);
      expect(departmentAccessService.hasAccessToDepartment).toHaveBeenCalledWith('dept1');
    });

    it('should throw ConflictException when employee name already exists', async () => {
      departmentAccessService.hasAccessToDepartment.mockResolvedValue(true);
      employeeRepository.findOne.mockResolvedValueOnce(mockEmployee as Employee);

      await expect(service.create(mockCreateEmployeeDto)).rejects.toThrow(ConflictException);
      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: {
          employee_name: 'John Doe',
          tenant_id: 'tenant1',
        },
      });
    });

    it('should throw ConflictException when employee number already exists', async () => {
      departmentAccessService.hasAccessToDepartment.mockResolvedValue(true);
      employeeRepository.findOne
        .mockResolvedValueOnce(null) // Name check
        .mockResolvedValueOnce(mockEmployee as Employee); // Number check

      await expect(service.create(mockCreateEmployeeDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when personal email already exists', async () => {
      departmentAccessService.hasAccessToDepartment.mockResolvedValue(true);
      employeeRepository.findOne
        .mockResolvedValueOnce(null) // Name check
        .mockResolvedValueOnce(null) // Number check
        .mockResolvedValueOnce(mockEmployee as Employee); // Email check

      await expect(service.create(mockCreateEmployeeDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    beforeEach(() => {
      employeeRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      departmentAccessService.getAccessibleDepartmentIds.mockResolvedValue(['dept1', 'dept2']);
    });

    it('should return paginated employees with filters', async () => {
      const mockEmployees = [mockEmployee];
      const mockCount = 1;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockEmployees, mockCount]);

      const result = await service.findAll(mockQueryEmployeeDto);

      expect(departmentAccessService.getAccessibleDepartmentIds).toHaveBeenCalled();
      expect(employeeRepository.createQueryBuilder).toHaveBeenCalledWith('employee');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('employee.tenant_id = :tenant_id', { tenant_id: 'tenant1' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('employee.department_id IN (:...departmentIds)', { departmentIds: ['dept1', 'dept2'] });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: mockEmployees,
        total: mockCount,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply search filter when provided', async () => {
      const mockEmployees = [mockEmployee];
      const mockCount = 1;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockEmployees, mockCount]);

      await service.findAll(mockQueryEmployeeDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(employee.employee_name ILIKE :search OR employee.personal_email ILIKE :search OR employee.employee_number ILIKE :search)',
        { search: '%John%' }
      );
    });

    it('should apply status filter when provided', async () => {
      const mockEmployees = [mockEmployee];
      const mockCount = 1;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockEmployees, mockCount]);

      await service.findAll(mockQueryEmployeeDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('employee.status = :status', { status: 'active' });
    });

    it('should apply department filter when provided', async () => {
      const mockEmployees = [mockEmployee];
      const mockCount = 1;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockEmployees, mockCount]);

      await service.findAll(mockQueryEmployeeDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('employee.department_id = :department_id', { department_id: 'dept1' });
    });

    it('should apply sorting when provided', async () => {
      const mockEmployees = [mockEmployee];
      const mockCount = 1;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockEmployees, mockCount]);

      await service.findAll(mockQueryEmployeeDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('employee.employee_name', 'ASC');
    });
  });

  describe('findOne', () => {
    it('should return an employee by id', async () => {
      departmentAccessService.hasAccessToDepartment.mockResolvedValue(true);
      employeeRepository.findOne.mockResolvedValue(mockEmployee as Employee);

      const result = await service.findOne('1');

      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', tenant_id: 'tenant1' },
        relations: ['department', 'designation', 'company'],
      });
      expect(departmentAccessService.hasAccessToDepartment).toHaveBeenCalledWith('dept1');
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException when employee not found', async () => {
      employeeRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when department is not accessible', async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee as Employee);
      departmentAccessService.hasAccessToDepartment.mockResolvedValue(false);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByName', () => {
    it('should return an employee by name', async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee as Employee);

      const result = await service.findByName('John Doe');

      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: { employee_name: 'John Doe', tenant_id: 'tenant1' },
        relations: ['department', 'designation', 'company'],
      });
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException when employee not found', async () => {
      employeeRepository.findOne.mockResolvedValue(null);

      await expect(service.findByName('John Doe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an employee successfully', async () => {
      const updatedEmployee = { ...mockEmployee, ...mockUpdateEmployeeDto };
      departmentAccessService.hasAccessToDepartment.mockResolvedValue(true);
      employeeRepository.findOne
        .mockResolvedValueOnce(mockEmployee as Employee) // findOne call
        .mockResolvedValueOnce(null); // Check for existing employee number
      employeeRepository.save.mockResolvedValue(updatedEmployee as Employee);

      const result = await service.update('1', mockUpdateEmployeeDto);

      expect(employeeRepository.save).toHaveBeenCalledWith({
        ...mockEmployee,
        ...mockUpdateEmployeeDto,
        modified_by: 'admin@test.com',
      });
      expect(result).toEqual(updatedEmployee);
    });

    it('should throw ConflictException when updating to existing employee number', async () => {
      const updateDto = { employee_number: 'EMP002' };
      const existingEmployee = { ...mockEmployee, id: '2', employee_number: 'EMP002' };
      
      departmentAccessService.hasAccessToDepartment.mockResolvedValue(true);
      employeeRepository.findOne
        .mockResolvedValueOnce(mockEmployee as Employee) // findOne call
        .mockResolvedValueOnce(existingEmployee as Employee); // Check for existing employee number

      await expect(service.update('1', updateDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when updating to existing personal email', async () => {
      const updateDto = { personal_email: 'existing@example.com' };
      const existingEmployee = { ...mockEmployee, id: '2', personal_email: 'existing@example.com' };
      
      departmentAccessService.hasAccessToDepartment.mockResolvedValue(true);
      employeeRepository.findOne
        .mockResolvedValueOnce(mockEmployee as Employee) // findOne call
        .mockResolvedValueOnce(null) // Check for existing employee number
        .mockResolvedValueOnce(existingEmployee as Employee); // Check for existing personal email

      await expect(service.update('1', updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove an employee successfully', async () => {
      departmentAccessService.hasAccessToDepartment.mockResolvedValue(true);
      employeeRepository.findOne.mockResolvedValue(mockEmployee as Employee);
      employeeRepository.remove.mockResolvedValue(mockEmployee as Employee);

      await service.remove('1');

      expect(employeeRepository.remove).toHaveBeenCalledWith(mockEmployee);
    });

    it('should throw NotFoundException when employee not found', async () => {
      employeeRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEmployeesByDepartment', () => {
    it('should return employees by department', async () => {
      const mockEmployees = [mockEmployee];
      departmentAccessService.hasAccessToDepartment.mockResolvedValue(true);
      employeeRepository.find.mockResolvedValue(mockEmployees as Employee[]);

      const result = await service.getEmployeesByDepartment('dept1');

      expect(departmentAccessService.hasAccessToDepartment).toHaveBeenCalledWith('dept1');
      expect(employeeRepository.find).toHaveBeenCalledWith({
        where: {
          department_id: 'dept1',
          tenant_id: 'tenant1',
        },
        relations: ['department', 'designation', 'company'],
        order: { employee_name: 'ASC' },
      });
      expect(result).toEqual(mockEmployees);
    });

    it('should throw NotFoundException when department is not accessible', async () => {
      departmentAccessService.hasAccessToDepartment.mockResolvedValue(false);

      await expect(service.getEmployeesByDepartment('dept1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getActiveEmployees', () => {
    it('should return active employees', async () => {
      const mockEmployees = [mockEmployee];
      departmentAccessService.getAccessibleDepartmentIds.mockResolvedValue(['dept1', 'dept2']);
      employeeRepository.find.mockResolvedValue(mockEmployees as Employee[]);

      const result = await service.getActiveEmployees();

      expect(departmentAccessService.getAccessibleDepartmentIds).toHaveBeenCalled();
      expect(employeeRepository.find).toHaveBeenCalledWith({
        where: {
          status: 'active',
          tenant_id: 'tenant1',
          department_id: expect.any(Object), // IN clause
        },
        relations: ['department', 'designation', 'company'],
        order: { employee_name: 'ASC' },
      });
      expect(result).toEqual(mockEmployees);
    });

    it('should return empty array when no accessible departments', async () => {
      departmentAccessService.getAccessibleDepartmentIds.mockResolvedValue([]);

      const result = await service.getActiveEmployees();

      expect(result).toEqual([]);
      expect(employeeRepository.find).not.toHaveBeenCalled();
    });
  });
});