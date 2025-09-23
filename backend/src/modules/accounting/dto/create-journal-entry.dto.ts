import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

class JournalEntryLineInput {
  @IsString()
  @Length(1, 140)
  account: string;

  @IsOptional()
  @Type(() => Number)
  debitInAccountCurrency?: number;

  @IsOptional()
  @Type(() => Number)
  creditInAccountCurrency?: number;

  @IsOptional()
  @IsString()
  costCenter?: string;
}

export class CreateJournalEntryDto {
  @IsString()
  @Length(1, 50)
  voucherType: string;

  @IsDateString()
  postingDate: string;

  @IsString()
  @Length(1, 140)
  company: string;

  @IsOptional()
  @IsString()
  referenceNo?: string;

  @IsOptional()
  @IsDateString()
  referenceDate?: string;

  @IsOptional()
  @IsString()
  userRemark?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineInput)
  accounts: JournalEntryLineInput[];
}
