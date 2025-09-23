import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { WorkOrder } from './work-order.entity';
import { Tenant } from './tenant.entity';

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  FAILED = 'Failed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('tabWorkOrderTask')
export class WorkOrderTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  taskName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column('int')
  sequenceOrder: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  estimatedHours: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  actualHours: number;

  @Column({ type: 'datetime', nullable: true })
  scheduledStartTime: Date;

  @Column({ type: 'datetime', nullable: true })
  scheduledEndTime: Date;

  @Column({ type: 'datetime', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'datetime', nullable: true })
  actualEndTime: Date;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  completionNotes: string;

  @Column({ nullable: true })
  requiredSkills: string;

  @Column({ nullable: true })
  toolsRequired: string;

  @Column({ nullable: true })
  materialsRequired: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  actualCost: number;

  // Relations
  @ManyToOne(() => WorkOrder, (workOrder) => workOrder.tasks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User;

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