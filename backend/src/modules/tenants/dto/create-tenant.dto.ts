import { IsString, IsEnum, IsOptional, Length, Matches } from 'class-validator';
import { TenantStatus, TenantPlan } from '../../../entities/tenant.entity';

export class CreateTenantDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  @Length(3, 100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Subdomain must contain only lowercase letters, numbers, and hyphens'
  })
  subdomain: string;

  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @IsOptional()
  @IsEnum(TenantPlan)
  plan?: TenantPlan;

  @IsOptional()
  @IsString()
  settings?: string;

  @IsOptional()
  @IsString()
  @Length(1, 140)
  owner?: string;
}