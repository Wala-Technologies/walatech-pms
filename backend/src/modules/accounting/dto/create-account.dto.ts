import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
// Keeping the type local to avoid decorator metadata import issues in isolatedModules
type AccountRootType = 'Asset' | 'Liability' | 'Income' | 'Expense' | 'Equity';

export class CreateAccountDto {
  @IsString()
  @Length(1, 140)
  code: string;

  @IsString()
  @Length(1, 255)
  name: string;

  @IsEnum(['Asset', 'Liability', 'Income', 'Expense', 'Equity'])
  rootType: AccountRootType;

  @IsBoolean()
  isGroup: boolean;

  @IsOptional()
  @IsString()
  parentAccountId?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
