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
import { Employee } from './employee.entity';

@Entity('tabDesignation')
export class Designation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140, unique: true })
  name: string;

  @Column({ length: 140 })
  designation_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  skill_requirements: string;

  @Column({ type: 'text', nullable: true })
  job_description: string;

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

  @OneToMany(() => Employee, (employee) => employee.designation)
  employees: Employee[];
}