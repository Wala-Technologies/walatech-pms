import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from '../../../entities/quotation.entity';
import { SalesOrder } from '../../../entities/sales-order.entity';
import { DeliveryNote } from '../../../entities/delivery-note.entity';
import { SalesInvoice } from '../../../entities/sales-invoice.entity';
import { QuotationsService } from './quotations.service';
import { SalesOrdersService } from './sales-orders.service';
import { DeliveryNotesService } from './delivery-notes.service';
import { SalesInvoicesService } from './sales-invoices.service';

export interface SalesWorkflowStatus {
  quotation?: {
    id: string;
    name: string;
    status: string;
    grand_total: number;
  };
  sales_order?: {
    id: string;
    name: string;
    status: string;
    grand_total: number;
  };
  delivery_note?: {
    id: string;
    name: string;
    status: string;
    grand_total: number;
  };
  sales_invoice?: {
    id: string;
    name: string;
    status: string;
    grand_total: number;
  };
  workflow_stage: 'quotation' | 'sales_order' | 'delivery_note' | 'sales_invoice' | 'completed';
  can_progress: boolean;
  next_action?: string;
}

@Injectable()
export class SalesWorkflowService {
  constructor(
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    @InjectRepository(SalesOrder)
    private salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(DeliveryNote)
    private deliveryNoteRepository: Repository<DeliveryNote>,
    @InjectRepository(SalesInvoice)
    private salesInvoiceRepository: Repository<SalesInvoice>,
    private quotationsService: QuotationsService,
    private salesOrdersService: SalesOrdersService,
    private deliveryNotesService: DeliveryNotesService,
    private salesInvoicesService: SalesInvoicesService,
  ) {}

  /**
   * Convert a quotation to a sales order
   */
  async convertQuotationToSalesOrder(
    quotationId: string,
    tenant_id: string,
    userId: string,
    additionalData?: any,
  ): Promise<SalesOrder> {
    const quotation = await this.quotationsService.findOne(quotationId, tenant_id, userId);

    if (quotation.status !== 'Submitted') {
      throw new BadRequestException('Only submitted quotations can be converted to sales orders');
    }

    // Check if already converted by customer and date
    const existingSalesOrders = await this.salesOrderRepository.find({
      where: { customer_id: quotation.party_name, tenant_id: tenant_id },
    });

    // For now, we'll allow multiple sales orders per customer
    // In a full implementation, you'd add proper quotation tracking

    // Create sales order from quotation
    const salesOrderData = {
      customer_id: quotation.party_name,
      customer_name: quotation.customer_name,
      transaction_date: quotation.transaction_date.toISOString().split('T')[0],
      delivery_date: additionalData?.delivery_date || quotation.transaction_date.toISOString().split('T')[0],
      // quotation_no: quotation.name, // TODO: Add quotation_no field to SalesOrder entity
      currency: quotation.currency,
      conversion_rate: quotation.conversion_rate,
      selling_price_list: quotation.selling_price_list,
      terms: quotation.terms,
      items: quotation.items.map(item => ({
        item_code: item.item_code,
        item_name: item.item_name,
        description: item.description,
        qty: item.qty,
        rate: item.rate,
        delivery_date: additionalData?.delivery_date || quotation.transaction_date.toISOString().split('T')[0],
        uom: item.uom,
        stock_uom: item.stock_uom,
        conversion_factor: item.conversion_factor,
        discount_percentage: item.discount_percentage,
        discount_amount: item.discount_amount,
        warehouse: item.warehouse,
      })),
      ...additionalData,
    };

    return this.salesOrdersService.create(salesOrderData, tenant_id);
  }

