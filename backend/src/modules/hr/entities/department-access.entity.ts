import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';
import { Department } from './department.entity';

export enum AccessType {
  READ = 'READ',
  WRITE = 'WRITE',
  ADMIN = 'ADMIN'
}

@Entity('tabDepartmentAccess')
@Index(['user_id', 'department_id'], { unique: true })
@Index(['tenant_id', 'user_id'])
export class DepartmentAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36 })
  user_id: string;

  @Column({ length: 36 })
  department_id: string;

  @Column({
    type: 'enum',
    enum: AccessType,
    default: AccessType.READ
  })
  access_type: AccessType;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'date', nullable: true })
  valid_from: Date;

  @Column({ type: 'date', nullable: true })
  valid_to: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  creation: Date;

  @UpdateDateColumn()
  modified: Date;

  @Column({ length: 140, nullable: true })
  modified_by: string;

  @Column({ length: 140, nullable: true })
  owner: string;

  @Column({ length: 36, nullable: true })
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;
}