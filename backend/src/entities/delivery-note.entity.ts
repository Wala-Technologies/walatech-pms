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
import { DeliveryNoteItem } from './delivery-note-item.entity';
import { Department } from '../modules/hr/entities/department.entity';

export enum DeliveryNoteStatus {
  DRAFT = 'Draft',
  TO_BILL = 'To Bill',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  CLOSED = 'Closed',
  RETURN_ISSUED = 'Return Issued',
}

@Entity('tabDelivery Note')
@Index(['tenant_id', 'posting_date'])
@Index(['tenant_id', 'customer_id'])
@Index(['tenant_id', 'status'])
export class DeliveryNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 140, unique: true })
  name: string;

  // Document Information
  @Column({ type: 'varchar', length: 140, default: '{customer_name}' })
  title: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  naming_series: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  amended_from: string;

  // Customer Information
  @Column({ type: 'varchar', length: 140 })
  customer_id: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  tax_id: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  customer_name: string;

  // Company Information
  @Column({ type: 'varchar', length: 140 })
  company: string;

  // Date and Time
  @Column({ type: 'date' })
  posting_date: Date;

  @Column({ type: 'time', nullable: true })
  posting_time: string;

  @Column({ type: 'boolean', default: false })
  set_posting_time: boolean;

  // Return Information
  @Column({ type: 'boolean', default: false })
  is_return: boolean;

  @Column({ type: 'boolean', default: false })
  issue_credit_note: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  return_against: string;

  // Project and Cost Center
  @Column({ type: 'varchar', length: 140, nullable: true })
  cost_center: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  project: string;

  // Currency and Pricing
  @Column({ type: 'varchar', length: 140, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 1 })
  conversion_rate: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  selling_price_list: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  price_list_currency: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 1 })
  plc_conversion_rate: number;

  @Column({ type: 'boolean', default: false })
  ignore_pricing_rule: boolean;

  // Warehouse Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  scan_barcode: string;

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

  @Column({ type: 'varchar', length: 240, nullable: true })
  base_in_words: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  grand_total: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  rounding_adjustment: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  rounded_total: number;

  @Column({ type: 'varchar', length: 240, nullable: true })
  in_words: string;

  @Column({ type: 'boolean', default: false })
  disable_rounded_total: boolean;

  // Discount Information
  @Column({ type: 'varchar', length: 140, default: 'Grand Total' })
  apply_discount_on: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  base_discount_amount: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  additional_discount_percentage: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  discount_amount: number;

  @Column({ type: 'text', nullable: true })
  other_charges_calculation: string;

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

  // Terms and Conditions
  @Column({ type: 'varchar', length: 140, nullable: true })
  tc_name: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

  // Status and Progress
  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  per_billed: number;

  @Column({
    type: 'enum',
    enum: DeliveryNoteStatus,
    default: DeliveryNoteStatus.DRAFT,
  })
  status: DeliveryNoteStatus;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  per_installed: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  installation_status: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  per_returned: number;

  // Transportation Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  transporter: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  driver: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  lr_no: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  vehicle_no: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  transporter_name: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  driver_name: string;

  @Column({ type: 'date', nullable: true })
  lr_date: Date;

  // Purchase Order Reference
  @Column({ type: 'text', nullable: true })
  po_no: string;

  @Column({ type: 'date', nullable: true })
  po_date: Date;

  // Sales Partner Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  sales_partner: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  amount_eligible_for_commission: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  commission_rate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  total_commission: number;

  // Auto Repeat
  @Column({ type: 'varchar', length: 140, nullable: true })
  auto_repeat: string;

  // Print Settings
  @Column({ type: 'varchar', length: 140, nullable: true })
  letter_head: string;

  @Column({ type: 'boolean', default: false })
  print_without_amount: boolean;

  @Column({ type: 'boolean', default: false })
  group_same_items: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  select_print_heading: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  language: string;

  // Internal Customer
  @Column({ type: 'boolean', default: false })
  is_internal_customer: boolean;

  @Column({ type: 'varchar', length: 140, nullable: true })
  represents_company: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  inter_company_reference: string;

  // Customer Classification
  @Column({ type: 'varchar', length: 140, nullable: true })
  customer_group: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  territory: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  source: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  campaign: string;

  // Additional Information
  @Column({ type: 'varchar', length: 140, nullable: true })
  excise_page: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

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

  // User Tags and Comments
  @Column({ type: 'text', nullable: true })
  _user_tags: string;

  @Column({ type: 'text', nullable: true })
  _comments: string;

  @Column({ type: 'text', nullable: true })
  _assign: string;

  @Column({ type: 'text', nullable: true })
  _liked_by: string;

  @Column({ type: 'text', nullable: true })
  _seen: string;

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
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => DeliveryNoteItem, (item) => item.delivery_note, {
    cascade: true,
    eager: false,
  })
  items: DeliveryNoteItem[];
}