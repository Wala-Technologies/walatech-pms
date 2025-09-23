import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Tenant } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';
import { ProductionPlan } from './production-plan.entity';
import { WorkOrderTask } from './work-order-task.entity';
import { Item } from '../../../entities/item.entity';

export enum WorkOrderStatus {
  DRAFT = 'Draft',
  RELEASED = 'Released',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  CLOSED = 'Closed'
}

export enum WorkOrderPriority {
  LOW = 'Low',
  NORMAL = 'Normal',
  HIGH = 'High',
  URGENT = 'Urgent'
}

@Entity('work_orders')
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  workOrderNumber: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: WorkOrderStatus, default: WorkOrderStatus.DRAFT })
  status: WorkOrderStatus;

  @Column({ type: 'enum', enum: WorkOrderPriority, default: WorkOrderPriority.NORMAL })
  priority: WorkOrderPriority;

  @Column({ type: 'varchar', length: 100 })
  productionItem: string;

  @Column({ type: 'varchar', length: 200 })
  itemName: string;

  @Column({ type: 'decimal', precision: 15, scale: 3 })
  qty: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  producedQty: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  rejectedQty: number;

  @Column({ type: 'varchar', length: 50 })
  stockUom: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bomNo: string; // Bill of Materials Number

  @Column({ type: 'varchar', length: 100, nullable: true })
  salesOrder: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  project: string;

  // Warehouse Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  sourceWarehouse: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  wipWarehouse: string; // Work in Progress warehouse

  @Column({ type: 'varchar', length: 100, nullable: true })
  fgWarehouse: string; // Finished Goods warehouse

  @Column({ type: 'varchar', length: 100, nullable: true })
  scrapWarehouse: string;

  // Dates
  @Column({ type: 'datetime', nullable: true })
  plannedStartDate: Date;

  @Column({ type: 'datetime', nullable: true })
  plannedEndDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ type: 'datetime', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'datetime', nullable: true })
  actualEndDate: Date;

  // Cost Information
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  plannedOperatingCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualOperatingCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  materialCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCost: number;

  // Flags
  @Column({ type: 'boolean', default: false })
  allowAlternativeItem: boolean;

  @Column({ type: 'boolean', default: true })
  useMultiLevelBom: boolean;

  @Column({ type: 'boolean', default: false })
  skipTransfer: boolean;

  @Column({ type: 'boolean', default: false })
  hasSerialNo: boolean;

  @Column({ type: 'boolean', default: false })
  hasBatchNo: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  batchSize: number;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  // Relationships
  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @ManyToOne(() => ProductionPlan, plan => plan.workOrders, { nullable: true })
  @JoinColumn({ name: 'production_plan_id' })
  productionPlan: ProductionPlan;

  @Column({ type: 'uuid', nullable: true })
  productionPlanId: string;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'uuid', nullable: true })
  itemId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User;

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string;

  @OneToMany(() => WorkOrderTask, task => task.workOrder, { cascade: true })
  tasks: WorkOrderTask[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get completionPercentage(): number {
    if (this.qty === 0) return 0;
    return Math.round((this.producedQty / this.qty) * 100);
  }

  get isCompleted(): boolean {
    return this.status === WorkOrderStatus.COMPLETED;
  }

  get remainingQty(): number {
    return Math.max(0, this.qty - this.producedQty);
  }

  get isOverdue(): boolean {
    if (!this.plannedEndDate) return false;
    return new Date() > this.plannedEndDate && !this.isCompleted;
  }

  get leadTime(): number {
    if (!this.plannedStartDate || !this.plannedEndDate) return 0;
    return Math.ceil((this.plannedEndDate.getTime() - this.plannedStartDate.getTime()) / (1000 * 60 * 60 * 24));
  }
}