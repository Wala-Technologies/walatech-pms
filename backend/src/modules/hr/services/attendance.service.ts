import { Injectable, NotFoundException, ConflictException, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Attendance, AttendanceStatus } from '../entities/attendance.entity';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';
import { DepartmentAccessService } from '../../../common/services/department-access.service';

@Injectable({ scope: Scope.REQUEST })
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @Inject(REQUEST) private request: any,
    private departmentAccessService: DepartmentAccessService,
  ) {}

  private get tenant_id(): string {
    return this.request.tenant_id || this.request.user?.tenant_id;
  }

  private get user(): any {
    return this.request.user;
  }

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    // Check if attendance already exists for this employee and date
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        employee_id: createAttendanceDto.employee_id,
        attendance_date: new Date(createAttendanceDto.attendance_date),
        tenant_id: this.tenant_id,
      },
    });

    if (existingAttendance) {
      throw new ConflictException('Attendance already exists for this employee and date');
    }

    const attendance = this.attendanceRepository.create({
      ...createAttendanceDto,
      attendance_date: new Date(createAttendanceDto.attendance_date),
      late_entry: createAttendanceDto.late_entry ? 1 : 0, // Convert boolean to number
      early_exit: createAttendanceDto.early_exit ? 1 : 0, // Convert boolean to number
      tenant_id: this.tenant_id,
      owner: this.request.user?.email || 'system',
    });

    return this.attendanceRepository.save(attendance);
  }

  async findAll(): Promise<Attendance[]> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoinAndSelect('attendance.shift_type', 'shift_type')
      .where('attendance.tenant_id = :tenant_id', { tenant_id: this.tenant_id });

    // Apply department-based access control
    const user = this.user;
    if (user && !this.departmentAccessService.canAccessAllDepartments(user)) {
      const accessibleDepartmentIds = this.departmentAccessService.getAccessibleDepartmentIds(user);
      if (accessibleDepartmentIds && accessibleDepartmentIds.length > 0) {
        queryBuilder.andWhere('employee.department_id IN (:...departmentIds)', {
          departmentIds: accessibleDepartmentIds,
        });
      } else {
        // User has no department access, return empty result
        queryBuilder.andWhere('1 = 0');
      }
    }

    return queryBuilder
      .orderBy('attendance.attendance_date', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id, tenant_id: this.tenant_id },
      relations: ['employee', 'shift_type', 'leave_application'],
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return attendance;
  }

  async findByEmployee(employeeId: string, startDate?: string, endDate?: string): Promise<Attendance[]> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoinAndSelect('attendance.shift_type', 'shift_type')
      .where('attendance.employee_id = :employeeId', { employeeId })
      .andWhere('attendance.tenant_id = :tenant_id', { tenant_id: this.tenant_id });

    if (startDate && endDate) {
      queryBuilder.andWhere('attendance.attendance_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return queryBuilder
      .orderBy('attendance.attendance_date', 'DESC')
      .getMany();
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: {
        attendance_date: Between(new Date(startDate), new Date(endDate)),
        tenant_id: this.tenant_id,
      },
      relations: ['employee', 'shift_type'],
      order: { attendance_date: 'DESC' },
    });
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);

    Object.assign(attendance, updateAttendanceDto);
    attendance.modified_by = this.request.user?.email || 'system';

    return this.attendanceRepository.save(attendance);
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }

  async checkIn(employeeId: string, checkInTime?: string): Promise<Attendance> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    const currentTime = checkInTime || new Date().toTimeString().split(' ')[0];

    // Check if already checked in today
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        employee_id: employeeId,
        attendance_date: today,
        tenant_id: this.tenant_id,
      },
    });

    if (existingAttendance) {
      throw new ConflictException('Employee already checked in today');
    }

    const attendance = this.attendanceRepository.create({
      employee_id: employeeId,
      attendance_date: today,
      status: AttendanceStatus.PRESENT,
      in_time: currentTime,
      company: 'Default Company', // This should come from employee or system settings
      tenant_id: this.tenant_id,
      owner: this.request.user?.email || 'system',
    });

    return this.attendanceRepository.save(attendance);
  }

  async checkOut(employeeId: string, checkOutTime?: string): Promise<Attendance> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    const currentTime = checkOutTime || new Date().toTimeString().split(' ')[0];

    const attendance = await this.attendanceRepository.findOne({
      where: {
        employee_id: employeeId,
        attendance_date: today,
        tenant_id: this.tenant_id,
      },
    });

    if (!attendance) {
      throw new NotFoundException('No check-in record found for today');
    }

    if (attendance.out_time) {
      throw new ConflictException('Employee already checked out today');
    }

    attendance.out_time = currentTime;
    
    // Calculate working hours if both in_time and out_time are available
    if (attendance.in_time) {
      const inTime = new Date(`1970-01-01T${attendance.in_time}`);
      const outTime = new Date(`1970-01-01T${currentTime}`);
      const diffMs = outTime.getTime() - inTime.getTime();
      attendance.working_hours = diffMs / (1000 * 60 * 60); // Convert to hours
    }

    attendance.modified_by = this.request.user?.email || 'system';

    return this.attendanceRepository.save(attendance);
  }

  async getAttendanceStats(employeeId?: string, month?: string): Promise<any> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.tenant_id = :tenant_id', { tenant_id: this.tenant_id });

    if (employeeId) {
      queryBuilder.andWhere('attendance.employee_id = :employeeId', { employeeId });
    }

    if (month) {
      queryBuilder.andWhere('attendance.attendance_date LIKE :month', { month: `${month}%` });
    }

    const attendances = await queryBuilder.getMany();

    const stats = {
      total: attendances.length,
      present: attendances.filter(a => a.status === 'Present').length,
      absent: attendances.filter(a => a.status === 'Absent').length,
      halfDay: attendances.filter(a => a.status === 'Half Day').length,
      onLeave: attendances.filter(a => a.status === 'On Leave').length,
      totalWorkingHours: attendances.reduce((sum, a) => sum + (a.working_hours || 0), 0),
      lateEntries: attendances.filter(a => a.late_entry).length,
      earlyExits: attendances.filter(a => a.early_exit).length,
    };

    return stats;
  }
}