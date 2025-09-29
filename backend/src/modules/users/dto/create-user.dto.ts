import { IsEmail, IsString, IsOptional, MinLength, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-roles.enum';

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

  @ApiProperty({ example: UserRole.PRODUCTION, enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID()
  department_id?: string;

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