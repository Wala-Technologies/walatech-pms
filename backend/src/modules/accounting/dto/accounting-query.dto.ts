import { Type } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class AccountBalanceQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsDateString()
  asOfDate?: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  company?: string;
}

export class TrialBalanceQueryDto {
  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsString()
  company: string;

  @IsOptional()
  @IsString()
  costCenter?: string;
}

export class GLReportQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  voucherType?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  offset?: number = 0;
}