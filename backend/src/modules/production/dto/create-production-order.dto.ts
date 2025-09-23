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

export class CreateProductionOrderDto {
  @IsString()
  @MaxLength(100)
  productName: string;

  @IsString()
  @MaxLength(50)
  productCode: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  quantityPlanned: number;

  @IsString()
  @MaxLength(20)
  unit: string;

  @IsEnum(ProductionOrderPriority)
  @IsOptional()
  priority?: ProductionOrderPriority;

  @IsDateString()
  plannedStartDate: string;

  @IsDateString()
  plannedEndDate: string;

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

  @IsUUID()
  @IsOptional()
  assignedTo?: string;
}