import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Tenant } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';
import { Warehouse } from './warehouse.entity';
import { StockEntryDetail } from './stock-entry-detail.entity';

export enum StockEntryPurpose {
  MATERIAL_RECEIPT = 'Material Receipt',
  MATERIAL_ISSUE = 'Material Issue',
  MATERIAL_TRANSFER = 'Material Transfer',
  MATERIAL_TRANSFER_FOR_MANUFACTURE = 'Material Transfer for Manufacture',
  MANUFACTURE = 'Manufacture',
  REPACK = 'Repack',
  SEND_TO_SUBCONTRACTOR = 'Send to Subcontractor',
  MATERIAL_CONSUMPTION_FOR_MANUFACTURE = 'Material Consumption for Manufacture',
}

export enum StockEntryType {
  MATERIAL_RECEIPT = 'Material Receipt',
  MATERIAL_ISSUE = 'Material Issue',
  MATERIAL_TRANSFER = 'Material Transfer',
  MANUFACTURE = 'Manufacture',
  REPACK = 'Repack',
  SEND_TO_SUBCONTRACTOR = 'Send to Subcontractor',
}

@Entity('stock_entries')
export class StockEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // Auto-generated stock entry number

  @Column({ type: 'enum', enum: StockEntryType, nullable: true })
  stockEntryType: StockEntryType;

  @Column({ type: 'date' })
  postingDate: Date;

  @Column({ type: 'time', nullable: true })
  postingTime: string;

  @Column({ type: 'enum', enum: StockEntryPurpose })
  purpose: StockEntryPurpose;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  fromWarehouseId: string;

  @Column({ nullable: true })
  toWarehouseId: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  totalOutgoingValue: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  totalIncomingValue: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  perTransferred: number;

  @Column({ type: 'int', default: 0 })
  docstatus: number; // 0: Draft, 1: Submitted, 2: Cancelled

  @Column({ type: 'boolean', default: false })
  isReturn: boolean;

  @Column({ nullable: true })
  workOrder: string;

  @Column({ nullable: true })
  materialRequest: string;

  @Column({ nullable: true })
  deliveryNoteNo: string;

  @Column({ nullable: true })
  purchaseReceiptNo: string;

  @Column({ nullable: true })
  salesInvoiceNo: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ nullable: true })
  project: string;

  @Column({ nullable: true })
  costCenter: string;

  @Column({ type: 'boolean', default: false })
  addToTransit: boolean;

  @Column({ nullable: true })
  outgoingStockEntry: string;

  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

  // Relationships
  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'from_warehouse_id' })
  fromWarehouse: Warehouse;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'to_warehouse_id' })
  toWarehouse: Warehouse;

  @OneToMany(() => StockEntryDetail, detail => detail.stockEntry, { cascade: true })
  items: StockEntryDetail[];

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
  get isDraft(): boolean {
    return this.docstatus === 0;
  }

  get isSubmitted(): boolean {
    return this.docstatus === 1;
  }

  get isCancelled(): boolean {
    return this.docstatus === 2;
  }

  get isCompleted(): boolean {
    return this.perTransferred >= 100;
  }

  get status(): string {
    if (this.isCancelled) return 'Cancelled';
    if (this.isDraft) return 'Draft';
    if (this.isCompleted) return 'Completed';
    return 'In Progress';
  }

  get displayName(): string {
    return `${this.name} - ${this.purpose}`;
  }

  // Methods
  calculateTotals(): void {
    if (!this.items || this.items.length === 0) {
      this.totalOutgoingValue = 0;
      this.totalIncomingValue = 0;
      this.totalAmount = 0;
      return;
    }

    this.totalOutgoingValue = this.items
      .filter(item => item.sWarehouse)
      .reduce((sum, item) => sum + (item.basicAmount || 0), 0);

    this.totalIncomingValue = this.items
      .filter(item => item.tWarehouse)
      .reduce((sum, item) => sum + (item.basicAmount || 0), 0);

    this.totalAmount = Math.max(this.totalOutgoingValue, this.totalIncomingValue);
  }
}