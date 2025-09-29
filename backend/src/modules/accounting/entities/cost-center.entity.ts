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

@Entity('acc_cost_centers')
export class CostCenter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 140 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'boolean', default: false })
  isGroup: boolean;

  @Column({ type: 'uuid', nullable: true })
  parentCostCenterId?: string;

  @Column({ length: 140 })
  company: string;

  @Column({ type: 'boolean', default: false })
  disabled: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;

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