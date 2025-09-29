import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Tenant } from './tenant.entity';
import { SupplierGroup } from './supplier-group.entity';
import { Department } from '../modules/hr/entities/department.entity';

@Entity('tabSupplier')
@Index('IDX_supplier_name_tenant', ['supplier_name', 'tenant_id'], { unique: true })
@Index('IDX_supplier_code_tenant', ['supplier_code', 'tenant_id'], { unique: true })
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140 })
  supplier_name: string;

  @Column({ length: 140, nullable: true })
  supplier_code: string;

  @Column({ length: 20, default: 'Company' })
  supplier_type: string; // Company, Individual

  @Column({ length: 140, nullable: true })
  supplier_group: string;

  @Column({ length: 140, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  mobile_no: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 140, nullable: true })
  website: string;

  // Tax Details
  @Column({ length: 140, default: 'Ethiopia' })
  country: string;

  @Column({ length: 140, nullable: true })
  tax_id: string;

  @Column({ length: 140, nullable: true })
  tax_category: string;

  @Column({ length: 140, nullable: true })
  tax_withholding_category: string;

  @Column({ length: 140, nullable: true })
  gst_category: string; // For India

  @Column({ length: 140, nullable: true })
  pan: string; // For India

  @Column({ length: 140, nullable: true })
  gst_transporter_id: string;

  @Column({ length: 50, default: 'en' })
  print_language: string;

  // Financial Settings
  @Column({ length: 3, default: 'ETB' })
  default_currency: string;

  @Column({ length: 140, nullable: true })
  default_price_list: string;

  @Column({ length: 140, nullable: true })
  default_payment_terms_template: string;

  @Column({ length: 140, nullable: true })
  default_bank_account: string;

  @Column({ length: 140, nullable: true })
  default_payable_account: string;

  // Purchase Settings
  @Column({ default: false })
  allow_purchase_invoice_creation_without_purchase_order: boolean;

  @Column({ default: false })
  allow_purchase_invoice_creation_without_purchase_receipt: boolean;

  @Column({ default: false })
  warn_rfqs: boolean;

  @Column({ default: false })
  warn_pos: boolean;

  @Column({ default: false })
  prevent_rfqs: boolean;

  @Column({ default: false })
  prevent_pos: boolean;

  // Supplier Status and Blocking
  @Column({ default: false })
  disabled: boolean;

  @Column({ default: false })
  is_transporter: boolean;

  @Column({ default: false })
  is_internal_supplier: boolean;

  @Column({ length: 140, nullable: true })
  represents_company: string; // For internal suppliers

  @Column({ length: 20, nullable: true })
  hold_type: string; // All, Invoices, Payments

  @Column({ type: 'date', nullable: true })
  release_date: Date | null;

  @Column({ type: 'text', nullable: true })
  on_hold_reason: string;

  // Primary Address
  @Column({ length: 140, nullable: true })
  address_line1: string;

  @Column({ length: 140, nullable: true })
  address_line2: string;

  @Column({ length: 140, nullable: true })
  city: string;

  @Column({ length: 140, nullable: true })
  state: string;

  @Column({ length: 140, nullable: true })
  address_country: string;

  @Column({ length: 20, nullable: true })
  pincode: string;

  // Billing Address
  @Column({ length: 140, nullable: true })
  billing_address_line1: string;

  @Column({ length: 140, nullable: true })
  billing_address_line2: string;

  @Column({ length: 140, nullable: true })
  billing_city: string;

  @Column({ length: 140, nullable: true })
  billing_state: string;

  @Column({ length: 140, nullable: true })
  billing_country: string;

  @Column({ length: 20, nullable: true })
  billing_pincode: string;

  // Shipping Address
  @Column({ length: 140, nullable: true })
  shipping_address_line1: string;

  @Column({ length: 140, nullable: true })
  shipping_address_line2: string;

  @Column({ length: 140, nullable: true })
  shipping_city: string;

  @Column({ length: 140, nullable: true })
  shipping_state: string;

  @Column({ length: 140, nullable: true })
  shipping_country: string;

  @Column({ length: 20, nullable: true })
  shipping_pincode: string;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  description: string;

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

  @ManyToOne(() => SupplierGroup, { nullable: true })
  @JoinColumn({ name: 'supplier_group' })
  supplierGroup: SupplierGroup;
}