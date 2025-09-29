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

export type AccountRootType =
  | 'Asset'
  | 'Liability'
  | 'Income'
  | 'Expense'
  | 'Equity';

@Entity('acc_accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 140 })
  code: string; // e.g., 1000, 1100

  @Column({ length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['Asset', 'Liability', 'Income', 'Expense', 'Equity'],
  })
  rootType: AccountRootType;

  @Column({ type: 'boolean', default: false })
  isGroup: boolean;

  @Column({ type: 'uuid', nullable: true })
  parentAccountId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currency?: string;

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
