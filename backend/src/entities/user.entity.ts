import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Department } from '../modules/hr/entities/department.entity';
import { Role } from '../modules/users/entities/role.entity';
import { UserRole } from '../common/enums/user-roles.enum';

@Entity('tabuser')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 140 })
  email: string;

  @Column({ length: 140 })
  first_name: string;

  @Column({ length: 140, nullable: true })
  last_name: string;

  @Column({ length: 255 })
  password: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ length: 10, default: 'en' })
  language: string;

  @Column({ length: 50, default: 'Africa/Addis_Ababa' })
  time_zone: string;

  @Column({ length: 140, nullable: true })
  mobile_no: string;

  @Column({ length: 140, nullable: true })
  role_profile_name: string;

  @Column({ 
    type: 'enum', 
    enum: UserRole, 
    default: UserRole.REGULAR_USER 
  })
  role: UserRole;

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

  @Column({ length: 36, nullable: true })
  department_id: string | null;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;
}