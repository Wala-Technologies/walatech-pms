import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { SalesInvoicesService } from '../services/sales-invoices.service';
import { CreateSalesInvoiceDto } from '../dto/create-sales-invoice.dto';
import { UpdateSalesInvoiceDto } from '../dto/update-sales-invoice.dto';
import { SalesInvoice, SalesInvoiceStatus } from '../../../entities/sales-invoice.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Sales Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales-invoices')
export class SalesInvoicesController {
  constructor(private readonly salesInvoicesService: SalesInvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sales invoice' })
  @ApiResponse({
    status: 201,
    description: 'Sales invoice created successfully',
    type: SalesInvoice,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Customer or items not found' })
  @ApiResponse({ status: 409, description: 'Sales invoice name already exists' })
  async create(
    @Body() createSalesInvoiceDto: CreateSalesInvoiceDto,
    @Request() req: any,
  ): Promise<SalesInvoice> {
    return this.salesInvoicesService.create(
      createSalesInvoiceDto,
      req.user.tenant_id,
      req.user.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales invoices' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SalesInvoiceStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'customer_id',
    required: false,
    type: String,
    description: 'Filter by customer ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Sales invoices retrieved successfully',
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: SalesInvoiceStatus,
    @Query('customer_id') customerId?: string,
    @Request() req?: any,
  ): Promise<{
    data: SalesInvoice[];
    total: number;
    page: number;
    limit: number;
  }> {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    return this.salesInvoicesService.findAll(
      req.user.tenant_id,
      req.user.user_id,
      pageNum,
      limitNum,
      status,
      customerId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sales invoice by ID' })
  @ApiParam({ name: 'id', description: 'Sales invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Sales invoice retrieved successfully',
    type: SalesInvoice,
  })
  @ApiResponse({ status: 404, description: 'Sales invoice not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<SalesInvoice> {
    return this.salesInvoicesService.findOne(id, req.user.tenant_id, req.user.user_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sales invoice' })
  @ApiParam({ name: 'id', description: 'Sales invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Sales invoice updated successfully',
    type: SalesInvoice,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Sales invoice not found' })
  async update(
    @Param('id') id: string,
    @Body() updateSalesInvoiceDto: UpdateSalesInvoiceDto,
    @Request() req: any,
  ): Promise<SalesInvoice> {
    return this.salesInvoicesService.update(
      id,
      updateSalesInvoiceDto,
      req.user.tenant_id,
      req.user.userId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a sales invoice' })
  @ApiParam({ name: 'id', description: 'Sales invoice ID' })
  @ApiResponse({ status: 204, description: 'Sales invoice deleted successfully' })
  @ApiResponse({ status: 400, description: 'Only draft invoices can be deleted' })
  @ApiResponse({ status: 404, description: 'Sales invoice not found' })
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.salesInvoicesService.remove(id, req.user.tenant_id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit a sales invoice' })
  @ApiParam({ name: 'id', description: 'Sales invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Sales invoice submitted successfully',
    type: SalesInvoice,
  })
  @ApiResponse({ status: 400, description: 'Only draft invoices can be submitted' })
  @ApiResponse({ status: 404, description: 'Sales invoice not found' })
  async submit(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<SalesInvoice> {
    return this.salesInvoicesService.submit(id, req.user.tenant_id, req.user.userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a sales invoice' })
  @ApiParam({ name: 'id', description: 'Sales invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Sales invoice cancelled successfully',
    type: SalesInvoice,
  })
  @ApiResponse({ status: 400, description: 'Only submitted invoices can be cancelled' })
  @ApiResponse({ status: 404, description: 'Sales invoice not found' })
  async cancel(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<SalesInvoice> {
    return this.salesInvoicesService.cancel(id, req.user.tenant_id, req.user.userId);
  }

  @Get(':id/print')
  @ApiOperation({ summary: 'Get sales invoice print view' })
  @ApiParam({ name: 'id', description: 'Sales invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Sales invoice print data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales invoice not found' })
  async getPrintView(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    const invoice = await this.salesInvoicesService.findOne(id, req.user.tenant_id, req.user.user_id);
    
    // Return formatted data for printing
    return {
      invoice,
      company: {
        name: 'Your Company Name', // This should come from tenant/company settings
        address: 'Company Address',
        phone: 'Company Phone',
        email: 'company@email.com',
      },
      print_settings: {
        print_heading: invoice.title || 'Sales Invoice',
        show_item_code: true,
        show_taxes: true,
        show_payment_terms: true,
      },
    };
  }

  @Get('reports/summary')
  @ApiOperation({ summary: 'Get sales invoice summary report' })
  @ApiQuery({ name: 'from_date', required: false, type: String, description: 'From date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to_date', required: false, type: String, description: 'To date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'customer_id', required: false, type: String, description: 'Filter by customer' })
  @ApiResponse({
    status: 200,
    description: 'Sales invoice summary retrieved successfully',
  })
  async getSummaryReport(
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
    @Query('customer_id') customerId?: string,
    @Request() req?: any,
  ): Promise<any> {
    // This would typically be implemented in the service
    // For now, return basic summary structure
    return {
      total_invoices: 0,
      total_amount: 0,
      outstanding_amount: 0,
      paid_amount: 0,
      by_status: {
        draft: 0,
        submitted: 0,
        paid: 0,
        cancelled: 0,
      },
      by_customer: [],
    };
  }
}