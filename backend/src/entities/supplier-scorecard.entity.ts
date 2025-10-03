import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Supplier } from './supplier.entity';

@Entity('tabSupplierScorecard')
export class SupplierScorecard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140 })
  supplier_id: string;

  @Column({ length: 20, default: 'Monthly' })
  period: string; // Weekly, Monthly, Yearly

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  current_score: number;

  @Column({ type: 'text', nullable: true })
  scoring_formula: string;

  @Column({ length: 140, nullable: true })
  supplier_standing: string;

  @Column({ default: false })
  warn_rfqs: boolean;

  @Column({ default: false })
  warn_pos: boolean;

  @Column({ default: false })
  prevent_rfqs: boolean;

  @Column({ default: false })
  prevent_pos: boolean;

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

  @ManyToOne(() => Supplier, { nullable: false })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => SupplierScorecardCriteria, criteria => criteria.scorecard)
  criteria: SupplierScorecardCriteria[];

  @OneToMany(() => SupplierScorecardPeriod, period => period.scorecard)
  periods: SupplierScorecardPeriod[];
}

@Entity('tabSupplierScorecardCriteria')
export class SupplierScorecardCriteria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140 })
  scorecard_id: string;

  @Column({ length: 140 })
  criteria_name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number; // Should add up to 100

  @Column({ type: 'text' })
  formula: string;

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

  @ManyToOne(() => SupplierScorecard, scorecard => scorecard.criteria)
  @JoinColumn({ name: 'scorecard_id' })
  scorecard: SupplierScorecard;
}

@Entity('tabSupplierScorecardPeriod')
export class SupplierScorecardPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140 })
  scorecard_id: string;

  @Column({ type: 'date' })
  period_start: Date;

  @Column({ type: 'date' })
  period_end: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  period_score: number;

  @Column({ type: 'json', nullable: true })
  criteria_scores: Record<string, number>;

  @Column({ type: 'json', nullable: true })
  variables: Record<string, number>;

  @Column({ default: false })
  is_evaluated: boolean;

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

  @ManyToOne(() => SupplierScorecard, scorecard => scorecard.periods)
  @JoinColumn({ name: 'scorecard_id' })
  scorecard: SupplierScorecard;
}