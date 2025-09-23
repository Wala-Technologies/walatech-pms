import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Tenant } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';
import { ProductionPlanItem } from './production-plan-item.entity';
import { WorkOrder } from './work-order.entity';

export enum ProductionPlanStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

@Entity('production_plans')
export class ProductionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  planNumber: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProductionPlanStatus, default: ProductionPlanStatus.DRAFT })
  status: ProductionPlanStatus;

  @Column({ type: 'date' })
  planDate: Date;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  totalPlannedQty: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  totalProducedQty: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualCost: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  priority: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  // Relationships
  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: User;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @OneToMany(() => ProductionPlanItem, item => item.productionPlan, { cascade: true })
  items: ProductionPlanItem[];

  @OneToMany(() => WorkOrder, workOrder => workOrder.productionPlan)
  workOrders: WorkOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  approvedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;
}