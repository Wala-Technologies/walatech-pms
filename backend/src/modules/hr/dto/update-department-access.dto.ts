import { PartialType } from '@nestjs/swagger';
import { CreateDepartmentAccessDto } from './create-department-access.dto';

export class UpdateDepartmentAccessDto extends PartialType(CreateDepartmentAccessDto) {}