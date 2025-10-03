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
import { Quotation } from './quotation.entity';
import { Item } from './item.entity';

@Entity('tabQuotation Item')
@Index(['tenant_id', 'parent'])
@Index(['tenant_id', 'item_code'])
export class QuotationItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 140, unique: true })
  name: string;

  // Item Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  item_code: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  customer_item_code: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  item_name: string;

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

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  conversion_factor: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  stock_qty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  actual_qty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  company_total_stock: number;

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

  // Discount
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
  net_rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  net_amount: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  item_tax_template: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_net_rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_net_amount: number;

  @Column({ type: 'text', nullable: true })
  pricing_rules: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  stock_uom_rate: number;

  // Item Flags
  @Column({ type: 'boolean', default: false })
  is_free_item: boolean;

  @Column({ type: 'boolean', default: false })
  is_alternative: boolean;

  @Column({ type: 'boolean', default: false })
  has_alternative_item: boolean;

  // Valuation and Profit
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  valuation_rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  gross_profit: number;

  // Weight Information
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  weight_per_unit: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  total_weight: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  weight_uom: string;

  // Warehouse
  @Column({ type: 'varchar', length: 140, nullable: true })
  warehouse: string;

  // Blanket Order
  @Column({ type: 'boolean', default: false })
  against_blanket_order: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  blanket_order: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  blanket_order_rate: number;

  // Reference Documents
  @Column({ type: 'varchar', length: 140, nullable: true })
  prevdoc_doctype: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  prevdoc_docname: string;

  // Stock Information
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  projected_qty: number;

  // Tax and Additional Information
  @Column({ type: 'longtext', nullable: true })
  item_tax_rate: string;

  @Column({ type: 'text', nullable: true })
  additional_notes: string;

  // Print Settings
  @Column({ type: 'boolean', default: false })
  page_break: boolean;

  // Parent Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  parent: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  parentfield: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
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

  @ManyToOne(() => Quotation, (quotation) => quotation.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent', referencedColumnName: 'name' })
  quotation: Quotation;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_code', referencedColumnName: 'item_code' })
  item_rel: Item;
}