  /**
   * Convert a sales order to a delivery note
   */
  async convertSalesOrderToDeliveryNote(
    salesOrderId: string,
    tenant_id: string,
    userId: string,
    additionalData?: any,
  ): Promise<DeliveryNote> {
    const salesOrder = await this.salesOrdersService.findOne(salesOrderId, tenant_id);

    if (salesOrder.status !== 'To Deliver and Bill') {
      throw new BadRequestException('Sales order must be confirmed to create delivery note');
    }

    // Create delivery note from sales order
    const deliveryNoteData = {
      customer_id: salesOrder.customer_id,
      customer_name: salesOrder.customer_name,
      posting_date: new Date().toISOString().split('T')[0],
      posting_time: new Date().toTimeString().split(' ')[0],
      set_posting_time: true,
      currency: salesOrder.currency,
      conversion_rate: salesOrder.conversion_rate,
      selling_price_list: salesOrder.selling_price_list,
      terms: salesOrder.terms,
      items: salesOrder.items.map(item => ({
        item_code: item.item_code,
        item_name: item.item_name,
        description: item.description,
        qty: item.qty,
        rate: item.rate,
        uom: item.uom,
        stock_uom: item.stock_uom,
        conversion_factor: item.conversion_factor,
        warehouse: item.warehouse,
        against_sales_order: salesOrder.name,
        so_detail: item.id,
      })),
      ...additionalData,
    };

    return this.deliveryNotesService.create(deliveryNoteData, tenant_id, userId);
  }

  /**
   * Convert a delivery note to a sales invoice
   */
  async convertDeliveryNoteToSalesInvoice(
    deliveryNoteId: string,
    tenant_id: string,
    userId: string,
    additionalData?: any,
  ): Promise<SalesInvoice> {
    const deliveryNote = await this.deliveryNotesService.findOne(deliveryNoteId, tenant_id, userId);

    if (deliveryNote.status !== 'To Bill') {
      throw new BadRequestException('Delivery note must be submitted to create sales invoice');
    }

    // Create sales invoice from delivery note
    const salesInvoiceData = {
      customer_id: deliveryNote.customer_id,
      customer_name: deliveryNote.customer_name,
      posting_date: new Date().toISOString().split('T')[0],
      posting_time: new Date().toTimeString().split(' ')[0],
      set_posting_time: true,
      currency: deliveryNote.currency,
      conversion_rate: deliveryNote.conversion_rate,
      selling_price_list: deliveryNote.selling_price_list,
      terms: deliveryNote.terms,
      items: deliveryNote.items.map(item => ({
        item_code: item.item_code,
        item_name: item.item_name,
        description: item.description,
        qty: item.qty,
        rate: item.rate,
        uom: item.uom,
        stock_uom: item.stock_uom,
        conversion_factor: item.conversion_factor,
        warehouse: item.warehouse,
        delivery_note: deliveryNote.name,
        dn_detail: item.id,
      })),
      ...additionalData,
    };

    return this.salesInvoicesService.create(salesInvoiceData, tenant_id, userId);
  }

