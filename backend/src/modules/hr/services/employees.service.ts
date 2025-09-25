import { Injectable, NotFoundException, ConflictException, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Employee, EmployeeStatus } from '../entities/employee.entity';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { EmployeeQueryDto } from '../dto/employee-query.dto';

@Injectable({ scope: Scope.REQUEST })
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @Inject(REQUEST) private request: any,
  ) {}

  private get tenantId(): string {
    return this.request.tenant_id || this.request.user?.tenant_id;
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Check if employee with same name already exists for this tenant
    const existingEmployee = await this.employeeRepository.findOne({
      where: {
        name: createEmployeeDto.name,
        tenant_id: this.tenantId,
      },
    });

    if (existingEmployee) {
      throw new ConflictException('Employee with this ID already exists');
    }

    // Check if employee number is provided and unique
    if (createEmployeeDto.employee_number) {
      const existingNumber = await this.employeeRepository.findOne({
        where: {
          employee_number: createEmployeeDto.employee_number,
          tenant_id: this.tenantId,
        },
      });

      if (existingNumber) {
        throw new ConflictException('Employee with this number already exists');
      }
    }

    // Check if personal email is provided and unique
    if (createEmployeeDto.personal_email) {
      const existingEmail = await this.employeeRepository.findOne({
        where: {
          personal_email: createEmployeeDto.personal_email,
          tenant_id: this.tenantId,
        },
      });

      if (existingEmail) {
        throw new ConflictException('Employee with this personal email already exists');
      }
    }

    const employee = this.employeeRepository.create({
      ...createEmployeeDto,
      date_of_birth: createEmployeeDto.date_of_birth ? new Date(createEmployeeDto.date_of_birth) : undefined,
      date_of_joining: createEmployeeDto.date_of_joining ? new Date(createEmployeeDto.date_of_joining) : undefined,
      tenant_id: this.tenantId,
      owner: this.request.user?.email || 'system',
    });

    return this.employeeRepository.save(employee);
  }

  async findAll(query: EmployeeQueryDto): Promise<{ employees: Employee[]; total: number }> {
    const { page = 1, limit = 20, search, status, department_id, designation_id, company } = query;
    const skip = (page - 1) * limit;

    const queryBuilder: SelectQueryBuilder<Employee> = this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.designation', 'designation')
      .leftJoinAndSelect('employee.user', 'user')
      .where('employee.tenant_id = :tenantId', { tenantId: this.tenantId });

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(employee.employee_name LIKE :search OR employee.name LIKE :search OR employee.employee_number LIKE :search OR employee.personal_email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
    if (status) {
      queryBuilder.andWhere('employee.status = :status', { status });
    }

    if (department_id) {
      queryBuilder.andWhere('employee.department_id = :department_id', { department_id });
    }

    if (designation_id) {
      queryBuilder.andWhere('employee.designation_id = :designation_id', { designation_id });
    }

    if (company) {
      queryBuilder.andWhere('employee.company = :company', { company });
    }

    // Apply sorting
    queryBuilder.orderBy('employee.employee_name', 'ASC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const employees = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    return { employees, total };
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id, tenant_id: this.tenantId },
      relations: ['department', 'designation', 'user'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async findByName(name: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { name, tenant_id: this.tenantId },
      relations: ['department', 'designation', 'user'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    // Check if employee number is being updated and is unique
    if (updateEmployeeDto.employee_number && updateEmployeeDto.employee_number !== employee.employee_number) {
      const existingNumber = await this.employeeRepository.findOne({
        where: {
          employee_number: updateEmployeeDto.employee_number,
          tenant_id: this.tenantId,
        },
      });

      if (existingNumber && existingNumber.id !== id) {
        throw new ConflictException('Employee with this number already exists');
      }
    }

    // Check if personal email is being updated and is unique
    if (updateEmployeeDto.personal_email && updateEmployeeDto.personal_email !== employee.personal_email) {
      const existingEmail = await this.employeeRepository.findOne({
        where: {
          personal_email: updateEmployeeDto.personal_email,
          tenant_id: this.tenantId,
        },
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('Employee with this personal email already exists');
      }
    }

    Object.assign(employee, updateEmployeeDto);
    employee.modified_by = this.request.user?.email || 'system';

    return this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeeRepository.remove(employee);
  }

  async getEmployeesByDepartment(departmentId: string): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: {
        department_id: departmentId,
        tenant_id: this.tenantId,
      },
      relations: ['designation', 'user'],
    });
  }

  async getActiveEmployees(): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: {
        status: EmployeeStatus.ACTIVE,
        tenant_id: this.tenantId,
      },
      relations: ['department', 'designation'],
    });
  }
}