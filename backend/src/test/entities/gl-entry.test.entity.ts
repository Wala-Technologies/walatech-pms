import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('acc_gl_entries')
@Index(['tenant_id', 'postingDate'])
export class TestGLEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  postingDate: string;

  @Column({ length: 140 })
  accountCode: string; // Instead of relationship, use account code

  @Column({ length: 255 })
  accountName: string;

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

  @Column({ length: 140 })
  tenant_id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}