import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty({ message: 'First name is required' })
  first_name: string;

  @IsOptional()
  last_name?: string;

  @IsOptional()
  @IsIn(['en', 'am', 'ti', 'or'], { message: 'Language must be one of: en, am, ti, or' })
  language?: string;

  @IsOptional()
  mobile_no?: string;
}