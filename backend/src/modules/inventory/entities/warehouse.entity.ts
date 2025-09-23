import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Tenant } from '../../../entities/tenant.entity';
import { Bin } from './bin.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  contact_person: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false })
  tenant_id: string;

  @OneToMany(() => Bin, bin => bin.warehouse)
  bins: Bin[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}