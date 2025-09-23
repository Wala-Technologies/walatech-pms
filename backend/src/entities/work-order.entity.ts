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
import { ProductionOrder } from './production-order.entity';
import { WorkOrderTask } from './work-order-task.entity';
import { Tenant } from './tenant.entity';

export enum WorkOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

export enum WorkOrderType {
  MANUFACTURING = 'manufacturing',
  ASSEMBLY = 'assembly',
  PACKAGING = 'packaging',
  QUALITY_CHECK = 'quality_check',
  MAINTENANCE = 'maintenance',
}

@Entity('tabWorkOrder')
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  workOrderNumber: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: WorkOrderType,
    default: WorkOrderType.MANUFACTURING,
  })
  type: WorkOrderType;

  @Column({
    type: 'enum',
    enum: WorkOrderStatus,
    default: WorkOrderStatus.PENDING,
  })
  status: WorkOrderStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  quantityRequired: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  quantityCompleted: number;

  @Column()
  unit: string;

  @Column({ type: 'datetime' })
  scheduledStartTime: Date;

  @Column({ type: 'datetime' })
  scheduledEndTime: Date;

  @Column({ type: 'datetime', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'datetime', nullable: true })
  actualEndTime: Date;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  estimatedHours: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  actualHours: number;

  @Column({ nullable: true })
  workstation: string;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  // Relations
  @ManyToOne(() => ProductionOrder, (productionOrder) => productionOrder.workOrders, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'production_order_id' })
  productionOrder: ProductionOrder;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User;

  @OneToMany(() => WorkOrderTask, (task) => task.workOrder)
  tasks: WorkOrderTask[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Multi-tenant relationship
  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ default: 0 })
  docstatus: number;

  @Column({ length: 140, nullable: true })
  idx: string;

  @Column({ length: 140, nullable: true })
  owner: string;

  @Column({ length: 140, nullable: true })
  modified_by: string;
}