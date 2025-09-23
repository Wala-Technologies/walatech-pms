import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '../../../entities/item.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';

@Entity('batches')
export class Batch {
  @PrimaryColumn()
  name: string; // Batch number

  @Column()
  itemCode: string;

  @Column({ nullable: true })
  itemName: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  batchQty: number;

  @Column({ type: 'date', nullable: true })
  manufacturingDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  supplier: string;

  @Column({ nullable: true })
  reference: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, nullable: true })
  batchValue: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, nullable: true })
  rate: number;

  @Column({ type: 'boolean', default: false })
  disabled: boolean;

  @Column({ nullable: true })
  parentBatch: string;

  @Column({ type: 'text', nullable: true })
  batchId: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

  // Relationships
  @ManyToOne(() => Item, { nullable: false })
  @JoinColumn({ name: 'item_code', referencedColumnName: 'code' })
  item: Item;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false })
  tenant_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'modified_by' })
  modifiedBy: User;

  @Column({ nullable: true })
  modifiedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  get isExpiringSoon(): boolean {
    if (!this.expiryDate) return false;
    const warningDays = 30; // 30 days warning
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + warningDays);
    return this.expiryDate <= warningDate;
  }

  get daysToExpiry(): number | null {
    if (!this.expiryDate) return null;
    const today = new Date();
    const diffTime = this.expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isActive(): boolean {
    return !this.disabled && !this.isExpired;
  }

  get displayName(): string {
    return `${this.name} (${this.itemCode})`;
  }
}