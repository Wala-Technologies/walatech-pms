import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Supplier } from './supplier.entity';
import { Department } from '../modules/hr/entities/department.entity';

@Entity('tabSupplierQuotation')
@Index('IDX_quotation_number_tenant', ['quotation_number', 'tenant_id'], { unique: true })
export class SupplierQuotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140 })
  quotation_number: string;

  @Column({ length: 140 })
  supplier_id: string;

  @Column({ type: 'date' })
  quotation_date: Date;

  @Column({ type: 'date', nullable: true })
  valid_till: Date;

  @Column({ length: 20, default: 'Draft' })
  status: string; // Draft, Submitted, Ordered, Expired, Cancelled

  @Column({ length: 3, default: 'ETB' })
  currency: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 1 })
  conversion_rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_qty: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  base_total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  base_net_total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_taxes_and_charges: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  base_total_taxes_and_charges: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  base_grand_total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  grand_total: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  additional_discount_percentage: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ length: 140, nullable: true })
  tax_category: string;

  @Column({ length: 140, nullable: true })
  shipping_rule: string;

  @Column({ length: 140, nullable: true })
  purchase_taxes_and_charges_template: string;

  @Column({ length: 140, nullable: true })
  payment_terms_template: string;

  @Column({ type: 'text', nullable: true })
  terms_and_conditions: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 140, nullable: true })
  material_request: string;

  @Column({ length: 140, nullable: true })
  opportunity: string;

  // System Fields
  @CreateDateColumn()
  creation: Date;

  @UpdateDateColumn()
  modified: Date;

  @Column({ length: 140, nullable: true })
  modified_by: string;

  @Column({ length: 140, nullable: true })
  owner: string;

  @Column({ length: 36, nullable: false })
  tenant_id: string;

  @Column({ length: 36, nullable: true })
  department_id: string | null;

  // Relationships
  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Supplier, { nullable: false })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => SupplierQuotationItem, item => item.quotation)
  items: SupplierQuotationItem[];
}

@Entity('tabSupplierQuotationItem')
export class SupplierQuotationItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140 })
  quotation_id: string;

  @Column({ length: 140 })
  item_code: string;

  @Column({ length: 140, nullable: true })
  item_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 140, nullable: true })
  item_group: string;

  @Column({ length: 140, nullable: true })
  brand: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  qty: number;

  @Column({ length: 50, nullable: true })
  uom: string;

  @Column({ length: 50, nullable: true })
  stock_uom: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 1 })
  conversion_factor: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  stock_qty: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  base_rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  base_amount: number;

  @Column({ length: 140, nullable: true })
  price_list_rate: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  discount_percentage: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  net_rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  net_amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  base_net_rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  base_net_amount: number;

  @Column({ type: 'date', nullable: true })
  expected_delivery_date: Date;

  @Column({ length: 140, nullable: true })
  warehouse: string;

  @Column({ length: 140, nullable: true })
  project: string;

  @Column({ length: 140, nullable: true })
  material_request: string;

  @Column({ length: 140, nullable: true })
  material_request_item: string;

  // System Fields
  @CreateDateColumn()
  creation: Date;

  @UpdateDateColumn()
  modified: Date;

  @Column({ length: 140, nullable: true })
  modified_by: string;

  @Column({ length: 140, nullable: true })
  owner: string;

  @Column({ length: 36, nullable: false })
  tenant_id: string;

  // Relationships
  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => SupplierQuotation, quotation => quotation.items)
  @JoinColumn({ name: 'quotation_id' })
  quotation: SupplierQuotation;
}