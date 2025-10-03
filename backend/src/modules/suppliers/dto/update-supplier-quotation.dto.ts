import { PartialType } from '@nestjs/swagger';
import { CreateSupplierQuotationDto } from './create-supplier-quotation.dto';

export class UpdateSupplierQuotationDto extends PartialType(CreateSupplierQuotationDto) {}