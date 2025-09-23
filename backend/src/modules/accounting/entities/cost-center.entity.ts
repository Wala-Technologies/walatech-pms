import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../../entities/tenant.entity';

@Entity('acc_cost_centers')
export class CostCenter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 140 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'boolean', default: false })
  isGroup: boolean;

  @Column({ type: 'uuid', nullable: true })
  parentCostCenterId?: string;

  @Column({ length: 140 })
  company: string;

  @Column({ type: 'boolean', default: false })
  disabled: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}