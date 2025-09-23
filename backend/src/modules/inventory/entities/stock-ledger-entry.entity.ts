import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Item } from '../../../entities/item.entity';
import { Warehouse } from './warehouse.entity';
import { Batch } from './batch.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';

export enum VoucherType {
  STOCK_ENTRY = 'Stock Entry',
  PURCHASE_RECEIPT = 'Purchase Receipt',
  PURCHASE_INVOICE = 'Purchase Invoice',
  DELIVERY_NOTE = 'Delivery Note',
  SALES_INVOICE = 'Sales Invoice',
  STOCK_RECONCILIATION = 'Stock Reconciliation',
  MATERIAL_REQUEST = 'Material Request',
  WORK_ORDER = 'Work Order',
  JOB_CARD = 'Job Card',
  PICK_LIST = 'Pick List',
  STOCK_RESERVATION_ENTRY = 'Stock Reservation Entry',
}

@Entity('stock_ledger_entries')
@Index(['itemCode', 'warehouse', 'postingDate', 'postingTime'])
@Index(['voucherType', 'voucherNo'])
@Index(['batchNo'])
@Index(['serialNo'])
export class StockLedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itemCode: string;

  @Column()
  warehouse: string;

  @Column({ type: 'date' })
  postingDate: Date;

  @Column({ type: 'time' })
  postingTime: string;

  @Column({ type: 'enum', enum: VoucherType })
  voucherType: VoucherType;

  @Column()
  voucherNo: string;

  @Column({ nullable: true })
  voucherDetailNo: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  actualQty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  qtyAfterTransaction: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  incomingRate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  outgoingRate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  stockValue: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  stockValueDifference: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  valuationRate: number;

  @Column({ nullable: true })
  stockUom: string;

  @Column({ nullable: true })
  serialNo: string;

  @Column({ nullable: true })
  batchNo: string;

  @Column({ nullable: true })
  project: string;

  @Column({ nullable: true })
  company: string;

  @Column({ type: 'boolean', default: false })
  isSubmitted: boolean;

  @Column({ type: 'boolean', default: false })
  isCancelled: boolean;

  @Column({ type: 'boolean', default: false })
  hasSerialNo: boolean;

  @Column({ type: 'boolean', default: false })
  hasBatchNo: boolean;

  @Column({ type: 'decimal', precision: 21, scale: 9, nullable: true })
  dependsOnLwb: number; // Last Working Balance

  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

  // Relationships
  @ManyToOne(() => Item, { nullable: false })
  @JoinColumn({ name: 'item_code', referencedColumnName: 'code' })
  item: Item;

  @ManyToOne(() => Warehouse, { nullable: false })
  @JoinColumn({ name: 'warehouse_id' })
  warehouseEntity: Warehouse;

  @ManyToOne(() => Batch, { nullable: true })
  @JoinColumn({ name: 'batch_no', referencedColumnName: 'name' })
  batch: Batch;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isIncoming(): boolean {
    return this.actualQty > 0;
  }

  get isOutgoing(): boolean {
    return this.actualQty < 0;
  }

  get absoluteQty(): number {
    return Math.abs(this.actualQty);
  }

  get transactionType(): string {
    return this.isIncoming ? 'IN' : 'OUT';
  }

  get postingDateTime(): Date {
    const [hours, minutes, seconds] = this.postingTime.split(':').map(Number);
    const dateTime = new Date(this.postingDate);
    dateTime.setHours(hours, minutes, seconds || 0);
    return dateTime;
  }

  get displayName(): string {
    return `${this.voucherType} - ${this.voucherNo}`;
  }

  // Methods
  calculateStockValue(): void {
    this.stockValue = this.qtyAfterTransaction * this.valuationRate;
  }

  calculateStockValueDifference(previousStockValue: number = 0): void {
    this.stockValueDifference = this.stockValue - previousStockValue;
  }

  setValuationRate(rate: number): void {
    this.valuationRate = rate;
    this.calculateStockValue();
  }

  updateQtyAfterTransaction(previousQty: number): void {
    this.qtyAfterTransaction = previousQty + this.actualQty;
  }

  // Static methods for querying
  static getStockBalance(itemCode: string, warehouse: string, date?: Date): number {
    // This would be implemented as a repository method
    // Returns the stock balance for an item in a warehouse as of a specific date
    return 0;
  }

  static getStockValue(itemCode: string, warehouse: string, date?: Date): number {
    // This would be implemented as a repository method
    // Returns the stock value for an item in a warehouse as of a specific date
    return 0;
  }

  static getValuationRate(itemCode: string, warehouse: string, date?: Date): number {
    // This would be implemented as a repository method
    // Returns the valuation rate for an item in a warehouse as of a specific date
    return 0;
  }
}