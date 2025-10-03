import { IsOptional, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SupplierQueryDto {
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
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term for supplier name, email, or code' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by supplier type', enum: ['Individual', 'Company'] })
  @IsOptional()
  @IsString()
  supplier_type?: string;

  @ApiPropertyOptional({ description: 'Filter by supplier group' })
  @IsOptional()
  @IsString()
  supplier_group?: string;

  @ApiPropertyOptional({ description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by state' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Filter by country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Filter by GST category', enum: ['Registered Regular', 'Registered Composition', 'Unregistered', 'SEZ', 'Overseas', 'UIN Holders'] })
  @IsOptional()
  @IsString()
  gst_category?: string;

  @ApiPropertyOptional({ description: 'Filter by hold type', enum: ['', 'All', 'Invoices', 'Payments'] })
  @IsOptional()
  @IsString()
  hold_type?: string;

  @ApiPropertyOptional({ description: 'Filter by disabled status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  disabled?: boolean;

  @ApiPropertyOptional({ description: 'Filter by RFQ prevention status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  prevent_rfqs?: boolean;

  @ApiPropertyOptional({ description: 'Filter by PO prevention status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  prevent_pos?: boolean;

  @ApiPropertyOptional({ description: 'Sort field', enum: ['supplier_name', 'creation', 'modified', 'city', 'supplier_type', 'country'] })
  @IsOptional()
  @IsString()
  sort_by?: string = 'supplier_name';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sort_order?: 'ASC' | 'DESC' = 'ASC';
}