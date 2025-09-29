import { PartialType } from '@nestjs/swagger';
import { CreateSupplierGroupDto } from './create-supplier-group.dto';

export class UpdateSupplierGroupDto extends PartialType(CreateSupplierGroupDto) {}