import {
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsOptional,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import {
  ProductionOrderStatus,
  ProductionOrderPriority,
} from '../../../entities/production-order.entity';

export class UpdateProductionOrderDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  productName?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  productCode?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  quantityPlanned?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  quantityProduced?: number;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  unit?: string;

  @IsEnum(ProductionOrderStatus)
  @IsOptional()
  status?: ProductionOrderStatus;

  @IsEnum(ProductionOrderPriority)
  @IsOptional()
  priority?: ProductionOrderPriority;

  @IsDateString()
  @IsOptional()
  plannedStartDate?: string;

  @IsDateString()
  @IsOptional()
  plannedEndDate?: string;

  @IsDateString()
  @IsOptional()
  actualStartDate?: string;

  @IsDateString()
  @IsOptional()
  actualEndDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  estimatedCost?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  actualCost?: number;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;
}