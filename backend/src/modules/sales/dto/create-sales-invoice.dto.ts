import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, Min, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { SalesInvoiceStatus } from '../../../entities/sales-invoice.entity';

export class CreateSalesInvoiceItemDto {
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

  @ApiPropertyOptional({ description: 'Warehouse' })
  @IsOptional()
  @IsString()
  warehouse?: string;

  @ApiPropertyOptional({ description: 'Discount percentage', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_percentage?: number;

  @ApiPropertyOptional({ description: 'Discount amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @ApiPropertyOptional({ description: 'Delivery note reference' })
  @IsOptional()
  @IsString()
  delivery_note?: string;

  @ApiPropertyOptional({ description: 'Delivery note detail reference' })
  @IsOptional()
  @IsString()
  dn_detail?: string;
}

export class CreateSalesInvoiceDto {
  @ApiPropertyOptional({ description: 'Invoice name (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  customer_id: string;

  @ApiProperty({ description: 'Department ID' })
  @IsUUID()
  department_id: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  customer_name: string;

  @ApiProperty({ description: 'Posting date' })
  @IsDateString()
  posting_date: string;

  @ApiPropertyOptional({ description: 'Posting time' })
  @IsOptional()
  @IsString()
  posting_time?: string;

  @ApiPropertyOptional({ description: 'Set posting time', default: false })
  @IsOptional()
  @IsBoolean()
  set_posting_time?: boolean;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({ description: 'Currency', default: 'USD' })
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

  @ApiPropertyOptional({ description: 'PO number' })
  @IsOptional()
  @IsString()
  po_no?: string;

  @ApiPropertyOptional({ description: 'PO date' })
  @IsOptional()
  @IsDateString()
  po_date?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({ 
    description: 'Invoice status', 
    enum: SalesInvoiceStatus, 
    default: SalesInvoiceStatus.DRAFT 
  })
  @IsOptional()
  @IsEnum(SalesInvoiceStatus)
  status?: SalesInvoiceStatus;

  @ApiPropertyOptional({ description: 'Is POS invoice', default: false })
  @IsOptional()
  @IsBoolean()
  is_pos?: boolean;

  @ApiPropertyOptional({ description: 'Update stock', default: false })
  @IsOptional()
  @IsBoolean()
  update_stock?: boolean;

  @ApiPropertyOptional({ description: 'Remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ description: 'Invoice items', type: [CreateSalesInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesInvoiceItemDto)
  items: CreateSalesInvoiceItemDto[];
}