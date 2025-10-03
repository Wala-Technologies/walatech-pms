import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftType } from '../entities/shift-type.entity';
import { CreateShiftTypeDto } from '../dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from '../dto/update-shift-type.dto';

@Injectable()
export class ShiftTypesService {
  constructor(
    @InjectRepository(ShiftType)
    private shiftTypeRepository: Repository<ShiftType>,
  ) {}

  async create(createShiftTypeDto: CreateShiftTypeDto, tenant_id: string, userId: string): Promise<ShiftType> {
    // Check if shift type with same name already exists for this tenant
    const existingShiftType = await this.shiftTypeRepository.findOne({
      where: { name: createShiftTypeDto.name, tenant_id: tenant_id },
    });

    if (existingShiftType) {
      throw new ConflictException('Shift type with this name already exists');
    }

    const shiftType = this.shiftTypeRepository.create({
      ...createShiftTypeDto,
      tenant_id: tenant_id,
      owner: userId,
      modified_by: userId,
    });

    return this.shiftTypeRepository.save(shiftType);
  }

  async findAll(tenant_id: string): Promise<ShiftType[]> {
    return this.shiftTypeRepository.find({
      where: { tenant_id: tenant_id },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, tenant_id: string): Promise<ShiftType> {
    const shiftType = await this.shiftTypeRepository.findOne({
      where: { id, tenant_id: tenant_id },
    });

    if (!shiftType) {
      throw new NotFoundException('Shift type not found');
    }

    return shiftType;
  }

  async findByName(name: string, tenant_id: string): Promise<ShiftType> {
    const shiftType = await this.shiftTypeRepository.findOne({
      where: { name, tenant_id: tenant_id },
    });

    if (!shiftType) {
      throw new NotFoundException('Shift type not found');
    }

    return shiftType;
  }

  async update(id: string, updateShiftTypeDto: UpdateShiftTypeDto, tenant_id: string, userId: string): Promise<ShiftType> {
    const shiftType = await this.findOne(id, tenant_id);

    // Check if name is being updated and if it conflicts with existing shift type
    if (updateShiftTypeDto.name && updateShiftTypeDto.name !== shiftType.name) {
      const existingShiftType = await this.shiftTypeRepository.findOne({
        where: { name: updateShiftTypeDto.name, tenant_id: tenant_id },
      });

      if (existingShiftType) {
        throw new ConflictException('Shift type with this name already exists');
      }
    }

    Object.assign(shiftType, updateShiftTypeDto);
    shiftType.modified_by = userId;

    return this.shiftTypeRepository.save(shiftType);
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const shiftType = await this.findOne(id, tenant_id);

    // Check if shift type is being used in any attendance records
    const attendanceCount = await this.shiftTypeRepository
      .createQueryBuilder('shiftType')
      .leftJoin('shiftType.attendances', 'attendance')
      .where('shiftType.id = :id', { id })
      .andWhere('shiftType.tenant_id = :tenant_id', { tenant_id })
      .getCount();

    if (attendanceCount > 0) {
      throw new ConflictException('Cannot delete shift type that is being used in attendance records');
    }

    await this.shiftTypeRepository.remove(shiftType);
  }

  async getShiftTypesWithStats(tenant_id: string): Promise<any[]> {
    return this.shiftTypeRepository
      .createQueryBuilder('shiftType')
      .leftJoin('shiftType.attendances', 'attendance')
      .select([
        'shiftType.id',
        'shiftType.name',
        'shiftType.start_time',
        'shiftType.end_time',
        'shiftType.total_hours',
        'shiftType.enable_late_entry_marking',
        'shiftType.enable_early_exit_marking',
      ])
      .addSelect('COUNT(attendance.id)', 'total_attendance_records')
      .addSelect('COUNT(CASE WHEN attendance.status = \'Present\' THEN 1 END)', 'present_records')
      .where('shiftType.tenant_id = :tenant_id', { tenant_id })
      .groupBy('shiftType.id')
      .getRawMany();
  }

  async updateLastSyncTime(id: string, tenant_id: string): Promise<void> {
    const shiftType = await this.findOne(id, tenant_id);
    shiftType.last_sync_of_checkin = new Date();
    await this.shiftTypeRepository.save(shiftType);
  }

  async getActiveShiftTypes(tenant_id: string): Promise<ShiftType[]> {
    return this.shiftTypeRepository.find({
      where: { tenant_id: tenant_id },
      order: { start_time: 'ASC' },
    });
  }

  async getCurrentShift(tenant_id: string): Promise<ShiftType | null> {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const shiftType = await this.shiftTypeRepository
      .createQueryBuilder('shiftType')
      .where('shiftType.tenant_id = :tenant_id', { tenant_id })
      .andWhere('shiftType.start_time <= :currentTime', { currentTime })
      .andWhere('shiftType.end_time >= :currentTime', { currentTime })
      .getOne();

    return shiftType;
  }
}