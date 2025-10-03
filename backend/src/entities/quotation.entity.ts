import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Customer } from './customer.entity';
import { QuotationItem } from './quotation-item.entity';
import { Department } from '../modules/hr/entities/department.entity';

@Entity('tabQuotation')
@Index(['tenant_id', 'party_name'])
@Index(['tenant_id', 'transaction_date'])
@Index(['tenant_id', 'status'])
export class Quotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 140, unique: true })
  name: string;

  // Document Information
  @Column({ type: 'varchar', length: 140, default: '{customer_name}' })
  title: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  naming_series: string;

  @Column({ type: 'varchar', length: 140, default: 'Customer' })
  quotation_to: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  party_name: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  customer_name: string;

  @Column({ type: 'date', nullable: true })
  transaction_date: Date;

  @Column({ type: 'date', nullable: true })
  valid_till: Date;

  @Column({ type: 'varchar', length: 140, default: 'Sales' })
  order_type: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  company: string;

  @Column({ type: 'boolean', default: false })
  has_unit_price_items: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  amended_from: string;

  // Currency and Pricing
  @Column({ type: 'varchar', length: 140, nullable: true })
  currency: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  conversion_rate: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  selling_price_list: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  price_list_currency: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  plc_conversion_rate: number;

  @Column({ type: 'boolean', default: false })
  ignore_pricing_rule: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  scan_barcode: string;

  // Totals
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  total_qty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  total_net_weight: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_total: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_net_total: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  total: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  net_total: number;

  // Tax Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  tax_category: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  taxes_and_charges: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  shipping_rule: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  incoterm: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  named_place: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_total_taxes_and_charges: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  total_taxes_and_charges: number;

  // Grand Total
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_grand_total: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_rounding_adjustment: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_rounded_total: number;

  @Column({ type: 'varchar', length: 240, nullable: true })
  base_in_words: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  grand_total: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  rounding_adjustment: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  rounded_total: number;

  @Column({ type: 'boolean', default: false })
  disable_rounded_total: boolean;

  @Column({ type: 'varchar', length: 240, nullable: true })
  in_words: string;

  // Discount Information
  @Column({ type: 'varchar', length: 140, default: 'Grand Total' })
  apply_discount_on: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_discount_amount: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  coupon_code: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  additional_discount_percentage: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  discount_amount: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  referral_sales_partner: string;

  @Column({ type: 'text', nullable: true })
  other_charges_calculation: string;

  // Address and Contact Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  customer_address: string;

  @Column({ type: 'text', nullable: true })
  address_display: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  contact_person: string;

  @Column({ type: 'text', nullable: true })
  contact_display: string;

  @Column({ type: 'text', nullable: true })
  contact_mobile: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  contact_email: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  shipping_address_name: string;

  @Column({ type: 'text', nullable: true })
  shipping_address: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  company_address: string;

  @Column({ type: 'text', nullable: true })
  company_address_display: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  company_contact_person: string;

  // Terms and Conditions
  @Column({ type: 'varchar', length: 140, nullable: true })
  payment_terms_template: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  tc_name: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  auto_repeat: string;

  // Print Settings
  @Column({ type: 'varchar', length: 140, nullable: true })
  letter_head: string;

  @Column({ type: 'boolean', default: false })
  group_same_items: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  select_print_heading: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  language: string;

  // Status and Lost Reason
  @Column({ type: 'text', nullable: true })
  order_lost_reason: string;

  @Column({ type: 'varchar', length: 140, default: 'Draft' })
  status: string;

  // Customer Classification
  @Column({ type: 'varchar', length: 140, nullable: true })
  customer_group: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  territory: string;

  // Marketing Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  campaign: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  source: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  opportunity: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  supplier_quotation: string;

  @Column({ type: 'text', nullable: true })
  enq_det: string;

  // Standard ERPNext Fields
  @Column({ type: 'text', nullable: true })
  _user_tags: string;

  @Column({ type: 'text', nullable: true })
  _comments: string;

  @Column({ type: 'text', nullable: true })
  _assign: string;

  @Column({ type: 'text', nullable: true })
  _liked_by: string;

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

  @Column({ length: 36, nullable: true })
  department_id: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'party_name', referencedColumnName: 'customer_id' })
  customer_rel: Customer;

  @OneToMany(() => QuotationItem, (item) => item.quotation, {
    cascade: true,
    eager: false,
  })
  items: QuotationItem[];
}