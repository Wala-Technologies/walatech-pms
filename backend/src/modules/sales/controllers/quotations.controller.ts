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
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { QuotationsService } from '../services/quotations.service';
import type { CreateQuotationDto } from '../services/quotations.service';
import { Quotation } from '../../../entities/quotation.entity';

@ApiTags('Sales - Quotations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales/quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quotation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Quotation created successfully',
    type: Quotation,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer or item not found',
  })
  async create(
    @Body() createQuotationDto: CreateQuotationDto,
    @CurrentUser() user: any,
  ): Promise<Quotation> {
    return this.quotationsService.create(
      createQuotationDto,
      user.tenant_id,
      user.user_id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotations' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quotations retrieved successfully',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: any,
  ): Promise<{ data: Quotation[]; total: number }> {
    return this.quotationsService.findAll(user.tenant_id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quotation by ID' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quotation retrieved successfully',
    type: Quotation,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Quotation not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<Quotation> {
    return this.quotationsService.findOne(id, user.tenant_id, user.user_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quotation updated successfully',
    type: Quotation,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Quotation not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot update submitted quotation',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuotationDto: Partial<CreateQuotationDto>,
    @CurrentUser() user: any,
  ): Promise<Quotation> {
    return this.quotationsService.update(
      id,
      updateQuotationDto,
      user.tenant_id,
      user.user_id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Quotation deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Quotation not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete submitted quotation',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.quotationsService.remove(id, user.tenant_id, user.id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quotation submitted successfully',
    type: Quotation,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Quotation not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Quotation is already submitted',
  })
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<Quotation> {
    return this.quotationsService.submit(id, user.tenant_id, user.user_id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quotation cancelled successfully',
    type: Quotation,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Quotation not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot cancel draft quotation',
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<Quotation> {
    return this.quotationsService.cancel(id, user.tenant_id, user.user_id);
  }

  @Get(':id/print')
  @ApiOperation({ summary: 'Get quotation print view' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quotation print view retrieved successfully',
  })
  async getPrintView(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<any> {
    const quotation = await this.quotationsService.findOne(id, user.tenant_id);
    
    return {
      quotation,
      print_settings: {
        title: 'Quotation',
        show_header: true,
        show_footer: true,
        letterhead: quotation.letter_head,
      },
    };
  }

  @Get('reports/summary')
  @ApiOperation({ summary: 'Get quotations summary report' })
  @ApiQuery({ name: 'from_date', required: false, type: String, description: 'From date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to_date', required: false, type: String, description: 'To date (YYYY-MM-DD)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quotations summary retrieved successfully',
  })
  async getSummary(
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
    @CurrentUser() user?: any,
  ): Promise<any> {
    // This would typically involve more complex aggregation queries
    const quotations = await this.quotationsService.findAll(user.tenant_id, 1, 1000);
    
    const summary = {
      total_quotations: quotations.total,
      draft_quotations: quotations.data.filter(q => q.status === 'Draft').length,
      submitted_quotations: quotations.data.filter(q => q.status === 'Submitted').length,
      cancelled_quotations: quotations.data.filter(q => q.status === 'Cancelled').length,
      total_value: quotations.data.reduce((sum, q) => sum + q.grand_total, 0),
    };

    return summary;
  }
}