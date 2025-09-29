import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, ValidateNested, IsBoolean, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryNoteStatus } from '../../../entities/delivery-note.entity';

export class CreateDeliveryNoteItemDto {
  @ApiProperty({ description: 'Item code' })
  @IsString()
  item_code: string;

  @ApiProperty({ description: 'Item name' })
  @IsString()
  item_name: string;

  @ApiPropertyOptional({ description: 'Item description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Quantity', minimum: 0.000001 })
  @IsNumber()
  @Min(0.000001)
  qty: number;

  @ApiProperty({ description: 'Rate per unit', minimum: 0 })
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiPropertyOptional({ description: 'Warehouse' })
  @IsOptional()
  @IsString()
  warehouse?: string;

  @ApiPropertyOptional({ description: 'Unit of measure', default: 'Nos' })
  @IsOptional()
  @IsString()
  uom?: string;

  @ApiPropertyOptional({ description: 'Stock unit of measure', default: 'Nos' })
  @IsOptional()
  @IsString()
  stock_uom?: string;

  @ApiPropertyOptional({ description: 'Conversion factor', default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  conversion_factor?: number;

  @ApiPropertyOptional({ description: 'Discount percentage', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percentage?: number;

  @ApiPropertyOptional({ description: 'Discount amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;
}

export class CreateDeliveryNoteDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  customer: string;

  @ApiProperty({ description: 'Department ID' })
  @IsUUID()
  department_id: string;

  @ApiProperty({ description: 'Customer name', required: false })
  @IsOptional()
  @IsString()
  customer_name?: string;

  @ApiProperty({ description: 'Posting date' })
  @IsDateString()
  posting_date: string;

  @ApiProperty({ description: 'Posting time', required: false })
  @IsOptional()
  @IsString()
  posting_time?: string;

  @ApiPropertyOptional({ 
    description: 'Delivery note status', 
    enum: DeliveryNoteStatus, 
    default: DeliveryNoteStatus.DRAFT 
  })
  @IsOptional()
  @IsEnum(DeliveryNoteStatus)
  status?: DeliveryNoteStatus;

  @ApiPropertyOptional({ description: 'Currency', default: 'ETB' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Conversion rate', default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  conversion_rate?: number;

  @ApiPropertyOptional({ description: 'Selling price list' })
  @IsOptional()
  @IsString()
  selling_price_list?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({ description: 'Territory' })
  @IsOptional()
  @IsString()
  territory?: string;

  @ApiPropertyOptional({ description: 'Company address' })
  @IsOptional()
  @IsString()
  company_address?: string;

  @ApiPropertyOptional({ description: 'Customer address' })
  @IsOptional()
  @IsString()
  customer_address?: string;

  @ApiPropertyOptional({ description: 'Shipping address' })
  @IsOptional()
  @IsString()
  shipping_address?: string;

  @ApiPropertyOptional({ description: 'Contact person' })
  @IsOptional()
  @IsString()
  contact_person?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsString()
  contact_email?: string;

  @ApiPropertyOptional({ description: 'Contact mobile' })
  @IsOptional()
  @IsString()
  contact_mobile?: string;

  @ApiProperty({ 
    description: 'Delivery note items', 
    type: [CreateDeliveryNoteItemDto] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeliveryNoteItemDto)
  items: CreateDeliveryNoteItemDto[];
}