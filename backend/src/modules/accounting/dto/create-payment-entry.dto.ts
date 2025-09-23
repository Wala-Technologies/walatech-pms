import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreatePaymentEntryDto {
  @IsEnum(['Receive', 'Pay'])
  paymentType: 'Receive' | 'Pay';

  @IsDateString()
  postingDate: string;

  @IsString()
  @Length(1, 140)
  company: string;

  @IsString()
  paidFromAccountId: string;

  @IsString()
  paidToAccountId: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  paidAmount: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  receivedAmount: number;

  @IsOptional()
  @IsString()
  partyType?: string;

  @IsOptional()
  @IsString()
  party?: string;

  @IsOptional()
  @IsString()
  referenceNo?: string;

  @IsOptional()
  @IsDateString()
  referenceDate?: string;

  @IsOptional()
  @IsString()
  costCenter?: string;

  @IsOptional()
  @IsString()
  project?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}