  /**
   * Get the complete workflow status for a customer or document
   */
  async getWorkflowStatus(
    documentType: 'quotation' | 'sales_order' | 'delivery_note' | 'sales_invoice',
    documentId: string,
    tenant_id: string,
    userId: string,
  ): Promise<SalesWorkflowStatus> {
    let quotation: Quotation | null = null;
    let salesOrder: SalesOrder | null = null;
    let deliveryNote: DeliveryNote | null = null;
    let salesInvoice: SalesInvoice | null = null;

    // Find the starting document and trace the workflow
    switch (documentType) {
      case 'quotation':
        quotation = await this.quotationsService.findOne(documentId, tenant_id, userId);
        const salesOrders = await this.salesOrderRepository.find({
          where: { customer_id: quotation.party_name, tenant_id: tenant_id },
          relations: ['items'],
        });
        salesOrder = salesOrders.length > 0 ? salesOrders[0] : null;
        break;

      case 'sales_order':
        salesOrder = await this.salesOrdersService.findOne(documentId, tenant_id);
        // TODO: Add quotation_no field to SalesOrder entity for proper tracking
        // For now, we'll skip quotation lookup from sales order
        break;

      case 'delivery_note':
        deliveryNote = await this.deliveryNotesService.findOne(documentId, tenant_id, userId);
        // Find related sales order through delivery note items
        break;

      case 'sales_invoice':
        salesInvoice = await this.salesInvoicesService.findOne(documentId, tenant_id, userId);
        // Find related delivery note through sales invoice items
        break;
    }

    // Determine workflow stage and next actions
    let workflowStage: SalesWorkflowStatus['workflow_stage'] = 'quotation';
    let canProgress = false;
    let nextAction: string | undefined;

    if (salesInvoice && salesInvoice.status === 'Paid') {
      workflowStage = 'completed';
      canProgress = false;
    } else if (salesInvoice) {
      workflowStage = 'sales_invoice';
      canProgress = salesInvoice.status === 'Submitted';
      nextAction = canProgress ? 'Record Payment' : undefined;
    } else if (deliveryNote) {
      workflowStage = 'delivery_note';
      canProgress = deliveryNote.status === 'To Bill';
      nextAction = canProgress ? 'Create Sales Invoice' : undefined;
    } else if (salesOrder) {
      workflowStage = 'sales_order';
      canProgress = salesOrder.status === 'To Deliver and Bill';
      nextAction = canProgress ? 'Create Delivery Note' : undefined;
    } else if (quotation) {
      workflowStage = 'quotation';
      canProgress = quotation.status === 'Submitted';
      nextAction = canProgress ? 'Create Sales Order' : undefined;
    }

    return {
      quotation: quotation ? {
        id: quotation.id,
        name: quotation.name,
        status: quotation.status,
        grand_total: quotation.grand_total,
      } : undefined,
      sales_order: salesOrder ? {
        id: salesOrder.id,
        name: salesOrder.name,
        status: salesOrder.status,
        grand_total: salesOrder.grand_total,
      } : undefined,
      delivery_note: deliveryNote ? {
        id: deliveryNote.id,
        name: deliveryNote.name,
        status: deliveryNote.status,
        grand_total: deliveryNote.grand_total,
      } : undefined,
      sales_invoice: salesInvoice ? {
        id: salesInvoice.id,
        name: salesInvoice.name,
        status: salesInvoice.status,
        grand_total: salesInvoice.grand_total,
      } : undefined,
      workflow_stage: workflowStage,
      can_progress: canProgress,
      next_action: nextAction,
    };
  }

  /**
   * Get sales pipeline overview for a tenant
   */
  async getSalesPipeline(tenant_id: string): Promise<any> {
    const [quotations, salesOrders, deliveryNotes, salesInvoices] = await Promise.all([
      this.quotationRepository.find({ where: { tenant_id: tenant_id } }),
      this.salesOrderRepository.find({ where: { tenant_id: tenant_id } }),
      this.deliveryNoteRepository.find({ where: { tenant_id: tenant_id } }),
      this.salesInvoiceRepository.find({ where: { tenant_id: tenant_id } }),
    ]);

    return {
      quotations: {
        total: quotations.length,
        draft: quotations.filter(q => q.status === 'Draft').length,
        submitted: quotations.filter(q => q.status === 'Submitted').length,
        total_value: quotations.reduce((sum, q) => sum + q.grand_total, 0),
      },
      sales_orders: {
        total: salesOrders.length,
        draft: salesOrders.filter(so => so.status === 'Draft').length,
        confirmed: salesOrders.filter(so => so.status === 'To Deliver and Bill').length,
        total_value: salesOrders.reduce((sum, so) => sum + so.grand_total, 0),
      },
      delivery_notes: {
        total: deliveryNotes.length,
        draft: deliveryNotes.filter(dn => dn.status === 'Draft').length,
        submitted: deliveryNotes.filter(dn => dn.status === 'To Bill').length,
        total_value: deliveryNotes.reduce((sum, dn) => sum + dn.grand_total, 0),
      },
      sales_invoices: {
        total: salesInvoices.length,
        draft: salesInvoices.filter(si => si.status === 'Draft').length,
        submitted: salesInvoices.filter(si => si.status === 'Submitted').length,
        paid: salesInvoices.filter(si => si.status === 'Paid').length,
        total_value: salesInvoices.reduce((sum, si) => sum + si.grand_total, 0),
      },
    };
  }
}