import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { Item } from '../../../entities/item.entity';

@Entity('bins')
export class Bin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  itemCode: string;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'itemCode', referencedColumnName: 'code' })
  item: Item;

  @ManyToOne(() => Warehouse, warehouse => warehouse.bins, { nullable: false })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ nullable: false })
  warehouse_id: string;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  actualQty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  reservedQty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  orderedQty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  indentedQty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  plannedQty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  projectedQty: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  valuationRate: number;

  @Column({ type: 'decimal', precision: 21, scale: 9, default: 0 })
  stockValue: number;

  @Column({ nullable: true })
  stockUom: string;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ nullable: false })
  tenant_id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Method to calculate projected quantity
  updateProjectedQty(): void {
    this.projectedQty = this.actualQty + this.orderedQty + this.plannedQty - this.reservedQty - this.indentedQty;
  }

  // Method to update stock value
  updateStockValue(): void {
    this.stockValue = this.actualQty * this.valuationRate;
  }
}