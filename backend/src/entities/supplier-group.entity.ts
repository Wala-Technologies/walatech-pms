import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Supplier } from './supplier.entity';

@Entity('tabSupplierGroup')
@Index('IDX_supplier_group_name_tenant', ['supplier_group_name', 'tenant_id'], { unique: true })
export class SupplierGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140 })
  supplier_group_name: string;

  @Column({ length: 140, nullable: true })
  parent_supplier_group: string | null;

  @Column({ default: false })
  is_group: boolean;

  @Column({ length: 140, nullable: true })
  default_payment_terms_template: string;

  @Column({ length: 140, nullable: true })
  default_price_list: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  disabled: boolean;

  // System Fields
  @CreateDateColumn()
  creation: Date;

  @UpdateDateColumn()
  modified: Date;

  @Column({ length: 140, nullable: true })
  modified_by: string;

  @Column({ length: 140, nullable: true })
  owner: string;

  @Column({ length: 36, nullable: false })
  tenant_id: string;

  // Relationships
  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => Supplier, supplier => supplier.supplierGroup)
  suppliers: Supplier[];

  @ManyToOne(() => SupplierGroup, { nullable: true })
  @JoinColumn({ name: 'parent_supplier_group' })
  parentGroup: SupplierGroup;

  @OneToMany(() => SupplierGroup, group => group.parentGroup)
  childGroups: SupplierGroup[];
}