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
import { Account } from './account.entity';

@Entity('acc_gl_entries')
@Index(['tenant', 'postingDate'])
@Index(['tenant', 'account', 'postingDate'])
@Index(['tenant', 'voucherType', 'voucherNo'])
export class GLEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  postingDate: string;

  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  debit: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  credit: number;

  @Column({ length: 140 })
  voucherType: string; // Journal Entry, Sales Invoice, Purchase Invoice, etc.

  @Column({ length: 140 })
  voucherNo: string;

  @Column({ length: 140, nullable: true })
  againstVoucherType?: string;

  @Column({ length: 140, nullable: true })
  againstVoucher?: string;

  @Column({ length: 140, nullable: true })
  costCenter?: string;

  @Column({ length: 140, nullable: true })
  project?: string;

  @Column({ length: 140 })
  company: string;

  @Column({ type: 'boolean', default: false })
  isCancelled: boolean;

  @Column({ type: 'boolean', default: false })
  isOpening: boolean;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}