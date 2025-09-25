import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../../../entities/tenant.entity';
import { Employee } from './employee.entity';
import { ShiftType } from './shift-type.entity';
import { LeaveApplication } from './leave-application.entity';

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  ON_LEAVE = 'On Leave',
  HALF_DAY = 'Half Day',
  WORK_FROM_HOME = 'Work From Home',
}

@Entity('tabAttendance')
@Index(['employee_id', 'attendance_date'], { unique: true })
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  attendance_date: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({ type: 'time', nullable: true })
  in_time: string;

  @Column({ type: 'time', nullable: true })
  out_time: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  working_hours: number;

  @Column({ type: 'int', default: 0 })
  late_entry: number; // in minutes

  @Column({ type: 'int', default: 0 })
  early_exit: number; // in minutes

  @Column({ length: 140, nullable: true })
  company: string;

  @Column({ length: 140, nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  attendance_request: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

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

  @Column({ length: 36, nullable: true })
  shift_type_id: string;

  @Column({ length: 36, nullable: true })
  leave_application_id: string;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Employee, (employee) => employee.attendances)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => ShiftType, (shiftType) => shiftType.attendances)
  @JoinColumn({ name: 'shift_type_id' })
  shift_type: ShiftType;

  @ManyToOne(() => LeaveApplication)
  @JoinColumn({ name: 'leave_application_id' })
  leave_application: LeaveApplication;
}