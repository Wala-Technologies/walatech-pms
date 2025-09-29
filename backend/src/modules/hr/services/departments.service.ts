import { Injectable, NotFoundException, ConflictException, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Department } from '../entities/department.entity';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

@Injectable({ scope: Scope.REQUEST })
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @Inject(REQUEST) private request: any,
  ) {}

  private get tenant_id(): string {
    return this.request.tenant_id || this.request.user?.tenant_id;
  }

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    // Check if department with same name already exists for this tenant
    const existingDepartment = await this.departmentRepository.findOne({
      where: {
        name: createDepartmentDto.name,
        tenant_id: this.tenant_id,
      },
    });

    if (existingDepartment) {
      throw new ConflictException('Department with this name already exists');
    }

    const department = this.departmentRepository.create({
      ...createDepartmentDto,
      tenant_id: this.tenant_id,
      owner: this.request.user?.email || 'system',
    });

    return this.departmentRepository.save(department);
  }

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { tenant_id: this.tenant_id },
      relations: ['employees'],
      order: { department_name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id, tenant_id: this.tenant_id },
      relations: ['employees'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async findByName(name: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { name, tenant_id: this.tenant_id },
      relations: ['employees'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    // Check if department name is being updated and is unique
    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existingDepartment = await this.departmentRepository.findOne({
        where: {
          name: updateDepartmentDto.name,
          tenant_id: this.tenant_id,
        },
      });

      if (existingDepartment && existingDepartment.id !== id) {
        throw new ConflictException('Department with this name already exists');
      }
    }

    Object.assign(department, updateDepartmentDto);
    department.modified_by = this.request.user?.email || 'system';

    return this.departmentRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);
    
    // Check if department has employees
    if (department.employees && department.employees.length > 0) {
      throw new ConflictException('Cannot delete department with existing employees');
    }

    await this.departmentRepository.remove(department);
  }

  async getActiveDepartments(): Promise<Department[]> {
    return this.departmentRepository.find({
      where: {
        disabled: false,
        tenant_id: this.tenant_id,
      },
      order: { department_name: 'ASC' },
    });
  }

  async getDepartmentHierarchy(): Promise<Department[]> {
    const departments = await this.departmentRepository.find({
      where: { tenant_id: this.tenant_id },
      order: { department_name: 'ASC' },
    });

    // Build hierarchy tree (simplified version)
    return departments.filter(dept => !dept.parent_department);
  }
}