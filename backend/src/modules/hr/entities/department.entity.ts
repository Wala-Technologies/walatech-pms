import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';
import { Employee } from './employee.entity';
import { BusinessUnitType } from '../../../common/enums/business-unit-types.enum';

@Entity('tabDepartment')
@Index(['tenant_id', 'name'], { unique: true })
@Index(['tenant_id', 'code'], { unique: true })
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140 })
  name: string;

  @Column({ length: 20 })
  code: string;

  @Column({ length: 140 })
  department_name: string;

  @Column({ length: 36, nullable: true })
  parent_department_id: string;

  @Column({ length: 140, nullable: true })
  parent_department: string;

  @Column({ length: 140, nullable: true })
  company: string;

  @Column({
    type: 'enum',
    enum: BusinessUnitType,
    default: BusinessUnitType.GENERAL
  })
  business_unit_type: BusinessUnitType;

  @Column({ default: false })
  is_group: boolean;

  @Column({ default: false })
  disabled: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 140, nullable: true })
  department_head: string;

  @Column({ length: 140, nullable: true })
  cost_center: string;

  @Column({ type: 'json', nullable: true })
  permissions: Record<string, any>;

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

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'parent_department_id' })
  parentDepartment: Department;

  @OneToMany(() => Department, (department) => department.parentDepartment)
  childDepartments: Department[];

  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];
}