import { IsEmail, IsString, IsOptional, MinLength, MaxLength, Matches, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantPlan } from '../../../entities/tenant.entity';

export class ProvisionTenantDto {
  @ApiProperty({
    description: 'Tenant name',
    example: 'Acme Corporation',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Tenant subdomain (3-63 characters, lowercase letters, numbers, and hyphens only)',
    example: 'acme-corp',
    minLength: 3,
    maxLength: 63,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(63)
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: 'Subdomain must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen',
  })
  subdomain: string;

  @ApiPropertyOptional({
    description: 'Tenant plan',
    enum: TenantPlan,
    default: TenantPlan.BASIC,
  })
  @IsOptional()
  @IsEnum(TenantPlan)
  plan?: TenantPlan;

  @ApiProperty({
    description: 'Admin user email address',
    example: 'admin@acme-corp.com',
  })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({
    description: 'Admin user password (minimum 8 characters)',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  adminPassword: string;

  @ApiProperty({
    description: 'Admin user first name',
    example: 'John',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  adminFirstName: string;

  @ApiProperty({
    description: 'Admin user last name',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  adminLastName: string;
}