import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateCostCenterDto {
  @IsString()
  @Length(1, 140)
  code: string;

  @IsString()
  @Length(1, 255)
  name: string;

  @IsBoolean()
  isGroup: boolean;

  @IsOptional()
  @IsString()
  parentCostCenterId?: string;

  @IsString()
  @Length(1, 140)
  company: string;

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}