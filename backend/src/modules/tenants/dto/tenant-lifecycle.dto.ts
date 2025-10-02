import { IsString, IsOptional, IsNumber, Min, Max, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantLifecycleAction } from '../../../entities/tenant-lifecycle-audit.entity';

export class SoftDeleteTenantDto {
  @ApiProperty({
    description: 'Reason for soft deleting the tenant',
    example: 'Customer requested account closure',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Custom retention period in days (overrides default)',
    example: 30,
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  customRetentionDays?: number;
}

export class HardDeleteTenantDto {
  @ApiProperty({
    description: 'Reason for hard deleting the tenant',
    example: 'Retention period expired',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Force hard deletion even if retention period has not expired',
    example: false,
  })
  @IsOptional()
  force?: boolean;
}

export class ReactivateTenantDto {
  @ApiProperty({
    description: 'Reason for reactivating the tenant',
    example: 'Customer requested account restoration',
  })
  @IsString()
  reason: string;
}

export class UpdateRetentionPeriodDto {
  @ApiProperty({
    description: 'New retention period in days',
    example: 90,
    minimum: 1,
    maximum: 365,
  })
  @IsNumber()
  @Min(1)
  @Max(365)
  retentionPeriodDays: number;

  @ApiProperty({
    description: 'Reason for updating retention period',
    example: 'Updated company policy',
  })
  @IsString()
  reason: string;
}

export class TenantAuditLogQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by specific action',
    enum: TenantLifecycleAction,
  })
  @IsOptional()
  @IsEnum(TenantLifecycleAction)
  action?: TenantLifecycleAction;

  @ApiPropertyOptional({
    description: 'Start date for audit log query',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for audit log query',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Number of records to return',
    example: 50,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of records to skip',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class CleanupReportDto {
  @ApiProperty({
    description: 'Total number of tenants processed',
    example: 150,
  })
  totalProcessed: number;

  @ApiProperty({
    description: 'Number of tenants hard deleted',
    example: 5,
  })
  hardDeleted: number;

  @ApiProperty({
    description: 'Number of tenants eligible for hard deletion',
    example: 12,
  })
  eligibleForDeletion: number;

  @ApiProperty({
    description: 'Number of errors encountered',
    example: 0,
  })
  errors: number;

  @ApiProperty({
    description: 'Cleanup execution time in milliseconds',
    example: 2500,
  })
  executionTimeMs: number;

  @ApiProperty({
    description: 'Timestamp when cleanup was performed',
    example: '2024-12-18T10:30:00Z',
  })
  timestamp: Date;
}

export class TenantLifecycleStatsDto {
  @ApiProperty({
    description: 'Number of active tenants',
    example: 1250,
  })
  active: number;

  @ApiProperty({
    description: 'Number of suspended tenants',
    example: 25,
  })
  suspended: number;

  @ApiProperty({
    description: 'Number of soft deleted tenants',
    example: 15,
  })
  softDeleted: number;

  @ApiProperty({
    description: 'Number of tenants eligible for hard deletion',
    example: 3,
  })
  eligibleForHardDeletion: number;

  @ApiProperty({
    description: 'Average retention period across all tenants',
    example: 90,
  })
  averageRetentionPeriod: number;
}