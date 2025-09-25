import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../../entities/tenant.entity';
import { Attendance } from './attendance.entity';

@Entity('tabShiftType')
export class ShiftType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140, unique: true })
  name: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  total_hours: number;

  @Column({ default: false })
  enable_late_entry_marking: boolean;

  @Column({ type: 'int', default: 0 })
  late_entry_grace_period: number; // in minutes

  @Column({ default: false })
  enable_early_exit_marking: boolean;

  @Column({ type: 'int', default: 0 })
  early_exit_grace_period: number; // in minutes

  @Column({ default: false })
  include_holidays_in_total_working_hours: boolean;

  @Column({ default: false })
  enable_auto_attendance: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_sync_of_checkin: Date;

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

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => Attendance, (attendance) => attendance.shift_type)
  attendances: Attendance[];
}