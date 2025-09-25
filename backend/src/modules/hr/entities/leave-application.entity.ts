import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../../entities/tenant.entity';
import { Employee } from './employee.entity';
import { LeaveType } from './leave-type.entity';

export enum LeaveApplicationStatus {
  DRAFT = 'Draft',
  OPEN = 'Open',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled',
}

@Entity('tabLeaveApplication')
export class LeaveApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140 })
  employee_name: string; // Cached employee name

  @Column({ type: 'date' })
  from_date: Date;

  @Column({ type: 'date' })
  to_date: Date;

  @Column({ default: false })
  half_day: boolean;

  @Column({ type: 'date', nullable: true })
  half_day_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_leave_days: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 140, nullable: true })
  leave_approver: string;

  @Column({ length: 140, nullable: true })
  leave_approver_name: string;

  @Column({
    type: 'enum',
    enum: LeaveApplicationStatus,
    default: LeaveApplicationStatus.DRAFT,
  })
  status: LeaveApplicationStatus;

  @Column({ type: 'date' })
  posting_date: Date;

  @Column({ length: 140, nullable: true })
  company: string;

  @Column({ length: 140, nullable: true })
  department: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  leave_balance: number;

  @Column({ type: 'text', nullable: true })
  follow_via_email: string;

  @Column({ type: 'text', nullable: true })
  color: string;

  @CreateDateColumn()
  creation: Date;

  @UpdateDateColumn()
  modified: Date;

  @Column({ length: 140, nullable: true })
  modified_by: string;

  @Column({ length: 140, nullable: true })
  owner: string;

  @Column({ length: 36, nullable: true })
  tenant_id: string;

  @Column({ length: 36 })
  employee_id: string;

  @Column({ length: 36 })
  leave_type_id: string;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Employee, (employee) => employee.leave_applications)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => LeaveType, (leaveType) => leaveType.leave_applications)
  @JoinColumn({ name: 'leave_type_id' })
  leave_type: LeaveType;
}