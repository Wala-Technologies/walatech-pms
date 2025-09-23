import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
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

@Entity('tabTenant')
export class Tenant {
  @Column({ primary: true, length: 36 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 100 })
  subdomain: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
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
}