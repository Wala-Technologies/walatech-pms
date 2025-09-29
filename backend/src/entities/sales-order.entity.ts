import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, BeforeInsert } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Customer } from './customer.entity';
import { SalesOrderItem } from './sales-order-item.entity';
import { Department } from '../modules/hr/entities/department.entity';

export enum SalesOrderStatus {
  DRAFT = 'Draft',
  ON_HOLD = 'On Hold',
  TO_DELIVER_AND_BILL = 'To Deliver and Bill',
  TO_BILL = 'To Bill',
  TO_DELIVER = 'To Deliver',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  CLOSED = 'Closed',
}

export enum OrderType {
  SALES = 'Sales',
  MAINTENANCE = 'Maintenance',
  SHOPPING_CART = 'Shopping Cart',
}

@Entity('tabSales Order')
export class SalesOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140, unique: true })
  name: string; // Auto-generated: SO-YYYY-MMDD-####

  @Column({ length: 140 })
  customer_id: string;

  @Column({ length: 140 })
  customer_name: string;

  @Column({ type: 'date' })
  transaction_date: Date;

  @Column({ type: 'date' })
  delivery_date: Date;

  @Column({ 
    type: 'enum', 
    enum: OrderType, 
    default: OrderType.SALES 
  })
  order_type: OrderType;

  @Column({ 
    type: 'enum', 
    enum: SalesOrderStatus, 
    default: SalesOrderStatus.DRAFT 
  })
  status: SalesOrderStatus;

  @Column({ length: 3, default: 'ETB' })
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 1.0 })
  conversion_rate: number;

  @Column({ length: 140, nullable: true })
  selling_price_list: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  total_qty: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  base_total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  base_net_total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_taxes_and_charges: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  base_grand_total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  grand_total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  advance_paid: number;

  @Column({ length: 140, nullable: true })
  customer_po_no: string;

  @Column({ type: 'date', nullable: true })
  customer_po_date: Date;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ length: 140, nullable: true })
  territory: string;

  @Column({ length: 140, nullable: true })
  sales_person: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  commission_rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_commission: number;

  @Column({ default: 0 })
  docstatus: number; // 0: Draft, 1: Submitted, 2: Cancelled

  @Column({ default: false })
  is_return: boolean;

  @Column({ default: false })
  skip_delivery_note: boolean;

  @Column({ length: 140, nullable: true })
  company_address: string;

  @Column({ length: 140, nullable: true })
  customer_address: string;

  @Column({ length: 140, nullable: true })
  shipping_address: string;

  @Column({ length: 140, nullable: true })
  contact_person: string;

  @Column({ length: 140, nullable: true })
  contact_email: string;

  @Column({ length: 20, nullable: true })
  contact_mobile: string;

  // Tenant relationship
  @Column()
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Department relationship
  @Column({ length: 36, nullable: true })
  department_id: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  // Customer relationship
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  // Sales Order Items relationship
  @OneToMany(() => SalesOrderItem, (item) => item.sales_order, { cascade: true })
  items: SalesOrderItem[];

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

  @BeforeInsert()
  generateName() {
    if (!this.name) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      this.name = `SO-${year}-${month}${day}-${random}`;
    }
  }
}