import { IsString, IsNumber, IsBoolean, IsOptional, MaxLength, Min, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShiftTypeDto {
  @ApiProperty({
    description: 'Unique name for the shift type',
    example: 'morning-shift',
    maxLength: 140,
  })
  @IsString()
  @MaxLength(140)
  name: string;

  @ApiProperty({
    description: 'Start time of the shift in HH:MM format',
    example: '09:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  start_time: string;

  @ApiProperty({
    description: 'End time of the shift in HH:MM format',
    example: '17:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  end_time: string;

  @ApiProperty({
    description: 'Total working hours for the shift',
    example: 8.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  total_hours: number;

  @ApiPropertyOptional({
    description: 'Whether to enable late entry marking',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enable_late_entry_marking?: boolean;

  @ApiPropertyOptional({
    description: 'Grace period for late entry in minutes',
    example: 15,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  late_entry_grace_period?: number;

  @ApiPropertyOptional({
    description: 'Whether to enable early exit marking',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enable_early_exit_marking?: boolean;

  @ApiPropertyOptional({
    description: 'Grace period for early exit in minutes',
    example: 15,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  early_exit_grace_period?: number;

  @ApiPropertyOptional({
    description: 'Whether to include holidays in total working hours',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  include_holidays_in_total_working_hours?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to enable automatic attendance',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  enable_auto_attendance?: boolean;
}