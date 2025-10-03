import { IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, Min, MaxLength, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierQuotationItemDto {
  @ApiProperty({ description: 'Item code', maxLength: 140 })
  @IsString()
  @MaxLength(140)
  item_code: string;

  @ApiPropertyOptional({ description: 'Item name', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  item_name?: string;

  @ApiPropertyOptional({ description: 'Item description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Quantity', minimum: 0 })
  @IsNumber()
  @Min(0)
  qty: number;

  @ApiPropertyOptional({ description: 'Unit of measure', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  uom?: string;

  @ApiProperty({ description: 'Rate per unit', minimum: 0 })
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiPropertyOptional({ description: 'Discount percentage', minimum: 0, maximum: 100, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_percentage?: number;

  @ApiPropertyOptional({ description: 'Discount amount', minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @ApiPropertyOptional({ description: 'Tax template', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  item_tax_template?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expected_delivery_date?: string;

  @ApiPropertyOptional({ description: 'Lead time in days', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lead_time_days?: number;
}

export class CreateSupplierQuotationDto {
  @ApiPropertyOptional({ description: 'Quotation number', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  quotation_number?: string;

  @ApiProperty({ description: 'Supplier ID' })
  @IsString()
  supplier_id: string;

  @ApiProperty({ description: 'Quotation date' })
  @IsDateString()
  quotation_date: string;

  @ApiPropertyOptional({ description: 'Valid till date' })
  @IsOptional()
  @IsDateString()
  valid_till?: string;

  @ApiPropertyOptional({ description: 'Quotation status', enum: ['Draft', 'Submitted', 'Ordered', 'Cancelled', 'Expired'], default: 'Draft' })
  @IsOptional()
  @IsIn(['Draft', 'Submitted', 'Ordered', 'Cancelled', 'Expired'])
  status?: string;

  @ApiPropertyOptional({ description: 'Currency', maxLength: 3, default: 'ETB' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Conversion rate', minimum: 0, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  conversion_rate?: number;

  @ApiPropertyOptional({ description: 'Buying price list', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  buying_price_list?: string;

  @ApiPropertyOptional({ description: 'Price list currency', maxLength: 3 })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  price_list_currency?: string;

  @ApiPropertyOptional({ description: 'Ignore pricing rule', default: false })
  @IsOptional()
  @IsString()
  ignore_pricing_rule?: string;

  @ApiPropertyOptional({ description: 'Tax category', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  tax_category?: string;

  @ApiPropertyOptional({ description: 'Taxes and charges template', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  taxes_and_charges?: string;

  @ApiPropertyOptional({ description: 'Shipping rule', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  shipping_rule?: string;

  @ApiPropertyOptional({ description: 'Incoterm', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  incoterm?: string;

  @ApiPropertyOptional({ description: 'Named place', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  named_place?: string;

  @ApiPropertyOptional({ description: 'Payment terms template', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  payment_terms_template?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  tc_name?: string;

  @ApiPropertyOptional({ description: 'Terms' })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiProperty({ description: 'Quotation items', type: [CreateSupplierQuotationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSupplierQuotationItemDto)
  items: CreateSupplierQuotationItemDto[];
}