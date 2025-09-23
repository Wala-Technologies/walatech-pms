import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateFiscalYearDto {
  @IsString()
  @Length(1, 140)
  name: string;

  @IsDateString()
  yearStartDate: string;

  @IsDateString()
  yearEndDate: string;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  @IsOptional()
  @IsBoolean()
  autoCreated?: boolean;
}