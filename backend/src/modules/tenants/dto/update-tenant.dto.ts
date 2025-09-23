import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantDto } from './create-tenant.dto';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @IsOptional()
  @IsString()
  @Length(1, 140)
  modifiedBy?: string;
}