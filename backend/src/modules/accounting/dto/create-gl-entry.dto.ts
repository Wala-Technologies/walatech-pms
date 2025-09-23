import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateGLEntryDto {
  @IsDateString()
  postingDate: string;

  @IsString()
  accountId: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  debit: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  credit: number;

  @IsString()
  @Length(1, 140)
  voucherType: string;

  @IsString()
  @Length(1, 140)
  voucherNo: string;

  @IsOptional()
  @IsString()
  againstVoucherType?: string;

  @IsOptional()
  @IsString()
  againstVoucher?: string;

  @IsOptional()
  @IsString()
  costCenter?: string;

  @IsOptional()
  @IsString()
  project?: string;

  @IsString()
  @Length(1, 140)
  company: string;

  @IsOptional()
  @IsBoolean()
  isCancelled?: boolean;

  @IsOptional()
  @IsBoolean()
  isOpening?: boolean;

  @IsOptional()
  @IsString()
  remarks?: string;
}