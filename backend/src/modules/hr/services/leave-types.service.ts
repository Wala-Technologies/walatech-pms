import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveType } from '../entities/leave-type.entity';
import { CreateLeaveTypeDto } from '../dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from '../dto/update-leave-type.dto';

@Injectable()
export class LeaveTypesService {
  constructor(
    @InjectRepository(LeaveType)
    private leaveTypeRepository: Repository<LeaveType>,
  ) {}

  async create(createLeaveTypeDto: CreateLeaveTypeDto, tenant_id: string, userId: string): Promise<LeaveType> {
    // Check if leave type with same name already exists for this tenant
    const existingLeaveType = await this.leaveTypeRepository.findOne({
      where: { name: createLeaveTypeDto.name, tenant_id: tenant_id },
    });

    if (existingLeaveType) {
      throw new ConflictException('Leave type with this name already exists');
    }

    const leaveType = this.leaveTypeRepository.create({
      ...createLeaveTypeDto,
      tenant_id: tenant_id,
      owner: userId,
      modified_by: userId,
    });

    return this.leaveTypeRepository.save(leaveType);
  }

  async findAll(tenant_id: string): Promise<LeaveType[]> {
    return this.leaveTypeRepository.find({
      where: { tenant_id: tenant_id },
      order: { leave_type_name: 'ASC' },
    });
  }

  async findOne(id: string, tenant_id: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { id, tenant_id: tenant_id },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    return leaveType;
  }

  async findByName(name: string, tenant_id: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { name, tenant_id: tenant_id },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    return leaveType;
  }

  async update(id: string, updateLeaveTypeDto: UpdateLeaveTypeDto, tenant_id: string, userId: string): Promise<LeaveType> {
    const leaveType = await this.findOne(id, tenant_id);

    // Check if name is being updated and if it conflicts with existing leave type
    if (updateLeaveTypeDto.name && updateLeaveTypeDto.name !== leaveType.name) {
      const existingLeaveType = await this.leaveTypeRepository.findOne({
        where: { name: updateLeaveTypeDto.name, tenant_id: tenant_id },
      });

      if (existingLeaveType) {
        throw new ConflictException('Leave type with this name already exists');
      }
    }

    Object.assign(leaveType, updateLeaveTypeDto);
    leaveType.modified_by = userId;

    return this.leaveTypeRepository.save(leaveType);
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const leaveType = await this.findOne(id, tenant_id);

    // Check if leave type is being used in any leave applications
    const leaveApplicationsCount = await this.leaveTypeRepository
      .createQueryBuilder('leaveType')
      .leftJoin('leaveType.leave_applications', 'leaveApplication')
      .where('leaveType.id = :id', { id })
      .andWhere('leaveType.tenant_id = :tenant_id', { tenant_id })
      .getCount();

    if (leaveApplicationsCount > 0) {
      throw new ConflictException('Cannot delete leave type that is being used in leave applications');
    }

    await this.leaveTypeRepository.remove(leaveType);
  }

  async getLeaveTypesWithStats(tenant_id: string): Promise<any[]> {
    return this.leaveTypeRepository
      .createQueryBuilder('leaveType')
      .leftJoin('leaveType.leave_applications', 'leaveApplication')
      .select([
        'leaveType.id',
        'leaveType.name',
        'leaveType.leave_type_name',
        'leaveType.max_leaves_allowed',
        'leaveType.is_carry_forward',
        'leaveType.is_encash',
        'leaveType.is_lwp',
      ])
      .addSelect('COUNT(leaveApplication.id)', 'total_applications')
      .addSelect('COUNT(CASE WHEN leaveApplication.status = \'Approved\' THEN 1 END)', 'approved_applications')
      .where('leaveType.tenant_id = :tenant_id', { tenant_id })
      .groupBy('leaveType.id')
      .getRawMany();
  }
}