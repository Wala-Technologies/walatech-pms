import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  // Optional explicit subdomain for cases where Host header cannot carry subdomain (e.g., direct IP or localhost access)
  @IsOptional()
  @Matches(/^[a-z0-9-]+$/i, {
    message: 'Subdomain may only contain alphanumeric and dashes',
  })
  subdomain?: string;
}
