import { PartialType } from '@nestjs/swagger';
import { CreateSupplierScorecardDto } from './create-supplier-scorecard.dto';

export class UpdateSupplierScorecardDto extends PartialType(CreateSupplierScorecardDto) {}