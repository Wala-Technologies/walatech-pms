import { IsString, IsEmail, IsOptional, IsNumber, IsBoolean, IsIn, MaxLength, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer name', maxLength: 140 })
  @IsString()
  @MaxLength(140)
  customer_name: string;

  @ApiProperty({ description: 'Department ID' })
  @IsString()
  @IsNotEmpty()
  department_id: string;

  @ApiPropertyOptional({ description: 'Customer code', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  customer_code?: string;

  @ApiPropertyOptional({ description: 'Customer type', enum: ['Individual', 'Company'], default: 'Individual' })
  @IsOptional()
  @IsIn(['Individual', 'Company'])
  customer_type?: string;

  @ApiPropertyOptional({ description: 'Email address', maxLength: 140 })
  @IsOptional()
  @IsEmail()
  @MaxLength(140)
  email?: string;

  @ApiPropertyOptional({ description: 'Mobile number', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobile_no?: string;

  @ApiPropertyOptional({ description: 'Phone number', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Website URL', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  website?: string;

  @ApiPropertyOptional({ description: 'Tax ID', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  tax_id?: string;

  @ApiPropertyOptional({ description: 'Default currency', maxLength: 3, default: 'ETB' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  default_currency?: string;

  @ApiPropertyOptional({ description: 'Default price list', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  default_price_list?: string;

  @ApiPropertyOptional({ description: 'Credit limit', minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  credit_limit?: number;

  @ApiPropertyOptional({ description: 'Payment terms in days', minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  payment_terms?: number;

  @ApiPropertyOptional({ description: 'Is customer frozen', default: false })
  @IsOptional()
  @IsBoolean()
  is_frozen?: boolean;

  @ApiPropertyOptional({ description: 'Is customer disabled', default: false })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  // Primary Address
  @ApiPropertyOptional({ description: 'Address line 1', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  address_line1?: string;

  @ApiPropertyOptional({ description: 'Address line 2', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  address_line2?: string;

  @ApiPropertyOptional({ description: 'City', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  city?: string;

  @ApiPropertyOptional({ description: 'State', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  state?: string;

  @ApiPropertyOptional({ description: 'Country', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  country?: string;

  @ApiPropertyOptional({ description: 'Pincode', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  pincode?: string;

  // Billing Address
  @ApiPropertyOptional({ description: 'Billing address line 1', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  billing_address_line1?: string;

  @ApiPropertyOptional({ description: 'Billing address line 2', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  billing_address_line2?: string;

  @ApiPropertyOptional({ description: 'Billing city', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  billing_city?: string;

  @ApiPropertyOptional({ description: 'Billing state', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  billing_state?: string;

  @ApiPropertyOptional({ description: 'Billing country', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  billing_country?: string;

  @ApiPropertyOptional({ description: 'Billing pincode', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  billing_pincode?: string;

  // Shipping Address
  @ApiPropertyOptional({ description: 'Shipping address line 1', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  shipping_address_line1?: string;

  @ApiPropertyOptional({ description: 'Shipping address line 2', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  shipping_address_line2?: string;

  @ApiPropertyOptional({ description: 'Shipping city', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  shipping_city?: string;

  @ApiPropertyOptional({ description: 'Shipping state', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  shipping_state?: string;

  @ApiPropertyOptional({ description: 'Shipping country', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  shipping_country?: string;

  @ApiPropertyOptional({ description: 'Shipping pincode', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  shipping_pincode?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}