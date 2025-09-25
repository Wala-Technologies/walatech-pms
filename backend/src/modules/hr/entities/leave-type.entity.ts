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
import { LeaveApplication } from './leave-application.entity';

@Entity('tabLeaveType')
export class LeaveType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140, unique: true })
  name: string;

  @Column({ length: 140 })
  leave_type_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  max_leaves_allowed: number;

  @Column({ default: false })
  is_carry_forward: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  max_carry_forwarded_leaves: number;

  @Column({ default: false })
  is_encash: boolean;

  @Column({ default: false })
  is_lwp: boolean; // Leave Without Pay

  @Column({ default: false })
  include_holiday: boolean;

  @Column({ default: false })
  allow_negative: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

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

  @OneToMany(() => LeaveApplication, (leaveApplication) => leaveApplication.leave_type)
  leave_applications: LeaveApplication[];
}