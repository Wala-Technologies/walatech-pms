import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name/ID', maxLength: 140 })
  @IsString()
  @MaxLength(140)
  name: string;

  @ApiProperty({ description: 'Department display name', maxLength: 140 })
  @IsString()
  @MaxLength(140)
  department_name: string;

  @ApiPropertyOptional({ description: 'Parent department ID' })
  @IsOptional()
  @IsString()
  parent_department?: string;

  @ApiProperty({ description: 'Company name', maxLength: 140 })
  @IsString()
  @MaxLength(140)
  company: string;

  @ApiPropertyOptional({ description: 'Is this a group department', default: false })
  @IsOptional()
  @IsBoolean()
  is_group?: boolean = false;

  @ApiPropertyOptional({ description: 'Is department disabled', default: false })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean = false;
}