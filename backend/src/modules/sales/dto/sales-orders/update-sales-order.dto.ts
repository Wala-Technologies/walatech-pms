import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSalesOrderDto } from './create-sales-order.dto';

export class UpdateSalesOrderDto extends PartialType(
  OmitType(CreateSalesOrderDto, ['customer_id'] as const)
) {
  // All fields from CreateSalesOrderDto are optional except customer_id
  // customer_id cannot be changed after creation
}