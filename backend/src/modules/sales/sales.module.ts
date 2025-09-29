import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Quotation } from '../../entities/quotation.entity';
import { QuotationItem } from '../../entities/quotation-item.entity';
import { SalesOrder } from '../../entities/sales-order.entity';
import { SalesOrderItem } from '../../entities/sales-order-item.entity';
import { DeliveryNote } from '../../entities/delivery-note.entity';
import { DeliveryNoteItem } from '../../entities/delivery-note-item.entity';
import { SalesInvoice } from '../../entities/sales-invoice.entity';
import { SalesInvoiceItem } from '../../entities/sales-invoice-item.entity';
import { Customer } from '../../entities/customer.entity';
import { Item } from '../../entities/item.entity';

// Services
import { QuotationsService } from './services/quotations.service';
import { SalesOrdersService } from './services/sales-orders.service';
import { DeliveryNotesService } from './services/delivery-notes.service';
import { SalesInvoicesService } from './services/sales-invoices.service';
import { SalesWorkflowService } from './services/sales-workflow.service';

// Controllers
import { QuotationsController } from './controllers/quotations.controller';
import { SalesOrdersController } from './controllers/sales-orders.controller';
import { DeliveryNotesController } from './controllers/delivery-notes.controller';
import { SalesInvoicesController } from './controllers/sales-invoices.controller';
import { SalesWorkflowController } from './controllers/sales-workflow.controller';

// Common services
import { DepartmentAccessService } from '../../common/services/department-access.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Sales entities
      Quotation,
      QuotationItem,
      SalesOrder,
      SalesOrderItem,
      DeliveryNote,
      DeliveryNoteItem,
      SalesInvoice,
      SalesInvoiceItem,
      // Related entities
      Customer,
      Item,
    ]),
  ],
  providers: [
    QuotationsService,
    SalesOrdersService,
    DeliveryNotesService,
    SalesInvoicesService,
    SalesWorkflowService,
    DepartmentAccessService,
  ],
  controllers: [
    QuotationsController,
    SalesOrdersController,
    DeliveryNotesController,
    SalesInvoicesController,
    SalesWorkflowController,
  ],
  exports: [
    QuotationsService,
    SalesOrdersService,
    DeliveryNotesService,
    SalesInvoicesService,
    SalesWorkflowService,
  ],
})
export class SalesModule {}