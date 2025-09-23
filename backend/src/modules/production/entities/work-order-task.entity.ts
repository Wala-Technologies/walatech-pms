import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WorkOrder } from './work-order.entity';
import { User } from '../../../entities/user.entity';
import { Tenant } from '../../../entities/tenant.entity';

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  FAILED = 'Failed'
}

export enum TaskType {
  SETUP = 'Setup',
  OPERATION = 'Operation',
  INSPECTION = 'Inspection',
  PACKAGING = 'Packaging',
  QUALITY_CHECK = 'Quality Check',
  MAINTENANCE = 'Maintenance',
  CLEANUP = 'Cleanup'
}

@Entity('work_order_tasks')
export class WorkOrderTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  taskNumber: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskType, default: TaskType.OPERATION })
  type: TaskType;

  @Column({ type: 'int', default: 1 })
  sequence: number; // Order of execution

  @Column({ type: 'varchar', length: 100, nullable: true })
  operation: string; // Operation name/code

  @Column({ type: 'varchar', length: 100, nullable: true })
  workstation: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  machine: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  estimatedHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualHours: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  hourRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  operatingCost: number;

  @Column({ type: 'datetime', nullable: true })
  plannedStartTime: Date;

  @Column({ type: 'datetime', nullable: true })
  plannedEndTime: Date;

  @Column({ type: 'datetime', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'datetime', nullable: true })
  actualEndTime: Date;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  completedQty: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  rejectedQty: number;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'text', nullable: true })
  qualityParameters: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  timeLog: any; // Array of time entries

  @Column({ type: 'json', nullable: true })
  qualityData: any; // Quality check results

  @Column({ type: 'json', nullable: true })
  metadata: any;

  // Relationships
  @ManyToOne(() => WorkOrder, workOrder => workOrder.tasks, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;

  @Column({ type: 'uuid' })
  workOrderId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User;

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'completed_by' })
  completedBy: User;

  @Column({ type: 'uuid', nullable: true })
  completedById: string;

  @Column({ name: 'tenant_id' })
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  // Computed properties
  get isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  get isInProgress(): boolean {
    return this.status === TaskStatus.IN_PROGRESS;
  }

  get isOverdue(): boolean {
    if (!this.plannedEndTime) return false;
    return new Date() > this.plannedEndTime && !this.isCompleted;
  }

  get duration(): number {
    if (!this.actualStartTime || !this.actualEndTime) return 0;
    return Math.round((this.actualEndTime.getTime() - this.actualStartTime.getTime()) / (1000 * 60 * 60 * 100)) / 100; // Hours with 2 decimal places
  }

  get efficiency(): number {
    if (this.estimatedHours === 0 || this.actualHours === 0) return 0;
    return Math.round((this.estimatedHours / this.actualHours) * 100);
  }

  get completionPercentage(): number {
    if (this.isCompleted) return 100;
    if (this.isInProgress) {
      // Calculate based on time elapsed if in progress
      if (this.actualStartTime && this.plannedEndTime) {
        const totalTime = this.plannedEndTime.getTime() - this.actualStartTime.getTime();
        const elapsedTime = new Date().getTime() - this.actualStartTime.getTime();
        return Math.min(99, Math.round((elapsedTime / totalTime) * 100));
      }
      return 50; // Default for in-progress tasks
    }
    return 0;
  }
}