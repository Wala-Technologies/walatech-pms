import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Designation } from '../entities/designation.entity';
import { CreateDesignationDto } from '../dto/create-designation.dto';
import { UpdateDesignationDto } from '../dto/update-designation.dto';

@Injectable()
export class DesignationsService {
  constructor(
    @InjectRepository(Designation)
    private designationRepository: Repository<Designation>,
  ) {}

  async create(createDesignationDto: CreateDesignationDto, tenantId: string, userId: string): Promise<Designation> {
    // Check if designation with same name already exists for this tenant
    const existingDesignation = await this.designationRepository.findOne({
      where: { name: createDesignationDto.name, tenant_id: tenantId },
    });

    if (existingDesignation) {
      throw new ConflictException('Designation with this name already exists');
    }

    const designation = this.designationRepository.create({
      ...createDesignationDto,
      tenant_id: tenantId,
      owner: userId,
      modified_by: userId,
    });

    return this.designationRepository.save(designation);
  }

  async findAll(tenantId: string): Promise<Designation[]> {
    return this.designationRepository.find({
      where: { tenant_id: tenantId },
      order: { designation_name: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Designation> {
    const designation = await this.designationRepository.findOne({
      where: { id, tenant_id: tenantId },
      relations: ['employees'],
    });

    if (!designation) {
      throw new NotFoundException('Designation not found');
    }

    return designation;
  }

  async findByName(name: string, tenantId: string): Promise<Designation> {
    const designation = await this.designationRepository.findOne({
      where: { name, tenant_id: tenantId },
      relations: ['employees'],
    });

    if (!designation) {
      throw new NotFoundException('Designation not found');
    }

    return designation;
  }

  async update(id: string, updateDesignationDto: UpdateDesignationDto, tenantId: string, userId: string): Promise<Designation> {
    const designation = await this.findOne(id, tenantId);

    // Check if name is being updated and if it conflicts with existing designation
    if (updateDesignationDto.name && updateDesignationDto.name !== designation.name) {
      const existingDesignation = await this.designationRepository.findOne({
        where: { name: updateDesignationDto.name, tenant_id: tenantId },
      });

      if (existingDesignation) {
        throw new ConflictException('Designation with this name already exists');
      }
    }

    Object.assign(designation, updateDesignationDto);
    designation.modified_by = userId;

    return this.designationRepository.save(designation);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const designation = await this.findOne(id, tenantId);

    // Check if designation is being used by any employees
    if (designation.employees && designation.employees.length > 0) {
      throw new ConflictException('Cannot delete designation that is assigned to employees');
    }

    await this.designationRepository.remove(designation);
  }

  async getDesignationsWithEmployeeCount(tenantId: string): Promise<any[]> {
    return this.designationRepository
      .createQueryBuilder('designation')
      .leftJoin('designation.employees', 'employee')
      .select([
        'designation.id',
        'designation.name',
        'designation.designation_name',
        'designation.description',
      ])
      .addSelect('COUNT(employee.id)', 'employee_count')
      .addSelect('COUNT(CASE WHEN employee.status = \'Active\' THEN 1 END)', 'active_employee_count')
      .where('designation.tenant_id = :tenantId', { tenantId })
      .groupBy('designation.id')
      .getRawMany();
  }

  async searchDesignations(searchTerm: string, tenantId: string): Promise<Designation[]> {
    return this.designationRepository
      .createQueryBuilder('designation')
      .where('designation.tenant_id = :tenantId', { tenantId })
      .andWhere(
        '(designation.designation_name ILIKE :searchTerm OR designation.description ILIKE :searchTerm OR designation.skill_requirements ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` }
      )
      .orderBy('designation.designation_name', 'ASC')
      .getMany();
  }
}