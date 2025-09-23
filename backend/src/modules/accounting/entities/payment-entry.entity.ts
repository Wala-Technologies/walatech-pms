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

export type PaymentType = 'Receive' | 'Pay';

@Entity('acc_payment_entries')
@Index(['tenant', 'postingDate'])
@Index(['tenant', 'paymentType'])
export class PaymentEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['Receive', 'Pay'],
  })
  paymentType: PaymentType;

  @Column({ type: 'date' })
  postingDate: string;

  @Column({ length: 140 })
  company: string;

  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'paid_from_account_id' })
  paidFromAccount: Account;

  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'paid_to_account_id' })
  paidToAccount: Account;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  receivedAmount: number;

  @Column({ length: 140, nullable: true })
  partyType?: string; // Customer, Supplier, Employee

  @Column({ length: 140, nullable: true })
  party?: string;

  @Column({ length: 140, nullable: true })
  referenceNo?: string;

  @Column({ type: 'date', nullable: true })
  referenceDate?: string;

  @Column({ length: 140, nullable: true })
  costCenter?: string;

  @Column({ length: 140, nullable: true })
  project?: string;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @Column({ type: 'boolean', default: false })
  isSubmitted: boolean;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}