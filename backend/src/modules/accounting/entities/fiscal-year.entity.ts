import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../../entities/tenant.entity';
import { Department } from '../../hr/entities/department.entity';

@Entity('acc_fiscal_years')
export class FiscalYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 140 })
  name: string; // e.g., "2023-2024"

  @Column({ type: 'date' })
  yearStartDate: string;

  @Column({ type: 'date' })
  yearEndDate: string;

  @Column({ type: 'boolean', default: false })
  isClosed: boolean;

  @Column({ type: 'boolean', default: false })
  disabled: boolean;

  @Column({ type: 'boolean', default: false })
  autoCreated: boolean;

  @Column({ length: 36, nullable: false })
  tenant_id: string;

  @Column({ length: 36, nullable: true })
  department_id: string | null;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}