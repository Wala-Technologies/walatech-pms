import { IsString, IsOptional, IsBoolean, MaxLength, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessUnitType } from '../../../common/enums/business-unit-types.enum';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name/ID', maxLength: 140 })
  @IsString()
  @MaxLength(140)
  name: string;

  @ApiProperty({ description: 'Department code (unique identifier)', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiProperty({ description: 'Department display name', maxLength: 140 })
  @IsString()
  @MaxLength(140)
  department_name: string;

  @ApiPropertyOptional({ description: 'Parent department UUID' })
  @IsOptional()
  @IsUUID()
  parent_department_id?: string;

  @ApiPropertyOptional({ description: 'Parent department name (legacy)' })
  @IsOptional()
  @IsString()
  parent_department?: string;

  @ApiProperty({ description: 'Company name', maxLength: 140 })
  @IsString()
  @MaxLength(140)
  company: string;

  @ApiProperty({ 
    description: 'Business unit type',
    enum: BusinessUnitType,
    default: BusinessUnitType.GENERAL
  })
  @IsEnum(BusinessUnitType)
  business_unit_type: BusinessUnitType = BusinessUnitType.GENERAL;

  @ApiPropertyOptional({ description: 'Is this a group department', default: false })
  @IsOptional()
  @IsBoolean()
  is_group?: boolean = false;

  @ApiPropertyOptional({ description: 'Is department disabled', default: false })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean = false;

  @ApiPropertyOptional({ description: 'Department description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Department head name', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  department_head?: string;

  @ApiPropertyOptional({ description: 'Cost center code', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  cost_center?: string;

  @ApiPropertyOptional({ description: 'Department permissions (JSON)' })
  @IsOptional()
  permissions?: Record<string, any>;
}