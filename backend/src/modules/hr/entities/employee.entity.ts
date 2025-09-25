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
import { User } from '../../../entities/user.entity';
import { Department } from './department.entity';
import { Designation } from './designation.entity';
import { Attendance } from './attendance.entity';
import { LeaveApplication } from './leave-application.entity';

export enum EmployeeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  LEFT = 'Left',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum MaritalStatus {
  SINGLE = 'Single',
  MARRIED = 'Married',
  DIVORCED = 'Divorced',
  WIDOWED = 'Widowed',
}

@Entity('tabEmployee')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140, unique: true })
  name: string; // Employee ID

  @Column({ length: 140 })
  employee_name: string;

  @Column({ length: 140, nullable: true })
  first_name: string;

  @Column({ length: 140, nullable: true })
  middle_name: string;

  @Column({ length: 140, nullable: true })
  last_name: string;

  @Column({ length: 140, nullable: true })
  company: string;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'date', nullable: true })
  date_of_joining: Date;

  @Column({ type: 'date', nullable: true })
  relieving_date: Date;

  @Column({ length: 140, nullable: true })
  employee_number: string;

  @Column({ length: 140, nullable: true })
  personal_email: string;

  @Column({ length: 140, nullable: true })
  company_email: string;

  @Column({ length: 20, nullable: true })
  cell_number: string;

  @Column({ length: 20, nullable: true })
  emergency_phone_number: string;

  @Column({
    type: 'enum',
    enum: MaritalStatus,
    nullable: true,
  })
  marital_status: MaritalStatus;

  @Column({ type: 'text', nullable: true })
  current_address: string;

  @Column({ type: 'text', nullable: true })
  permanent_address: string;

  @Column({ length: 140, nullable: true })
  blood_group: string;

  @Column({ length: 140, nullable: true })
  nationality: string;

  @Column({ length: 140, nullable: true })
  passport_number: string;

  @Column({ length: 140, nullable: true })
  salary_mode: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salary_amount: number;

  @Column({ length: 140, nullable: true })
  bank_name: string;

  @Column({ length: 140, nullable: true })
  bank_ac_no: string;

  @Column({ length: 140, nullable: true })
  iban: string;

  @Column({ length: 140, nullable: true })
  reports_to: string;

  @Column({ default: false })
  create_user_permission: boolean;

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

  @Column({ length: 36, nullable: true })
  user_id: string;

  @Column({ length: 36, nullable: true })
  department_id: string;

  @Column({ length: 36, nullable: true })
  designation_id: string;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Department, (department) => department.employees)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Designation, (designation) => designation.employees)
  @JoinColumn({ name: 'designation_id' })
  designation: Designation;

  @OneToMany(() => Attendance, (attendance) => attendance.employee)
  attendances: Attendance[];

  @OneToMany(() => LeaveApplication, (leaveApplication) => leaveApplication.employee)
  leave_applications: LeaveApplication[];
}