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
import { Employee } from './employee.entity';

@Entity('tabDepartment')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140, unique: true })
  name: string;

  @Column({ length: 140 })
  department_name: string;

  @Column({ length: 140, nullable: true })
  parent_department: string;

  @Column({ length: 140, nullable: true })
  company: string;

  @Column({ default: false })
  is_group: boolean;

  @Column({ default: false })
  disabled: boolean;

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

  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];
}