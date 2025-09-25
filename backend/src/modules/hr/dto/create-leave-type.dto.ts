import { IsString, IsNumber, IsBoolean, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeaveTypeDto {
  @ApiProperty({
    description: 'Unique name for the leave type',
    example: 'annual-leave',
    maxLength: 140,
  })
  @IsString()
  @MaxLength(140)
  name: string;

  @ApiProperty({
    description: 'Display name for the leave type',
    example: 'Annual Leave',
    maxLength: 140,
  })
  @IsString()
  @MaxLength(140)
  leave_type_name: string;

  @ApiPropertyOptional({
    description: 'Maximum leaves allowed per year',
    example: 21,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_leaves_allowed?: number;

  @ApiPropertyOptional({
    description: 'Whether leaves can be carried forward to next year',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_carry_forward?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum leaves that can be carried forward',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_carry_forwarded_leaves?: number;

  @ApiPropertyOptional({
    description: 'Whether leaves can be encashed',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_encash?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is Leave Without Pay',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_lwp?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to include holidays in leave calculation',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  include_holiday?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to allow negative leave balance',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  allow_negative?: boolean;

  @ApiPropertyOptional({
    description: 'Description of the leave type',
    example: 'Annual vacation leave for employees',
  })
  @IsOptional()
  @IsString()
  description?: string;
}