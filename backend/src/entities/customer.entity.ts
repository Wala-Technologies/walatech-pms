import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tabCustomer')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140, unique: true })
  customer_name: string;

  @Column({ length: 140, nullable: true })
  customer_code: string;

  @Column({ length: 20, default: 'Individual' })
  customer_type: string; // Individual, Company

  @Column({ length: 140, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  mobile_no: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 140, nullable: true })
  website: string;

  @Column({ length: 140, nullable: true })
  tax_id: string;

  @Column({ length: 3, default: 'ETB' })
  default_currency: string;

  @Column({ length: 140, nullable: true })
  default_price_list: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  credit_limit: number;

  @Column({ type: 'int', default: 0 })
  payment_terms: number; // Days

  @Column({ default: true })
  is_frozen: boolean;

  @Column({ default: false })
  disabled: boolean;

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
  country: string;

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

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  creation: Date;

  @UpdateDateColumn()
  modified: Date;

  @Column({ length: 140, nullable: true })
  modified_by: string;

  @Column({ length: 140, nullable: true })
  owner: string;

  @Column({ length: 36, nullable: true })
  tenant_id: string;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}