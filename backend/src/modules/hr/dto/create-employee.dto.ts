import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsDateString, 
  IsBoolean, 
  IsNumber, 
  MaxLength, 
  IsUUID 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeStatus, Gender, MaritalStatus } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Employee ID', maxLength: 140 })
  @IsString()
  @MaxLength(140)
  name: string;

  @ApiProperty({ description: 'Employee full name', maxLength: 140 })
  @IsString()
  @MaxLength(140)
  employee_name: string;

  @ApiPropertyOptional({ description: 'First name', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  first_name?: string;

  @ApiPropertyOptional({ description: 'Middle name', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  middle_name?: string;

  @ApiPropertyOptional({ description: 'Last name', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  last_name?: string;

  @ApiPropertyOptional({ description: 'Company', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  company?: string;

  @ApiPropertyOptional({ description: 'Employee status', enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ description: 'Gender', enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Date of birth' })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiPropertyOptional({ description: 'Date of joining' })
  @IsOptional()
  @IsDateString()
  date_of_joining?: string;

  @ApiPropertyOptional({ description: 'Relieving date' })
  @IsOptional()
  @IsDateString()
  relieving_date?: string;

  @ApiPropertyOptional({ description: 'Employee number', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  employee_number?: string;

  @ApiPropertyOptional({ description: 'Personal email', maxLength: 140 })
  @IsOptional()
  @IsEmail()
  @MaxLength(140)
  personal_email?: string;

  @ApiPropertyOptional({ description: 'Company email', maxLength: 140 })
  @IsOptional()
  @IsEmail()
  @MaxLength(140)
  company_email?: string;

  @ApiPropertyOptional({ description: 'Cell number', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cell_number?: string;

  @ApiPropertyOptional({ description: 'Emergency phone number', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergency_phone_number?: string;

  @ApiPropertyOptional({ description: 'Marital status', enum: MaritalStatus })
  @IsOptional()
  @IsEnum(MaritalStatus)
  marital_status?: MaritalStatus;

  @ApiPropertyOptional({ description: 'Current address' })
  @IsOptional()
  @IsString()
  current_address?: string;

  @ApiPropertyOptional({ description: 'Permanent address' })
  @IsOptional()
  @IsString()
  permanent_address?: string;

  @ApiPropertyOptional({ description: 'Blood group', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  blood_group?: string;

  @ApiPropertyOptional({ description: 'Nationality', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  nationality?: string;

  @ApiPropertyOptional({ description: 'Passport number', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  passport_number?: string;

  @ApiPropertyOptional({ description: 'Salary mode', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  salary_mode?: string;

  @ApiPropertyOptional({ description: 'Salary amount' })
  @IsOptional()
  @IsNumber()
  salary_amount?: number;

  @ApiPropertyOptional({ description: 'Bank name', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  bank_name?: string;

  @ApiPropertyOptional({ description: 'Bank account number', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  bank_ac_no?: string;

  @ApiPropertyOptional({ description: 'IBAN', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  iban?: string;

  @ApiPropertyOptional({ description: 'Reports to', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  reports_to?: string;

  @ApiPropertyOptional({ description: 'Create user permission', default: false })
  @IsOptional()
  @IsBoolean()
  create_user_permission?: boolean;

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiPropertyOptional({ description: 'Designation ID' })
  @IsOptional()
  @IsUUID()
  designation_id?: string;
}