import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsBoolean, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkOrderStatus, WorkOrderPriority } from '../entities/work-order.entity';

export class CreateWorkOrderDto {
  @ApiProperty({ description: 'Work order title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Work order description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Production item code' })
  @IsString()
  productionItem: string;

  @ApiProperty({ description: 'Item name' })
  @IsString()
  itemName: string;

  @ApiProperty({ description: 'Quantity to produce', minimum: 0.001 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  qty: number;

  @ApiProperty({ description: 'Stock unit of measurement' })
  @IsString()
  stockUom: string;

  @ApiPropertyOptional({ description: 'Priority', enum: WorkOrderPriority })
  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @ApiPropertyOptional({ description: 'BOM number' })
  @IsOptional()
  @IsString()
  bomNo?: string;

  @ApiPropertyOptional({ description: 'Sales order reference' })
  @IsOptional()
  @IsString()
  salesOrder?: string;

  @ApiPropertyOptional({ description: 'Project reference' })
  @IsOptional()
  @IsString()
  project?: string;

  @ApiPropertyOptional({ description: 'Source warehouse' })
  @IsOptional()
  @IsString()
  sourceWarehouse?: string;

  @ApiPropertyOptional({ description: 'Work in progress warehouse' })
  @IsOptional()
  @IsString()
  wipWarehouse?: string;

  @ApiPropertyOptional({ description: 'Finished goods warehouse' })
  @IsOptional()
  @IsString()
  fgWarehouse?: string;

  @ApiPropertyOptional({ description: 'Scrap warehouse' })
  @IsOptional()
  @IsString()
  scrapWarehouse?: string;

  @ApiPropertyOptional({ description: 'Planned start date' })
  @IsOptional()
  @IsDateString()
  plannedStartDate?: string;

  @ApiPropertyOptional({ description: 'Planned end date' })
  @IsOptional()
  @IsDateString()
  plannedEndDate?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ description: 'Planned operating cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  plannedOperatingCost?: number;

  @ApiPropertyOptional({ description: 'Material cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  materialCost?: number;

  @ApiPropertyOptional({ description: 'Allow alternative items' })
  @IsOptional()
  @IsBoolean()
  allowAlternativeItem?: boolean;

  @ApiPropertyOptional({ description: 'Use multi-level BOM' })
  @IsOptional()
  @IsBoolean()
  useMultiLevelBom?: boolean;

  @ApiPropertyOptional({ description: 'Skip material transfer' })
  @IsOptional()
  @IsBoolean()
  skipTransfer?: boolean;

  @ApiPropertyOptional({ description: 'Has serial numbers' })
  @IsOptional()
  @IsBoolean()
  hasSerialNo?: boolean;

  @ApiPropertyOptional({ description: 'Has batch numbers' })
  @IsOptional()
  @IsBoolean()
  hasBatchNo?: boolean;

  @ApiPropertyOptional({ description: 'Batch size', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  batchSize?: number;

  @ApiPropertyOptional({ description: 'Production plan ID' })
  @IsOptional()
  @IsUUID()
  productionPlanId?: string;

  @ApiPropertyOptional({ description: 'Item ID' })
  @IsOptional()
  @IsUUID()
  itemId?: string;

  @ApiPropertyOptional({ description: 'Assigned to user ID' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;
}

export class UpdateWorkOrderDto {
  @ApiPropertyOptional({ description: 'Work order title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Work order description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Status', enum: WorkOrderStatus })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @ApiPropertyOptional({ description: 'Priority', enum: WorkOrderPriority })
  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @ApiPropertyOptional({ description: 'Quantity to produce', minimum: 0.001 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  qty?: number;

  @ApiPropertyOptional({ description: 'Produced quantity', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  producedQty?: number;

  @ApiPropertyOptional({ description: 'Rejected quantity', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  rejectedQty?: number;

  @ApiPropertyOptional({ description: 'Planned start date' })
  @IsOptional()
  @IsDateString()
  plannedStartDate?: string;

  @ApiPropertyOptional({ description: 'Planned end date' })
  @IsOptional()
  @IsDateString()
  plannedEndDate?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ description: 'Actual operating cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  actualOperatingCost?: number;

  @ApiPropertyOptional({ description: 'Material cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  materialCost?: number;

  @ApiPropertyOptional({ description: 'Total cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalCost?: number;

  @ApiPropertyOptional({ description: 'Assigned to user ID' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;
}

export class WorkOrderQueryDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by status', enum: WorkOrderStatus })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @ApiPropertyOptional({ description: 'Filter by priority', enum: WorkOrderPriority })
  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @ApiPropertyOptional({ description: 'Filter by production plan ID' })
  @IsOptional()
  @IsUUID()
  productionPlanId?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned user ID' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class WorkOrderResponseDto {
  @ApiProperty({ description: 'Work order ID' })
  id: string;

  @ApiProperty({ description: 'Work order number' })
  workOrderNumber: string;

  @ApiProperty({ description: 'Title' })
  title: string;

  @ApiProperty({ description: 'Description' })
  description: string;

  @ApiProperty({ description: 'Status', enum: WorkOrderStatus })
  status: WorkOrderStatus;

  @ApiProperty({ description: 'Priority', enum: WorkOrderPriority })
  priority: WorkOrderPriority;

  @ApiProperty({ description: 'Production item' })
  productionItem: string;

  @ApiProperty({ description: 'Item name' })
  itemName: string;

  @ApiProperty({ description: 'Quantity' })
  qty: number;

  @ApiProperty({ description: 'Produced quantity' })
  producedQty: number;

  @ApiProperty({ description: 'Stock UOM' })
  stockUom: string;

  @ApiProperty({ description: 'Planned start date' })
  plannedStartDate: Date;

  @ApiProperty({ description: 'Planned end date' })
  plannedEndDate: Date;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Completion percentage' })
  completionPercentage: number;

  @ApiProperty({ description: 'Is completed' })
  isCompleted: boolean;

  @ApiProperty({ description: 'Remaining quantity' })
  remainingQty: number;

  @ApiProperty({ description: 'Is overdue' })
  isOverdue: boolean;
}