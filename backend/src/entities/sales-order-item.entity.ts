import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';
import { SalesOrder } from './sales-order.entity';

@Entity('tabSales Order Item')
export class SalesOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sales_order_id: string;

  @Column({ length: 140 })
  item_code: string;

  @Column({ length: 140 })
  item_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  qty: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  base_rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  base_amount: number;

  @Column({ type: 'date' })
  delivery_date: Date;

  @Column({ length: 140, nullable: true })
  warehouse: string;

  @Column({ length: 50, default: 'Nos' })
  uom: string;

  @Column({ length: 50, default: 'Nos' })
  stock_uom: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 1.0 })
  conversion_factor: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  delivered_qty: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  billed_qty: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  returned_qty: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  discount_percentage: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  net_rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  net_amount: number;

  @Column({ length: 140, nullable: true })
  item_group: string;

  @Column({ length: 140, nullable: true })
  brand: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ length: 140, nullable: true })
  item_tax_template: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  weight_per_unit: number;

  @Column({ length: 50, nullable: true })
  weight_uom: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_weight: number;

  @Column({ default: false })
  is_free_item: boolean;

  @Column({ default: false })
  is_stock_item: boolean;

  @Column({ length: 140, nullable: true })
  supplier: string;

  @Column({ default: false })
  supplier_delivers_to_customer: boolean; // Drop shipping

  @Column({ type: 'text', nullable: true })
  page_break: string;

  // Tenant relationship
  @Column()
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Sales Order relationship
  @ManyToOne(() => SalesOrder, (salesOrder) => salesOrder.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sales_order_id' })
  sales_order: SalesOrder;

  // Audit fields
  @Column({ length: 140, nullable: true })
  owner: string;

  @Column({ length: 140, nullable: true })
  modified_by: string;

  @CreateDateColumn()
  creation: Date;

  @UpdateDateColumn()
  modified: Date;

  @Column({ type: 'int', default: 0 })
  idx: number;

  @Column({ length: 140, nullable: true })
  parent: string; // Reference to parent document

  @Column({ length: 140, default: 'Sales Order' })
  parenttype: string;

  @Column({ length: 140, default: 'items' })
  parentfield: string;
}