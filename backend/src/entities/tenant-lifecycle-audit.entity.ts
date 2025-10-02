import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { TenantStatus } from './tenant.entity';

export enum TenantLifecycleAction {
  SOFT_DELETE = 'soft_delete',
  HARD_DELETE = 'hard_delete',
  RESTORE = 'restore',
  SCHEDULE_DELETION = 'schedule_deletion',
  CANCEL_DELETION = 'cancel_deletion',
  UPDATE_RETENTION_PERIOD = 'update_retention_period'
}

@Entity('tabTenantLifecycleAudit')
@Index('idx_tenant_lifecycle_tenant_id', ['tenant_id'])
@Index('idx_tenant_lifecycle_action', ['action'])
@Index('idx_tenant_lifecycle_created_at', ['createdAt'])
@Index('idx_tenant_lifecycle_scheduled_at', ['scheduledAt'])
export class TenantLifecycleAudit {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 36, name: 'tenant_id' })
  tenant_id: string;

  @Column({
    type: 'enum',
    enum: TenantLifecycleAction,
    nullable: false
  })
  action: TenantLifecycleAction;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    nullable: true,
    name: 'previousStatus'
  })
  previousStatus?: TenantStatus;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    nullable: false,
    name: 'newStatus'
  })
  newStatus: TenantStatus;

  @Column('varchar', { length: 140, name: 'performedBy' })
  performedBy: string;

  @Column('text', { nullable: true })
  reason?: string;

  @Column('json', { nullable: true })
  metadata?: any;

  @Column('datetime', { nullable: true, name: 'scheduledAt' })
  scheduledAt?: Date;

  @CreateDateColumn({ type: 'datetime', precision: 6, name: 'createdAt' })
  createdAt: Date;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}