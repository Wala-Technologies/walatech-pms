import { IsEmail, IsString, IsOptional, MinLength, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  SYSTEM_ADMIN = 'System Admin',
  PRODUCTION_MANAGER = 'Production Manager',
  QUALITY_LEAD = 'Quality Lead',
  MACHINE_OPERATOR = 'Machine Operator',
  INVENTORY_CLERK = 'Inventory Clerk',
  VIEWER = 'Viewer',
}

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  last_name: string;

  @ApiProperty({ example: UserRole.MACHINE_OPERATOR, enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ example: 'Production', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: 'en', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ example: '+251911234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Employee ID or badge number', required: false })
  @IsOptional()
  @IsString()
  employee_id?: string;

  @ApiProperty({ example: 'Day shift supervisor', required: false })
  @IsOptional()
  @IsString()
  position?: string;
}