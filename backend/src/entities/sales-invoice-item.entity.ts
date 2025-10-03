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
import { SalesInvoice } from './sales-invoice.entity';
import { Item } from './item.entity';

@Entity('sales_invoice_items')
@Index(['tenant_id', 'sales_invoice_id'])
@Index(['tenant_id', 'item_code'])
export class SalesInvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  sales_invoice_id: string;

  @ManyToOne(() => SalesInvoice, (invoice) => invoice.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sales_invoice_id' })
  sales_invoice: SalesInvoice;

  @Column({ type: 'int', default: 0 })
  docstatus: number;

  @Column({ type: 'int', default: 0 })
  idx: number;

  // Item Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  barcode: string;

  @Column({ type: 'boolean', default: false })
  has_item_scanned: boolean;

  @Column({ type: 'varchar', length: 140 })
  item_code: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_code', referencedColumnName: 'item_code' })
  item: Item;

  @Column({ type: 'varchar', length: 140, nullable: true })
  item_name: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  customer_item_code: string;

  @Column({ type: 'longtext', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  item_group: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  brand: string;

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

  // Pricing Information
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

  // Discount Information
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  discount_percentage: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  distributed_discount_amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_rate_with_margin: number;

  // Rate and Amount
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  item_tax_template: string;

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

  @Column({ type: 'boolean', default: false })
  grant_commission: boolean;

  // Net Amounts
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  net_rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  net_amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_net_rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_net_amount: number;

  // Delivery Information
  @Column({ type: 'boolean', default: false })
  delivered_by_supplier: boolean;

  // Accounting Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  income_account: string;

  @Column({ type: 'boolean', default: false })
  is_fixed_asset: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  asset: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  finance_book: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  expense_account: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  discount_account: string;

  // Deferred Revenue
  @Column({ type: 'varchar', length: 140, nullable: true })
  deferred_revenue_account: string;

  @Column({ type: 'date', nullable: true })
  service_stop_date: Date;

  @Column({ type: 'boolean', default: false })
  enable_deferred_revenue: boolean;

  @Column({ type: 'date', nullable: true })
  service_start_date: Date;

  @Column({ type: 'date', nullable: true })
  service_end_date: Date;

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

  // Quality and Serial/Batch
  @Column({ type: 'varchar', length: 140, nullable: true })
  quality_inspection: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  serial_and_batch_bundle: string;

  @Column({ type: 'boolean', default: false })
  use_serial_batch_fields: boolean;

  @Column({ type: 'boolean', default: false })
  allow_zero_valuation_rate: boolean;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  incoming_rate: number;

  @Column({ type: 'text', nullable: true })
  item_tax_rate: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  actual_batch_qty: number;

  @Column({ type: 'text', nullable: true })
  serial_no: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  batch_no: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  actual_qty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  company_total_stock: number;

  // Reference Documents
  @Column({ type: 'varchar', length: 140, nullable: true })
  sales_order: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  so_detail: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  sales_invoice_item: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  delivery_note: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  dn_detail: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  delivered_qty: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  pos_invoice: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  pos_invoice_item: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  purchase_order: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  purchase_order_item: string;

  // Project and Cost Center
  @Column({ type: 'varchar', length: 140, nullable: true })
  cost_center: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  project: string;

  @Column({ type: 'boolean', default: false })
  page_break: boolean;

  // Parent Information (for ERPNext compatibility)
  @Column({ type: 'varchar', length: 140, nullable: true })
  parent: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  parentfield: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  parenttype: string;

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', length: 140, nullable: true })
  created_by: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  modified_by: string;
}