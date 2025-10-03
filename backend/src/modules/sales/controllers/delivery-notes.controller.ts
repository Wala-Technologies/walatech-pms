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
  ParseIntPipe,
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
import { DeliveryNotesService } from '../services/delivery-notes.service';
import { CreateDeliveryNoteDto } from '../dto/create-delivery-note.dto';
import { UpdateDeliveryNoteDto } from '../dto/update-delivery-note.dto';

@ApiTags('Delivery Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('delivery-notes')
export class DeliveryNotesController {
  constructor(private readonly deliveryNotesService: DeliveryNotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new delivery note' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Delivery note created successfully',
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
    @Body() createDeliveryNoteDto: CreateDeliveryNoteDto,
    @CurrentUser() user: any,
  ) {
    return this.deliveryNotesService.create(
      createDeliveryNoteDto,
      user.tenant_id,
      user.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all delivery notes with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'customer', required: false, type: String, description: 'Filter by customer' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery notes retrieved successfully',
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('customer') customer?: string,
    @CurrentUser() user?: any,
  ) {
    return this.deliveryNotesService.findAll(
      user.tenant_id,
      user.user_id,
      page ?? 1,
      limit ?? 10,
      search,
      status,
      customer,
    );
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get delivery notes summary statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery notes summary retrieved successfully',
  })
  async getSummary(@CurrentUser() user: any) {
    return this.deliveryNotesService.getDeliveryNoteSummary(user.tenant_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery note by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Delivery note ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery note retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Delivery note not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.deliveryNotesService.findOne(id, user.tenant_id, user.user_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update delivery note' })
  @ApiParam({ name: 'id', type: 'string', description: 'Delivery note ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery note updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Delivery note not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot update submitted or cancelled delivery note',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDeliveryNoteDto: UpdateDeliveryNoteDto,
    @CurrentUser() user: any,
  ) {
    return this.deliveryNotesService.update(
      id,
      updateDeliveryNoteDto,
      user.tenant_id,
      user.userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete delivery note' })
  @ApiParam({ name: 'id', type: 'string', description: 'Delivery note ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Delivery note deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Delivery note not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete submitted delivery note',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    await this.deliveryNotesService.remove(id, user.tenant_id, user.user_id);
    return { message: 'Delivery note deleted successfully' };
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit delivery note' })
  @ApiParam({ name: 'id', type: 'string', description: 'Delivery note ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery note submitted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Delivery note not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Only draft delivery notes can be submitted',
  })
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.deliveryNotesService.submit(id, user.tenant_id, user.userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel delivery note' })
  @ApiParam({ name: 'id', type: 'string', description: 'Delivery note ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery note cancelled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Delivery note not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Only submitted delivery notes can be cancelled',
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.deliveryNotesService.cancel(id, user.tenant_id, user.userId);
  }

  @Get(':id/print')
  @ApiOperation({ summary: 'Get delivery note print view' })
  @ApiParam({ name: 'id', type: 'string', description: 'Delivery note ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery note print view retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Delivery note not found',
  })
  async getPrintView(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    const deliveryNote = await this.deliveryNotesService.findOne(id, user.tenant_id, user.user_id);
    
    return {
      delivery_note: deliveryNote,
      print_settings: {
        show_header: true,
        show_footer: true,
        show_item_code: true,
        show_item_name: true,
        show_qty: true,
        show_rate: true,
        show_amount: true,
      },
    };
  }

  @Get('reports/delivery-summary')
  @ApiOperation({ summary: 'Get delivery summary report' })
  @ApiQuery({ name: 'from_date', required: false, type: String, description: 'From date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to_date', required: false, type: String, description: 'To date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'customer', required: false, type: String, description: 'Filter by customer' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery summary report retrieved successfully',
  })
  async getDeliverySummaryReport(
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
    @Query('customer') customer?: string,
    @CurrentUser() user?: any,
  ) {
    // This would be implemented to generate delivery summary reports
    // For now, returning basic summary
    const summary = await this.deliveryNotesService.getDeliveryNoteSummary(user.tenant_id);
    
    return {
      summary,
      filters: {
        from_date: fromDate,
        to_date: toDate,
        customer,
      },
      generated_at: new Date().toISOString(),
    };
  }

  @Get('reports/pending-deliveries')
  @ApiOperation({ summary: 'Get pending deliveries report' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pending deliveries report retrieved successfully',
  })
  async getPendingDeliveriesReport(@CurrentUser() user: any) {
    const pendingDeliveries = await this.deliveryNotesService.findAll(
      user.tenant_id,
      user.user_id,
      1,
      100,
      undefined,
      'Draft',
    );

    return {
      pending_deliveries: pendingDeliveries.data,
      total_pending: pendingDeliveries.total,
      generated_at: new Date().toISOString(),
    };
  }

  @Get('reports/delivery-performance')
  @ApiOperation({ summary: 'Get delivery performance metrics' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'quarter', 'year'], description: 'Time period' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery performance metrics retrieved successfully',
  })
  async getDeliveryPerformance(
    @Query('period') period: string = 'month',
    @CurrentUser() user: any,
  ) {
    const summary = await this.deliveryNotesService.getDeliveryNoteSummary(user.tenant_id);
    
    // This would be enhanced to calculate actual performance metrics
    return {
      period,
      metrics: {
        total_deliveries: summary.total_delivery_notes,
        on_time_deliveries: 0, // Would be calculated based on actual delivery dates
        delayed_deliveries: 0,
        average_delivery_time: 0,
        delivery_efficiency: 0,
      },
      by_status: summary.by_status,
      generated_at: new Date().toISOString(),
    };
  }
}