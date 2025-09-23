import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '../../../entities/item.entity';
import { Warehouse } from './warehouse.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';

@Entity('serial_nos')
export class SerialNo {
  @PrimaryColumn()
  name: string; // Serial number

  @Column()
  itemCode: string;

  @Column({ nullable: true })
  itemName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  itemGroup: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  warehouseId: string;

  @Column({ nullable: true })
  purchaseDocumentNo: string;

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ type: 'decimal', precision: 21, scale: 9, nullable: true })
  purchaseRate: number;

  @Column({ nullable: true })
  supplier: string;

  @Column({ type: 'date', nullable: true })
  warrantyExpiryDate: Date;

  @Column({ type: 'date', nullable: true })
  amcExpiryDate: Date;

  @Column({ nullable: true })
  deliveryDocumentType: string;

  @Column({ nullable: true })
  deliveryDocumentNo: string;

  @Column({ type: 'date', nullable: true })
  deliveryDate: Date;

  @Column({ nullable: true })
  salesInvoice: string;

  @Column({ nullable: true })
  purchaseInvoice: string;

  @Column({ nullable: true })
  company: string;

  @Column({ type: 'enum', enum: ['Available', 'Delivered', 'Expired', 'Inactive'], default: 'Available' })
  status: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  assetStatus: string;

  @Column({ type: 'date', nullable: true })
  maintenanceDate: Date;

  @Column({ type: 'text', nullable: true })
  maintenanceStatus: string;

  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

  // Relationships
  @ManyToOne(() => Item, { nullable: false })
  @JoinColumn({ name: 'item_code', referencedColumnName: 'code' })
  item: Item;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

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
  get isWarrantyExpired(): boolean {
    if (!this.warrantyExpiryDate) return false;
    return new Date() > this.warrantyExpiryDate;
  }

  get isAmcExpired(): boolean {
    if (!this.amcExpiryDate) return false;
    return new Date() > this.amcExpiryDate;
  }

  get isAvailable(): boolean {
    return this.status === 'Available';
  }

  get isDelivered(): boolean {
    return this.status === 'Delivered';
  }

  get warrantyDaysRemaining(): number | null {
    if (!this.warrantyExpiryDate) return null;
    const today = new Date();
    const diffTime = this.warrantyExpiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get amcDaysRemaining(): number | null {
    if (!this.amcExpiryDate) return null;
    const today = new Date();
    const diffTime = this.amcExpiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get displayName(): string {
    return `${this.name} (${this.itemCode})`;
  }
}