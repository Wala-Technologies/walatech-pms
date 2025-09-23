import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '../../../entities/item.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { Warehouse } from './warehouse.entity';
import { StockEntry } from './stock-entry.entity';
import { Batch } from './batch.entity';

@Entity('stock_entry_details')
export class StockEntryDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itemCode: string;

  @Column({ nullable: true })
  itemName: string;

  @Column({ type: 'decimal', precision: 21, scale: 9 })
  qty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, nullable: true })
  transferQty: number;

  @Column({ nullable: true })
  uom: string;

  @Column({ nullable: true })
  stockUom: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 1 })
  conversionFactor: number;

  @Column({ nullable: true })
  sWarehouse: string; // Source warehouse

  @Column({ nullable: true })
  tWarehouse: string; // Target warehouse

  @Column({ type: 'decimal', precision: 21, scale: 9, nullable: true })
  basicRate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, nullable: true })
  basicAmount: number;

  @Column({ nullable: true })
  batchNo: string;

  @Column({ type: 'text', nullable: true })
  serialNo: string; // Newline separated serial numbers

  @Column({ nullable: true })
  costCenter: string;

  @Column({ nullable: true })
  expenseAccount: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, nullable: true })
  incomingRate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, nullable: true })
  amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, nullable: true })
  valuationRate: number;

  @Column({ type: 'boolean', default: false })
  allowZeroValuationRate: boolean;

  @Column({ nullable: true })
  materialRequest: string;

  @Column({ nullable: true })
  materialRequestItem: string;

  @Column({ nullable: true })
  originalItem: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, nullable: true })
  additionalCost: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, nullable: true })
  retainSample: number;

  @Column({ nullable: true })
  sampleQuantity: number;

  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

  // Relationships
  @ManyToOne(() => StockEntry, stockEntry => stockEntry.items, { nullable: false })
  @JoinColumn({ name: 'stock_entry_id' })
  stockEntry: StockEntry;

  @Column({ nullable: false })
  stockEntryId: string;

  @ManyToOne(() => Item, { nullable: false })
  @JoinColumn({ name: 'item_code', referencedColumnName: 'code' })
  item: Item;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 's_warehouse_id' })
  sourceWarehouse: Warehouse;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 't_warehouse_id' })
  targetWarehouse: Warehouse;

  @ManyToOne(() => Batch, { nullable: true })
  @JoinColumn({ name: 'batch_no', referencedColumnName: 'name' })
  batch: Batch;

  @Column({ name: 'tenant_id' })
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isIncoming(): boolean {
    return !!this.tWarehouse && !this.sWarehouse;
  }

  get isOutgoing(): boolean {
    return !!this.sWarehouse && !this.tWarehouse;
  }

  get isTransfer(): boolean {
    return !!this.sWarehouse && !!this.tWarehouse;
  }

  get actualQty(): number {
    return this.transferQty || this.qty;
  }

  get serialNumbers(): string[] {
    if (!this.serialNo) return [];
    return this.serialNo.split('\n').filter(sn => sn.trim().length > 0);
  }

  get hasSerialNumbers(): boolean {
    return this.serialNumbers.length > 0;
  }

  get hasBatch(): boolean {
    return !!this.batchNo;
  }

  // Methods
  calculateAmount(): void {
    this.basicAmount = (this.qty || 0) * (this.basicRate || 0);
    this.amount = this.basicAmount + (this.additionalCost || 0);
  }

  calculateTransferQty(): void {
    this.transferQty = (this.qty || 0) * (this.conversionFactor || 1);
  }

  setSerialNumbers(serialNumbers: string[]): void {
    this.serialNo = serialNumbers.join('\n');
  }

  addSerialNumber(serialNumber: string): void {
    const current = this.serialNumbers;
    if (!current.includes(serialNumber)) {
      current.push(serialNumber);
      this.setSerialNumbers(current);
    }
  }

  removeSerialNumber(serialNumber: string): void {
    const current = this.serialNumbers;
    const filtered = current.filter(sn => sn !== serialNumber);
    this.setSerialNumbers(filtered);
  }
}