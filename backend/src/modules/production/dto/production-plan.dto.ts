import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, ValidateNested, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductionPlanStatus } from '../entities/production-plan.entity';

export class CreateProductionPlanItemDto {
  @ApiProperty({ description: 'Item code' })
  @IsString()
  itemCode: string;

  @ApiProperty({ description: 'Item name' })
  @IsString()
  itemName: string;

  @ApiPropertyOptional({ description: 'Item description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Planned quantity', minimum: 0.001 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  plannedQty: number;

  @ApiProperty({ description: 'Unit of measurement' })
  @IsString()
  uom: string;

  @ApiPropertyOptional({ description: 'Unit cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitCost?: number;

  @ApiPropertyOptional({ description: 'Required date' })
  @IsOptional()
  @IsDateString()
  requiredDate?: string;

  @ApiPropertyOptional({ description: 'BOM reference' })
  @IsOptional()
  @IsString()
  bomReference?: string;

  @ApiPropertyOptional({ description: 'Warehouse' })
  @IsOptional()
  @IsString()
  warehouse?: string;

  @ApiPropertyOptional({ description: 'Item ID' })
  @IsOptional()
  @IsUUID()
  itemId?: string;

  @ApiPropertyOptional({ description: 'Item specifications' })
  @IsOptional()
  specifications?: any;
}

export class CreateProductionPlanDto {
  @ApiProperty({ description: 'Production plan title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Production plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Plan date' })
  @IsDateString()
  planDate: string;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Estimated cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  estimatedCost?: number;

  @ApiPropertyOptional({ description: 'Priority level' })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({ description: 'Production plan items', type: [CreateProductionPlanItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductionPlanItemDto)
  items: CreateProductionPlanItemDto[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;
}

export class UpdateProductionPlanDto {
  @ApiPropertyOptional({ description: 'Production plan title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Production plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Status', enum: ProductionPlanStatus })
  @IsOptional()
  @IsEnum(ProductionPlanStatus)
  status?: ProductionPlanStatus;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Estimated cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  estimatedCost?: number;

  @ApiPropertyOptional({ description: 'Actual cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  actualCost?: number;

  @ApiPropertyOptional({ description: 'Priority level' })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;
}

export class ProductionPlanQueryDto {
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

  @ApiPropertyOptional({ description: 'Filter by status', enum: ProductionPlanStatus })
  @IsOptional()
  @IsEnum(ProductionPlanStatus)
  status?: ProductionPlanStatus;

  @ApiPropertyOptional({ description: 'Filter by start date (from)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by end date (to)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ProductionPlanResponseDto {
  @ApiProperty({ description: 'Production plan ID' })
  id: string;

  @ApiProperty({ description: 'Plan number' })
  planNumber: string;

  @ApiProperty({ description: 'Title' })
  title: string;

  @ApiProperty({ description: 'Description' })
  description: string;

  @ApiProperty({ description: 'Status', enum: ProductionPlanStatus })
  status: ProductionPlanStatus;

  @ApiProperty({ description: 'Plan date' })
  planDate: Date;

  @ApiProperty({ description: 'Start date' })
  startDate: Date;

  @ApiProperty({ description: 'End date' })
  endDate: Date;

  @ApiProperty({ description: 'Total planned quantity' })
  totalPlannedQty: number;

  @ApiProperty({ description: 'Total produced quantity' })
  totalProducedQty: number;

  @ApiProperty({ description: 'Estimated cost' })
  estimatedCost: number;

  @ApiProperty({ description: 'Actual cost' })
  actualCost: number;

  @ApiProperty({ description: 'Priority' })
  priority: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Completion percentage' })
  completionPercentage: number;

  @ApiProperty({ description: 'Is completed' })
  isCompleted: boolean;
}