import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, ValidateNested, IsBoolean, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType, SalesOrderStatus } from '../../../../entities/sales-order.entity';

export class CreateSalesOrderItemDto {
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

  @ApiProperty({ description: 'Delivery date' })
  @IsDateString()
  delivery_date: string;

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

  @ApiPropertyOptional({ description: 'Item group' })
  @IsOptional()
  @IsString()
  item_group?: string;

  @ApiPropertyOptional({ description: 'Brand' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Item image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Weight per unit', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight_per_unit?: number;

  @ApiPropertyOptional({ description: 'Weight unit of measure' })
  @IsOptional()
  @IsString()
  weight_uom?: string;

  @ApiPropertyOptional({ description: 'Is free item', default: false })
  @IsOptional()
  @IsBoolean()
  is_free_item?: boolean;

  @ApiPropertyOptional({ description: 'Is stock item', default: true })
  @IsOptional()
  @IsBoolean()
  is_stock_item?: boolean;

  @ApiPropertyOptional({ description: 'Supplier for drop shipping' })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({ description: 'Supplier delivers to customer (drop shipping)', default: false })
  @IsOptional()
  @IsBoolean()
  supplier_delivers_to_customer?: boolean;
}

export class CreateSalesOrderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  customer_id: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  customer_name: string;

  @ApiProperty({ description: 'Department ID' })
  @IsUUID()
  department_id: string;

  @ApiProperty({ description: 'Transaction date' })
  @IsDateString()
  transaction_date: string;

  @ApiProperty({ description: 'Delivery date' })
  @IsDateString()
  delivery_date: string;

  @ApiPropertyOptional({ 
    description: 'Order type', 
    enum: OrderType, 
    default: OrderType.SALES 
  })
  @IsOptional()
  @IsEnum(OrderType)
  order_type?: OrderType;

  @ApiPropertyOptional({ 
    description: 'Order status', 
    enum: SalesOrderStatus, 
    default: SalesOrderStatus.DRAFT 
  })
  @IsOptional()
  @IsEnum(SalesOrderStatus)
  status?: SalesOrderStatus;

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

  @ApiPropertyOptional({ description: 'Customer PO number' })
  @IsOptional()
  @IsString()
  customer_po_no?: string;

  @ApiPropertyOptional({ description: 'Customer PO date' })
  @IsOptional()
  @IsDateString()
  customer_po_date?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({ description: 'Remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Territory' })
  @IsOptional()
  @IsString()
  territory?: string;

  @ApiPropertyOptional({ description: 'Sales person' })
  @IsOptional()
  @IsString()
  sales_person?: string;

  @ApiPropertyOptional({ description: 'Commission rate', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission_rate?: number;

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

  @ApiPropertyOptional({ description: 'Skip delivery note', default: false })
  @IsOptional()
  @IsBoolean()
  skip_delivery_note?: boolean;

  @ApiProperty({ 
    description: 'Sales order items', 
    type: [CreateSalesOrderItemDto] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderItemDto)
  items: CreateSalesOrderItemDto[];
}