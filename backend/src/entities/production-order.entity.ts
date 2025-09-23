import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { WorkOrder } from './work-order.entity';
import { Tenant } from './tenant.entity';

export enum ProductionOrderStatus {
  DRAFT = 'draft',
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProductionOrderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('tabProductionOrder')
export class ProductionOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @Column()
  productName: string;

  @Column()
  productCode: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantityPlanned: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  quantityProduced: number;

  @Column()
  unit: string;

  @Column({
    type: 'enum',
    enum: ProductionOrderStatus,
    default: ProductionOrderStatus.DRAFT,
  })
  status: ProductionOrderStatus;

  @Column({
    type: 'enum',
    enum: ProductionOrderPriority,
    default: ProductionOrderPriority.MEDIUM,
  })
  priority: ProductionOrderPriority;

  @Column({ type: 'date' })
  plannedStartDate: Date;

  @Column({ type: 'date' })
  plannedEndDate: Date;

  @Column({ type: 'date', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  actualCost: number;

  // Relations
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User;

  @OneToMany(() => WorkOrder, (workOrder) => workOrder.productionOrder)
  workOrders: WorkOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Multi-tenant relationship
  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false })
  tenant_id: string;

  @Column({ default: 0 })
  docstatus: number;

  @Column({ length: 140, nullable: true })
  idx: string;

  @Column({ length: 140, nullable: true })
  owner: string;

  @Column({ length: 140, nullable: true })
  modified_by: string;
}