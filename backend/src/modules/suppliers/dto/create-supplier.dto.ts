import { IsString, IsEmail, IsOptional, IsNumber, IsBoolean, IsIn, MaxLength, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Supplier name', maxLength: 140 })
  @IsString()
  @MaxLength(140)
  supplier_name: string;

  @ApiPropertyOptional({ description: 'Supplier code', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  supplier_code?: string;

  @ApiPropertyOptional({ description: 'Supplier type', enum: ['Individual', 'Company'], default: 'Company' })
  @IsOptional()
  @IsIn(['Individual', 'Company'])
  supplier_type?: string;

  @ApiPropertyOptional({ description: 'Supplier group ID' })
  @IsOptional()
  @IsString()
  supplier_group?: string;

  // Contact Information
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

  // Tax Information
  @ApiPropertyOptional({ description: 'Country', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  country?: string;

  @ApiPropertyOptional({ description: 'Tax ID', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  tax_id?: string;

  @ApiPropertyOptional({ description: 'Tax category', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  tax_category?: string;

  @ApiPropertyOptional({ description: 'Print language', maxLength: 140, default: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  print_language?: string;

  @ApiPropertyOptional({ description: 'Tax withholding category', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  tax_withholding_category?: string;

  @ApiPropertyOptional({ description: 'GST category', enum: ['Registered Regular', 'Registered Composition', 'Unregistered', 'SEZ', 'Overseas', 'UIN Holders'] })
  @IsOptional()
  @IsIn(['Registered Regular', 'Registered Composition', 'Unregistered', 'SEZ', 'Overseas', 'UIN Holders'])
  gst_category?: string;

  @ApiPropertyOptional({ description: 'PAN number (India)', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  pan?: string;

  // Financial Settings
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

  @ApiPropertyOptional({ description: 'Payment terms template', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  payment_terms_template?: string;

  @ApiPropertyOptional({ description: 'Default payable account', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  default_payable_account?: string;

  // Purchase Settings
  @ApiPropertyOptional({ description: 'Allow purchase invoice creation without purchase order', default: false })
  @IsOptional()
  @IsBoolean()
  allow_purchase_invoice_creation_without_purchase_order?: boolean;

  @ApiPropertyOptional({ description: 'Allow purchase invoice creation without purchase receipt', default: false })
  @IsOptional()
  @IsBoolean()
  allow_purchase_invoice_creation_without_purchase_receipt?: boolean;

  @ApiPropertyOptional({ description: 'Warn for RFQs', default: false })
  @IsOptional()
  @IsBoolean()
  warn_rfqs?: boolean;

  @ApiPropertyOptional({ description: 'Warn for purchase orders', default: false })
  @IsOptional()
  @IsBoolean()
  warn_pos?: boolean;

  @ApiPropertyOptional({ description: 'Prevent RFQs', default: false })
  @IsOptional()
  @IsBoolean()
  prevent_rfqs?: boolean;

  @ApiPropertyOptional({ description: 'Prevent purchase orders', default: false })
  @IsOptional()
  @IsBoolean()
  prevent_pos?: boolean;

  // Status Management
  @ApiPropertyOptional({ description: 'Is supplier disabled', default: false })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  @ApiPropertyOptional({ description: 'Hold type', enum: ['', 'All', 'Invoices', 'Payments'] })
  @IsOptional()
  @IsIn(['', 'All', 'Invoices', 'Payments'])
  hold_type?: string;

  @ApiPropertyOptional({ description: 'Release date for hold' })
  @IsOptional()
  @IsDateString()
  release_date?: string;

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

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsString()
  department_id?: string;
}