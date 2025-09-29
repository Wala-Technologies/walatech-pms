import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SalesWorkflowService, SalesWorkflowStatus } from '../services/sales-workflow.service';

@ApiTags('Sales Workflow')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales/workflow')
export class SalesWorkflowController {
  constructor(private readonly salesWorkflowService: SalesWorkflowService) {}

  @Post('quotation/:id/convert-to-sales-order')
  @ApiOperation({ summary: 'Convert quotation to sales order' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({
    status: 201,
    description: 'Sales order created successfully from quotation',
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid quotation status' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  async convertQuotationToSalesOrder(
    @Param('id') quotationId: string,
    @Body() additionalData: any,
    @Request() req: any,
  ) {
    return this.salesWorkflowService.convertQuotationToSalesOrder(
      quotationId,
      req.user.tenant_id,
      req.user.userId,
      additionalData,
    );
  }

  @Post('sales-order/:id/convert-to-delivery-note')
  @ApiOperation({ summary: 'Convert sales order to delivery note' })
  @ApiParam({ name: 'id', description: 'Sales Order ID' })
  @ApiResponse({
    status: 201,
    description: 'Delivery note created successfully from sales order',
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid sales order status' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async convertSalesOrderToDeliveryNote(
    @Param('id') salesOrderId: string,
    @Body() additionalData: any,
    @Request() req: any,
  ) {
    return this.salesWorkflowService.convertSalesOrderToDeliveryNote(
      salesOrderId,
      req.user.tenant_id,
      req.user.userId,
      additionalData,
    );
  }

  @Post('delivery-note/:id/convert-to-sales-invoice')
  @ApiOperation({ summary: 'Convert delivery note to sales invoice' })
  @ApiParam({ name: 'id', description: 'Delivery Note ID' })
  @ApiResponse({
    status: 201,
    description: 'Sales invoice created successfully from delivery note',
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid delivery note status' })
  @ApiResponse({ status: 404, description: 'Delivery note not found' })
  async convertDeliveryNoteToSalesInvoice(
    @Param('id') deliveryNoteId: string,
    @Body() additionalData: any,
    @Request() req: any,
  ) {
    return this.salesWorkflowService.convertDeliveryNoteToSalesInvoice(
      deliveryNoteId,
      req.user.tenant_id,
      req.user.userId,
      additionalData,
    );
  }

  @Get('status/:documentType/:id')
  @ApiOperation({ summary: 'Get workflow status for a document' })
  @ApiParam({ 
    name: 'documentType', 
    description: 'Document type',
    enum: ['quotation', 'sales_order', 'delivery_note', 'sales_invoice']
  })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'Workflow status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        quotation: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string' },
            grand_total: { type: 'number' },
          },
        },
        sales_order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string' },
            grand_total: { type: 'number' },
          },
        },
        delivery_note: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string' },
            grand_total: { type: 'number' },
          },
        },
        sales_invoice: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string' },
            grand_total: { type: 'number' },
          },
        },
        workflow_stage: {
          type: 'string',
          enum: ['quotation', 'sales_order', 'delivery_note', 'sales_invoice', 'completed'],
        },
        can_progress: { type: 'boolean' },
        next_action: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getWorkflowStatus(
    @Param('documentType') documentType: 'quotation' | 'sales_order' | 'delivery_note' | 'sales_invoice',
    @Param('id') documentId: string,
    @Request() req: any,
  ): Promise<SalesWorkflowStatus> {
    return this.salesWorkflowService.getWorkflowStatus(
      documentType,
      documentId,
      req.user.tenant_id,
      req.user.id,
    );
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Get sales pipeline overview' })
  @ApiResponse({
    status: 200,
    description: 'Sales pipeline overview retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        quotations: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            draft: { type: 'number' },
            submitted: { type: 'number' },
            total_value: { type: 'number' },
          },
        },
        sales_orders: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            draft: { type: 'number' },
            confirmed: { type: 'number' },
            total_value: { type: 'number' },
          },
        },
        delivery_notes: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            draft: { type: 'number' },
            submitted: { type: 'number' },
            total_value: { type: 'number' },
          },
        },
        sales_invoices: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            draft: { type: 'number' },
            submitted: { type: 'number' },
            paid: { type: 'number' },
            total_value: { type: 'number' },
          },
        },
      },
    },
  })
  async getSalesPipeline(@Request() req: any) {
    return this.salesWorkflowService.getSalesPipeline(req.user.tenant_id);
  }

  @Get('customer/:customerId/history')
  @ApiOperation({ summary: 'Get complete sales history for a customer' })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of results' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiResponse({
    status: 200,
    description: 'Customer sales history retrieved successfully',
  })
  async getCustomerSalesHistory(
    @Param('customerId') customerId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Request() req?: any,
  ) {
    // This would be implemented to get complete sales history for a customer
    // across all document types in the sales workflow
    return {
      message: 'Customer sales history endpoint - to be implemented',
      customerId,
      limit,
      offset,
    };
  }
}