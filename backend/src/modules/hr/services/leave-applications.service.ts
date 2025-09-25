import { Injectable, NotFoundException, ConflictException, Scope, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { LeaveApplication, LeaveApplicationStatus } from '../entities/leave-application.entity';
import { CreateLeaveApplicationDto } from '../dto/create-leave-application.dto';
import { UpdateLeaveApplicationDto } from '../dto/update-leave-application.dto';

@Injectable({ scope: Scope.REQUEST })
export class LeaveApplicationsService {
  constructor(
    @InjectRepository(LeaveApplication)
    private leaveApplicationRepository: Repository<LeaveApplication>,
    @Inject(REQUEST) private request: any,
  ) {}

  private get tenantId(): string {
    return this.request.tenant_id || this.request.user?.tenant_id;
  }

  async create(createLeaveApplicationDto: CreateLeaveApplicationDto): Promise<LeaveApplication> {
    // Validate date range
    const fromDate = new Date(createLeaveApplicationDto.from_date);
    const toDate = new Date(createLeaveApplicationDto.to_date);

    if (fromDate > toDate) {
      throw new BadRequestException('From date cannot be after to date');
    }

    // Check for overlapping leave applications
    const overlappingLeave = await this.leaveApplicationRepository
      .createQueryBuilder('leave')
      .where('leave.employee_id = :employeeId', { employeeId: createLeaveApplicationDto.employee_id })
      .andWhere('leave.tenant_id = :tenantId', { tenantId: this.tenantId })
      .andWhere('leave.status IN (:...statuses)', { 
        statuses: [LeaveApplicationStatus.OPEN, LeaveApplicationStatus.APPROVED] 
      })
      .andWhere(
        '(leave.from_date <= :toDate AND leave.to_date >= :fromDate)',
        { 
          fromDate: createLeaveApplicationDto.from_date,
          toDate: createLeaveApplicationDto.to_date 
        }
      )
      .getOne();

    if (overlappingLeave) {
      throw new ConflictException('Leave application overlaps with existing leave');
    }

    const leaveApplication = this.leaveApplicationRepository.create({
      employee_id: createLeaveApplicationDto.employee_id,
      employee_name: createLeaveApplicationDto.employee_name,
      leave_type_id: createLeaveApplicationDto.leave_type_id,
      from_date: new Date(createLeaveApplicationDto.from_date),
      to_date: new Date(createLeaveApplicationDto.to_date),
      total_leave_days: createLeaveApplicationDto.total_leave_days,
      description: createLeaveApplicationDto.description,
      leave_approver: createLeaveApplicationDto.leave_approver,
      status: createLeaveApplicationDto.status,
      company: createLeaveApplicationDto.company,
      department: createLeaveApplicationDto.department,
      posting_date: createLeaveApplicationDto.posting_date ? new Date(createLeaveApplicationDto.posting_date) : new Date(),
      follow_via_email: createLeaveApplicationDto.follow_via_email ? 'Yes' : 'No',
      color: createLeaveApplicationDto.color,
      tenant_id: this.tenantId,
      owner: this.request.user?.email || 'system',
    });

    return this.leaveApplicationRepository.save(leaveApplication);
  }

  async findAll(): Promise<LeaveApplication[]> {
    return this.leaveApplicationRepository.find({
      where: { tenant_id: this.tenantId },
      relations: ['employee', 'leave_type'],
      order: { creation: 'DESC' },
    });
  }

  async findOne(id: string): Promise<LeaveApplication> {
    const leaveApplication = await this.leaveApplicationRepository.findOne({
      where: { id, tenant_id: this.tenantId },
      relations: ['employee', 'leave_type'],
    });

    if (!leaveApplication) {
      throw new NotFoundException('Leave application not found');
    }

    return leaveApplication;
  }

  async findByEmployee(employeeId: string, year?: string): Promise<LeaveApplication[]> {
    const queryBuilder = this.leaveApplicationRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee')
      .leftJoinAndSelect('leave.leave_type', 'leave_type')
      .where('leave.employee_id = :employeeId', { employeeId })
      .andWhere('leave.tenant_id = :tenantId', { tenantId: this.tenantId });

    if (year) {
      queryBuilder.andWhere('leave.from_date LIKE :year', { year: `${year}%` });
    }

    return queryBuilder
      .orderBy('leave.from_date', 'DESC')
      .getMany();
  }

  async findByStatus(status: LeaveApplicationStatus): Promise<LeaveApplication[]> {
    return this.leaveApplicationRepository.find({
      where: { 
        status,
        tenant_id: this.tenantId 
      },
      relations: ['employee', 'leave_type'],
      order: { creation: 'DESC' },
    });
  }

  async findPendingApprovals(approverId?: string): Promise<LeaveApplication[]> {
    const queryBuilder = this.leaveApplicationRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee')
      .leftJoinAndSelect('leave.leave_type', 'leave_type')
      .where('leave.status = :status', { status: LeaveApplicationStatus.OPEN })
      .andWhere('leave.tenant_id = :tenantId', { tenantId: this.tenantId });

    if (approverId) {
      queryBuilder.andWhere('leave.leave_approver = :approverId', { approverId });
    }

    return queryBuilder
      .orderBy('leave.creation', 'ASC')
      .getMany();
  }

  async update(id: string, updateLeaveApplicationDto: UpdateLeaveApplicationDto): Promise<LeaveApplication> {
    const leaveApplication = await this.findOne(id);

    // Prevent updating approved/rejected applications
    if (leaveApplication.status === LeaveApplicationStatus.APPROVED || 
        leaveApplication.status === LeaveApplicationStatus.REJECTED) {
      throw new BadRequestException('Cannot update approved or rejected leave applications');
    }

    // Validate date range if dates are being updated
    if (updateLeaveApplicationDto.from_date || updateLeaveApplicationDto.to_date) {
      const fromDate = new Date(updateLeaveApplicationDto.from_date || leaveApplication.from_date);
      const toDate = new Date(updateLeaveApplicationDto.to_date || leaveApplication.to_date);

      if (fromDate > toDate) {
        throw new BadRequestException('From date cannot be after to date');
      }
    }

    Object.assign(leaveApplication, updateLeaveApplicationDto);
    leaveApplication.modified_by = this.request.user?.email || 'system';

    return this.leaveApplicationRepository.save(leaveApplication);
  }

  async approve(id: string, approverId?: string): Promise<LeaveApplication> {
    const leaveApplication = await this.findOne(id);

    if (leaveApplication.status !== LeaveApplicationStatus.OPEN) {
      throw new BadRequestException('Only open leave applications can be approved');
    }

    leaveApplication.status = LeaveApplicationStatus.APPROVED;
    if (approverId) {
      leaveApplication.leave_approver = approverId;
    }
    leaveApplication.modified_by = this.request.user?.email || 'system';

    return this.leaveApplicationRepository.save(leaveApplication);
  }

  async reject(id: string, approverId?: string): Promise<LeaveApplication> {
    const leaveApplication = await this.findOne(id);

    if (leaveApplication.status !== LeaveApplicationStatus.OPEN) {
      throw new BadRequestException('Only open leave applications can be rejected');
    }

    leaveApplication.status = LeaveApplicationStatus.REJECTED;
    if (approverId) {
      leaveApplication.leave_approver = approverId;
    }
    leaveApplication.modified_by = this.request.user?.email || 'system';

    return this.leaveApplicationRepository.save(leaveApplication);
  }

  async cancel(id: string): Promise<LeaveApplication> {
    const leaveApplication = await this.findOne(id);

    if (leaveApplication.status === LeaveApplicationStatus.REJECTED) {
      throw new BadRequestException('Cannot cancel rejected leave applications');
    }

    leaveApplication.status = LeaveApplicationStatus.CANCELLED;
    leaveApplication.modified_by = this.request.user?.email || 'system';

    return this.leaveApplicationRepository.save(leaveApplication);
  }

  async remove(id: string): Promise<void> {
    const leaveApplication = await this.findOne(id);
    
    if (leaveApplication.status === LeaveApplicationStatus.APPROVED) {
      throw new BadRequestException('Cannot delete approved leave applications');
    }

    await this.leaveApplicationRepository.remove(leaveApplication);
  }

  async getLeaveBalance(employeeId: string, leaveTypeId: string, year?: string): Promise<any> {
    const currentYear = year || new Date().getFullYear().toString();
    
    const approvedLeaves = await this.leaveApplicationRepository
      .createQueryBuilder('leave')
      .where('leave.employee_id = :employeeId', { employeeId })
      .andWhere('leave.leave_type_id = :leaveTypeId', { leaveTypeId })
      .andWhere('leave.status = :status', { status: LeaveApplicationStatus.APPROVED })
      .andWhere('leave.from_date LIKE :year', { year: `${currentYear}%` })
      .andWhere('leave.tenant_id = :tenantId', { tenantId: this.tenantId })
      .getMany();

    const totalUsed = approvedLeaves.reduce((sum, leave) => sum + leave.total_leave_days, 0);

    // This would typically come from leave type configuration or employee allocation
    const totalAllocated = 21; // Default annual leave allocation

    return {
      total_allocated: totalAllocated,
      total_used: totalUsed,
      balance: totalAllocated - totalUsed,
      year: currentYear,
    };
  }

  async getLeaveStats(employeeId?: string, year?: string): Promise<any> {
    const queryBuilder = this.leaveApplicationRepository
      .createQueryBuilder('leave')
      .where('leave.tenant_id = :tenantId', { tenantId: this.tenantId });

    if (employeeId) {
      queryBuilder.andWhere('leave.employee_id = :employeeId', { employeeId });
    }

    if (year) {
      queryBuilder.andWhere('leave.from_date LIKE :year', { year: `${year}%` });
    }

    const leaves = await queryBuilder.getMany();

    const stats = {
      total: leaves.length,
      open: leaves.filter(l => l.status === LeaveApplicationStatus.OPEN).length,
      approved: leaves.filter(l => l.status === LeaveApplicationStatus.APPROVED).length,
      rejected: leaves.filter(l => l.status === LeaveApplicationStatus.REJECTED).length,
      cancelled: leaves.filter(l => l.status === LeaveApplicationStatus.CANCELLED).length,
      totalDays: leaves
        .filter(l => l.status === LeaveApplicationStatus.APPROVED)
        .reduce((sum, l) => sum + l.total_leave_days, 0),
    };

    return stats;
  }
}