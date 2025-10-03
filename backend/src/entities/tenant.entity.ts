import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  SOFT_DELETED = 'soft_deleted',
  HARD_DELETED = 'hard_deleted',
}

export enum TenantPlan {
  BASIC = 'basic',
  STANDARD = 'standard',
  PROFESSIONAL = 'professional',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

// Import User after enum declarations to avoid circular dependency
import { User } from './user.entity';

@Entity('tabtenant')
export class Tenant {
  @Column({ primary: true, length: 36 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 100 })
  subdomain: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended', 'soft_deleted', 'hard_deleted'],
    default: 'active',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic',
  })
  plan: string;

  @Column({ type: 'longtext', nullable: true })
  settings: string;

  // Lifecycle Management Fields
  @Column({ type: 'int', default: 90, comment: 'Retention period in days for soft-deleted tenants' })
  retentionPeriodDays: number;

  @Column({ type: 'datetime', nullable: true, comment: 'When the tenant was soft deleted' })
  softDeletedAt: Date | null;

  @Column({ type: 'datetime', nullable: true, comment: 'When the tenant will be hard deleted' })
  hardDeleteScheduledAt: Date | null;

  @Column({ type: 'varchar', length: 140, nullable: true, comment: 'User who initiated the deletion' })
  deletedBy: string | null;

  @Column({ type: 'text', nullable: true, comment: 'Reason for deletion' })
  deletionReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: 0 })
  docstatus: number;

  @Column({ length: 140, nullable: true })
  idx: string;

  @Column({ length: 140, nullable: true })
  owner: string;

  @Column({ length: 140, nullable: true, name: 'modified_by' })
  modifiedBy: string;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  // Helper methods for lifecycle management
  isActive(): boolean {
    return this.status === TenantStatus.ACTIVE;
  }

  isSuspended(): boolean {
    return this.status === TenantStatus.SUSPENDED;
  }

  isSoftDeleted(): boolean {
    return this.status === TenantStatus.SOFT_DELETED;
  }

  isHardDeleted(): boolean {
    return this.status === TenantStatus.HARD_DELETED;
  }

  canBeReactivated(): boolean {
    return this.status === TenantStatus.SUSPENDED || this.status === TenantStatus.SOFT_DELETED;
  }

  getDaysUntilHardDeletion(): number | null {
    if (!this.hardDeleteScheduledAt) return null;
    const now = new Date();
    const diffTime = this.hardDeleteScheduledAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isEligibleForHardDeletion(): boolean {
    if (!this.hardDeleteScheduledAt) return false;
    return new Date() >= this.hardDeleteScheduledAt;
  }
}
