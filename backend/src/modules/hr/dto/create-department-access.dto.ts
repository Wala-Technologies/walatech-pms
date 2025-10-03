import { IsString, IsOptional, IsBoolean, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccessType } from '../entities/department-access.entity';

export class CreateDepartmentAccessDto {
  @ApiProperty({ description: 'User UUID' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ description: 'Department UUID' })
  @IsUUID()
  department_id: string;

  @ApiProperty({ 
    description: 'Access type',
    enum: AccessType,
    default: AccessType.READ
  })
  @IsEnum(AccessType)
  access_type: AccessType = AccessType.READ;

  @ApiPropertyOptional({ description: 'Is access active', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @ApiPropertyOptional({ description: 'Valid from date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  valid_from?: string;

  @ApiPropertyOptional({ description: 'Valid to date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  valid_to?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}