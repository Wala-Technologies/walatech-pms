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
import { SalesInvoiceItem } from './sales-invoice-item.entity';
import { Department } from '../modules/hr/entities/department.entity';

export enum SalesInvoiceStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  PAID = 'Paid',
  PARTIALLY_PAID = 'Partially Paid',
  OVERDUE = 'Overdue',
  CANCELLED = 'Cancelled',
  RETURN = 'Return',
}

@Entity('sales_invoices')
@Index(['tenant_id', 'customer_id'])
@Index(['tenant_id', 'posting_date'])
@Index(['tenant_id', 'status'])
@Index(['tenant_id', 'due_date'])
export class SalesInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 140, unique: true })
  name: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 36, nullable: true })
  department_id: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  // Document Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  naming_series: string;

  @Column({ type: 'int', default: 0 })
  docstatus: number; // 0=Draft, 1=Submitted, 2=Cancelled

  // Customer Information
  @Column({ type: 'uuid' })
  customer_id: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'text', nullable: true })
  customer_name: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  tax_id: string;

  // Company Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  company: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  company_tax_id: string;

  // Date Information
  @Column({ type: 'date' })
  posting_date: Date;

  @Column({ type: 'time', nullable: true })
  posting_time: string;

  @Column({ type: 'boolean', default: false })
  set_posting_time: boolean;

  @Column({ type: 'date', nullable: true })
  due_date: Date;

  // POS Information
  @Column({ type: 'boolean', default: false })
  is_pos: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  pos_profile: string;

  @Column({ type: 'boolean', default: false })
  is_consolidated: boolean;

  // Return Information
  @Column({ type: 'boolean', default: false })
  is_return: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  return_against: string;

  @Column({ type: 'boolean', default: true })
  update_outstanding_for_self: boolean;

  @Column({ type: 'boolean', default: false })
  update_billed_amount_in_sales_order: boolean;

  @Column({ type: 'boolean', default: true })
  update_billed_amount_in_delivery_note: boolean;

  @Column({ type: 'boolean', default: false })
  is_debit_note: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  amended_from: string;

  // Financial Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  cost_center: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  project: string;

  @Column({ type: 'varchar', length: 140, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 1.0 })
  conversion_rate: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  selling_price_list: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  price_list_currency: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 1.0 })
  plc_conversion_rate: number;

  @Column({ type: 'boolean', default: false })
  ignore_pricing_rule: boolean;

  // Stock Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  scan_barcode: string;

  @Column({ type: 'boolean', default: false })
  update_stock: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  set_warehouse: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  set_target_warehouse: string;

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

  @Column({ type: 'text', nullable: true })
  base_in_words: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  grand_total: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  rounding_adjustment: number;

  @Column({ type: 'boolean', default: false })
  use_company_roundoff_cost_center: boolean;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  rounded_total: number;

  @Column({ type: 'text', nullable: true })
  in_words: string;

  // Payment Information
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  total_advance: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  outstanding_amount: number;

  @Column({ type: 'boolean', default: false })
  disable_rounded_total: boolean;

  // Discount Information
  @Column({ type: 'varchar', length: 15, default: 'Grand Total' })
  apply_discount_on: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_discount_amount: number;

  @Column({ type: 'boolean', default: false })
  is_cash_or_non_trade_discount: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  additional_discount_account: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  additional_discount_percentage: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  discount_amount: number;

  @Column({ type: 'longtext', nullable: true })
  other_charges_calculation: string;

  // Billing Information
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  total_billing_hours: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  total_billing_amount: number;

  // Cash/Bank Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  cash_bank_account: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_paid_amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  paid_amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_change_amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  change_amount: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  account_for_change_amount: string;

  // Advance Allocation
  @Column({ type: 'boolean', default: false })
  allocate_advances_automatically: boolean;

  @Column({ type: 'boolean', default: false })
  only_include_allocated_payments: boolean;

  // Write-off Information
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  write_off_amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_write_off_amount: number;

  @Column({ type: 'boolean', default: false })
  write_off_outstanding_amount_automatically: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  write_off_account: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  write_off_cost_center: string;

  // Loyalty Program
  @Column({ type: 'boolean', default: false })
  redeem_loyalty_points: boolean;

  @Column({ type: 'int', default: 0 })
  loyalty_points: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  loyalty_amount: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  loyalty_program: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  loyalty_redemption_account: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  loyalty_redemption_cost_center: string;

  // Address Information
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
  territory: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  shipping_address_name: string;

  @Column({ type: 'text', nullable: true })
  shipping_address: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  dispatch_address_name: string;

  @Column({ type: 'text', nullable: true })
  dispatch_address: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  company_address: string;

  @Column({ type: 'text', nullable: true })
  company_address_display: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  company_contact_person: string;

  // Payment Terms
  @Column({ type: 'boolean', default: false })
  ignore_default_payment_terms_template: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  payment_terms_template: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  tc_name: string;

  @Column({ type: 'longtext', nullable: true })
  terms: string;

  // Purchase Order Reference
  @Column({ type: 'varchar', length: 140, nullable: true })
  po_no: string;

  @Column({ type: 'date', nullable: true })
  po_date: Date;

  // Accounting Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  debit_to: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  party_account_currency: string;

  @Column({ type: 'varchar', length: 4, default: 'No' })
  is_opening: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  unrealized_profit_loss_account: string;

  @Column({ type: 'text', nullable: true })
  against_income_account: string;

  // Sales Partner Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  sales_partner: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  amount_eligible_for_commission: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  commission_rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  total_commission: number;

  // Print and Display
  @Column({ type: 'varchar', length: 140, nullable: true })
  letter_head: string;

  @Column({ type: 'boolean', default: false })
  group_same_items: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  select_print_heading: string;

  @Column({ type: 'varchar', length: 6, nullable: true })
  language: string;

  // Subscription Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  subscription: string;

  @Column({ type: 'date', nullable: true })
  from_date: Date;

  @Column({ type: 'varchar', length: 140, nullable: true })
  auto_repeat: string;

  @Column({ type: 'date', nullable: true })
  to_date: Date;

  // Status and Workflow
  @Column({
    type: 'enum',
    enum: SalesInvoiceStatus,
    default: SalesInvoiceStatus.DRAFT,
  })
  status: SalesInvoiceStatus;

  @Column({ type: 'varchar', length: 140, nullable: true })
  inter_company_invoice_reference: string;

  // Marketing Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  campaign: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  represents_company: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  source: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  customer_group: string;

  @Column({ type: 'boolean', default: false })
  is_internal_customer: boolean;

  @Column({ type: 'boolean', default: false })
  is_discounted: boolean;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'text', nullable: true })
  user_tags: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'text', nullable: true })
  assign: string;

  @Column({ type: 'text', nullable: true })
  liked_by: string;

  @Column({ type: 'text', nullable: true })
  seen: string;

  // Relationships
  @OneToMany(() => SalesInvoiceItem, (item) => item.sales_invoice, {
    cascade: true,
  })
  items: SalesInvoiceItem[];

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