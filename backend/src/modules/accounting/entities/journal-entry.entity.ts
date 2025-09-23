import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../../entities/tenant.entity';
import { JournalEntryLine } from './journal-entry-line.entity';

@Entity('acc_journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  voucherType: string; // e.g., 'Journal Entry'

  @Column({ type: 'date' })
  postingDate: string;

  @Column({ length: 140 })
  company: string;

  @Column({ length: 140, nullable: true })
  referenceNo?: string;

  @Column({ type: 'date', nullable: true })
  referenceDate?: string;

  @Column({ type: 'text', nullable: true })
  userRemark?: string;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => JournalEntryLine, (l) => l.journalEntry, { cascade: true })
  lines: JournalEntryLine[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
