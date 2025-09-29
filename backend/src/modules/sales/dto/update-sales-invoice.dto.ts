import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSalesInvoiceDto } from './create-sales-invoice.dto';

export class UpdateSalesInvoiceDto extends PartialType(
  OmitType(CreateSalesInvoiceDto, ['customer_id'] as const)
) {
  // All fields from CreateSalesInvoiceDto are optional except customer_id
  // customer_id cannot be changed after creation
}