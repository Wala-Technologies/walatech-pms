import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsNotEmpty, Min, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUUID()
  department_id?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['Raw Material', 'Semi Finished', 'Finished Good', 'Service', 'Template'])
  type: string;

  @IsOptional()
  @IsEnum(['Active', 'Inactive', 'Discontinued'])
  status?: string;

  @IsOptional()
  @IsString()
  stockUom?: string;

  @IsOptional()
  @IsString()
  purchaseUom?: string;

  @IsOptional()
  @IsString()
  salesUom?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  standardRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  lastPurchaseRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  valuationRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  minOrderQty?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  safetyStock?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  leadTimeDays?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isMaintainStock?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFixedAsset?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  allowNegativeStock?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasBatchNo?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasSerialNo?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasExpiryDate?: boolean;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  itemGroup?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  weightPerUnit?: number;

  @IsOptional()
  @IsString()
  weightUom?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  specifications?: string;

  @IsOptional()
  @IsBoolean()
  qualityInspectionTemplate?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  inspectionRequiredBeforePurchase?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  inspectionRequiredBeforeDelivery?: boolean;
}