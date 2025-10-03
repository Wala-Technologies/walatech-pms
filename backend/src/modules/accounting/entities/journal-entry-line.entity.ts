import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { Department } from '../../hr/entities/department.entity';

@Entity('acc_journal_entry_lines')
export class JournalEntryLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => JournalEntry, (je) => je.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry: JournalEntry;

  @Column({ length: 140 })
  account: string; // reference to Account.code (denormalized for speed)

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  debitInAccountCurrency: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  creditInAccountCurrency: number;

  @Column({ length: 140, nullable: true })
  costCenter?: string;

  @Column({ length: 140, nullable: true })
  partyType?: string;

  @Column({ length: 140, nullable: true })
  party?: string;

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
}
