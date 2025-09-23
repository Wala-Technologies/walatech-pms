import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductionPlan } from './production-plan.entity';
import { Item } from '../../../entities/item.entity';
import { Tenant } from '../../../entities/tenant.entity';

@Entity('production_plan_items')
export class ProductionPlanItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  itemCode: string;

  @Column({ type: 'varchar', length: 200 })
  itemName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 3 })
  plannedQty: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  producedQty: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  pendingQty: number;

  @Column({ type: 'varchar', length: 50 })
  uom: string; // Unit of Measurement

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCost: number;

  @Column({ type: 'date', nullable: true })
  requiredDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bomReference: string; // Bill of Materials reference

  @Column({ type: 'varchar', length: 100, nullable: true })
  warehouse: string;

  @Column({ type: 'json', nullable: true })
  specifications: any;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  // Relationships
  @ManyToOne(() => ProductionPlan, plan => plan.items, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'production_plan_id' })
  productionPlan: ProductionPlan;

  @Column({ type: 'uuid' })
  productionPlanId: string;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'uuid', nullable: true })
  itemId: string;

  @Column({ name: 'tenant_id' })
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get completionPercentage(): number {
    if (this.plannedQty === 0) return 0;
    return Math.round((this.producedQty / this.plannedQty) * 100);
  }

  get isCompleted(): boolean {
    return this.producedQty >= this.plannedQty;
  }

  get remainingQty(): number {
    return Math.max(0, this.plannedQty - this.producedQty);
  }
}