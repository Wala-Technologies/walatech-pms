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
import { TestTenant } from './tenant.test.entity';

export type AccountRootType =
  | 'Asset'
  | 'Liability'
  | 'Income'
  | 'Expense'
  | 'Equity';

@Entity('acc_accounts')
export class TestAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 140 })
  code: string; // e.g., 1000, 1100

  @Column({ length: 255 })
  name: string;

  @Column({ length: 20 }) // Using string instead of enum for SQLite
  rootType: string;

  @Column({ type: 'boolean', default: false })
  isGroup: boolean;

  @Column({ type: 'varchar', nullable: true })
  parentAccountId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currency?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => TestTenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TestTenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}