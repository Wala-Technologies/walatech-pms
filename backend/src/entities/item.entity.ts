import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
import { Department } from '../modules/hr/entities/department.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['Raw Material', 'Semi Finished', 'Finished Good', 'Service', 'Template'], default: 'Raw Material' })
  type: string;

  @Column({ type: 'enum', enum: ['Active', 'Inactive', 'Discontinued'], default: 'Active' })
  status: string;

  @Column({ nullable: true })
  stockUom: string;

  @Column({ nullable: true })
  purchaseUom: string;

  @Column({ nullable: true })
  salesUom: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  standardRate: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  lastPurchaseRate: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  valuationRate: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  valuationMethod: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  standardSellingRate: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  minOrderQty: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  safetyStock: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  leadTimeDays: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  maxDiscount: number;

  @Column({ type: 'boolean', default: true })
  isMaintainStock: boolean;

  @Column({ type: 'boolean', default: false })
  isStockItem: boolean;

  @Column({ type: 'boolean', default: false })
  isFixedAsset: boolean;

  @Column({ type: 'boolean', default: false })
  autoCreateAssets: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  assetCategory: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  assetNamingSeries: string;

  @Column({ type: 'boolean', default: true })
  allowNegativeStock: boolean;

  @Column({ type: 'boolean', default: false })
  allowAlternativeItem: boolean;

  @Column({ type: 'boolean', default: false })
  hasBatchNo: boolean;

  @Column({ type: 'boolean', default: false })
  hasSerialNo: boolean;

  @Column({ type: 'boolean', default: false })
  hasExpiryDate: boolean;

  @Column({ type: 'boolean', default: false })
  includeItemInManufacturing: boolean;

  @Column({ type: 'boolean', default: false })
  isSubContractedItem: boolean;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  itemGroup: string;

  @Column({ nullable: true })
  weightPerUnit: number;

  @Column({ nullable: true })
  weightUom: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ type: 'text', nullable: true })
  specifications: string;

  @Column({ type: 'boolean', default: false })
  qualityInspectionTemplate: boolean;

  @Column({ type: 'boolean', default: false })
  inspectionRequiredBeforePurchase: boolean;

  @Column({ type: 'boolean', default: false })
  inspectionRequiredBeforeDelivery: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  defaultMaterialRequestType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  defaultSupplier: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  defaultExpenseAccount: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  defaultIncomeAccount: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  defaultBuyingCostCenter: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  defaultSellingCostCenter: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  defaultWarehouse: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  customerCode: string;

  @Column({ type: 'text', nullable: true })
  customerItemName: string;

  @Column({ type: 'boolean', default: false })
  publishedInWebsite: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  routeOfManufacturing: string;



  @Column({ type: 'boolean', default: false })
  hasVariants: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  variantOf: string;

  @Column({ type: 'text', nullable: true })
  webLongDescription: string;

  @Column({ type: 'text', nullable: true })
  webShortDescription: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  websiteImage: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnailImage: string;

  @Column({ type: 'boolean', default: false })
  showInWebsite: boolean;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  websiteWarehouseQty: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  websiteWarehouse: string;

  @Column({ type: 'text', nullable: true })
  websiteSpecifications: string;

  @Column({ type: 'boolean', default: false })
  showVariantThumbnail: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  slideshow: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  websiteItemGroups: string;

  @Column({ type: 'boolean', default: false })
  setMetaTags: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  metaKeywords: string;

  // Relationships
  @Column()
  tenant_id: string;

  @Column({ length: 36, nullable: true })
  department_id: string | null;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'modified_by' })
  modifiedBy: User;

  @Column({ nullable: true })
  modifiedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isActive(): boolean {
    return this.status === 'Active';
  }

  get displayName(): string {
    return `${this.code} - ${this.name}`;
  }
}