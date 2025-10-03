import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierGroupDto {
  @ApiProperty({ description: 'Supplier group name', maxLength: 140 })
  @IsString()
  @MaxLength(140)
  supplier_group_name: string;

  @ApiPropertyOptional({ description: 'Parent supplier group ID for hierarchical structure' })
  @IsOptional()
  @IsString()
  parent_supplier_group?: string;

  @ApiPropertyOptional({ description: 'Is this a group node (not a leaf)', default: false })
  @IsOptional()
  @IsBoolean()
  is_group?: boolean;

  @ApiPropertyOptional({ description: 'Default payment terms template', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  default_payment_terms_template?: string;

  @ApiPropertyOptional({ description: 'Default price list', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  default_price_list?: string;

  @ApiPropertyOptional({ description: 'Group description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is group disabled', default: false })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}