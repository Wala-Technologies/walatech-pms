import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { DeliveryNote } from './delivery-note.entity';
import { Item } from './item.entity';

@Entity('tabDelivery Note Item')
@Index(['tenant_id', 'delivery_note_id'])
@Index(['tenant_id', 'item_code'])
export class DeliveryNoteItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 140, unique: true })
  name: string;

  // Item Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  barcode: string;

  @Column({ type: 'boolean', default: false })
  has_item_scanned: boolean;

  @Column({ type: 'varchar', length: 140 })
  item_code: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  item_name: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  customer_item_code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  brand: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  item_group: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  // Quantity and UOM
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  qty: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  stock_uom: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  uom: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 1 })
  conversion_factor: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  stock_qty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  returned_qty: number;

  // Pricing
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  price_list_rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_price_list_rate: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  margin_type: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  margin_rate_or_amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  rate_with_margin: number;

  // Discounts
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  discount_percentage: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  distributed_discount_amount: number;

  // Rates and Amounts
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_rate_with_margin: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_amount: number;

  @Column({ type: 'text', nullable: true })
  pricing_rules: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  stock_uom_rate: number;

  @Column({ type: 'boolean', default: false })
  is_free_item: boolean;

  @Column({ type: 'boolean', default: true })
  grant_commission: boolean;

  // Net Amounts
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  net_rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  net_amount: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  item_tax_template: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_net_rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_net_amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  billed_amt: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  incoming_rate: number;

  // Weight Information
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  weight_per_unit: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  total_weight: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  weight_uom: string;

  // Warehouse Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  warehouse: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  target_warehouse: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  quality_inspection: string;

  @Column({ type: 'boolean', default: false })
  allow_zero_valuation_rate: boolean;

  // Reference Documents
  @Column({ type: 'varchar', length: 140, nullable: true })
  against_sales_order: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  so_detail: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  against_sales_invoice: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  si_detail: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  dn_detail: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  against_pick_list: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  pick_list_item: string;

  // Serial and Batch Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  serial_and_batch_bundle: string;

  @Column({ type: 'boolean', default: false })
  use_serial_batch_fields: boolean;

  @Column({ type: 'text', nullable: true })
  serial_no: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  batch_no: string;

  // Stock Information
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  actual_qty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  actual_batch_qty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  company_total_stock: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  installed_qty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  packed_qty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  received_qty: number;

  // Accounting
  @Column({ type: 'varchar', length: 140, nullable: true })
  expense_account: string;

  @Column({ type: 'text', nullable: true })
  item_tax_rate: string;

  // Purchase References
  @Column({ type: 'varchar', length: 140, nullable: true })
  material_request: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  purchase_order: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  purchase_order_item: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  material_request_item: string;

  // Project and Cost Center
  @Column({ type: 'varchar', length: 140, nullable: true })
  cost_center: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  project: string;

  // Print Settings
  @Column({ type: 'boolean', default: false })
  page_break: boolean;

  // Parent Information
  @Column({ type: 'varchar', length: 140 })
  delivery_note_id: string;

  @Column({ type: 'varchar', length: 140, default: 'items' })
  parentfield: string;

  @Column({ type: 'varchar', length: 140, default: 'Delivery Note' })
  parenttype: string;

  // Standard ERPNext Fields
  @Column({ type: 'int', default: 0 })
  docstatus: number;

  @Column({ type: 'int', default: 0 })
  idx: number;

  @Column({ type: 'varchar', length: 140 })
  tenant_id: string;

  @Column({ type: 'varchar', length: 140 })
  created_by: string;

  @Column({ type: 'varchar', length: 140 })
  modified_by: string;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 6 })
  modified: Date;

  // Relationships
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => DeliveryNote, (deliveryNote) => deliveryNote.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'delivery_note_id' })
  delivery_note: DeliveryNote;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_code', referencedColumnName: 'item_code' })
  item: Item;
}