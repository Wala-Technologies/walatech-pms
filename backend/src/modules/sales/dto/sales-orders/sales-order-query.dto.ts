import { IsOptional, IsEnum, IsDateString, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SalesOrderStatus, OrderType } from '../../../../entities/sales-order.entity';

export class SalesOrderQueryDto {
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

  @ApiPropertyOptional({ description: 'Search term for customer name or sales order name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by status', 
    enum: SalesOrderStatus 
  })
  @IsOptional()
  @IsEnum(SalesOrderStatus)
  status?: SalesOrderStatus;

  @ApiPropertyOptional({ 
    description: 'Filter by order type', 
    enum: OrderType 
  })
  @IsOptional()
  @IsEnum(OrderType)
  order_type?: OrderType;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsOptional()
  @IsString()
  customer_id?: string;

  @ApiPropertyOptional({ description: 'Filter by sales person' })
  @IsOptional()
  @IsString()
  sales_person?: string;

  @ApiPropertyOptional({ description: 'Filter by territory' })
  @IsOptional()
  @IsString()
  territory?: string;

  @ApiPropertyOptional({ description: 'Filter from transaction date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({ description: 'Filter to transaction date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiPropertyOptional({ description: 'Filter from delivery date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  from_delivery_date?: string;

  @ApiPropertyOptional({ description: 'Filter to delivery date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  to_delivery_date?: string;

  @ApiPropertyOptional({ description: 'Sort field', default: 'creation' })
  @IsOptional()
  @IsString()
  sort_by?: string = 'creation';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';
}