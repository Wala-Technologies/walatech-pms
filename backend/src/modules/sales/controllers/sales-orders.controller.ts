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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SalesOrdersService } from '../services/sales-orders.service';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  SalesOrderQueryDto,
} from '../dto/sales-orders';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { tenant_id } from '../../../decorators/tenant.decorator';

@ApiTags('Sales Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sales order' })
  @ApiResponse({ status: 201, description: 'Sales order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({
    status: 409,
    description: 'Sales order with this name already exists',
  })
  async create(
    @Body() createSalesOrderDto: CreateSalesOrderDto,
    @tenant_id() tenant_id: string,
  ) {
    return this.salesOrdersService.create(createSalesOrderDto, tenant_id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all sales orders with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Sales orders retrieved successfully',
  })
  async findAll(
    @Query() query: SalesOrderQueryDto,
    @tenant_id() tenant_id: string,
  ) {
    const result = await this.salesOrdersService.findAll(query, tenant_id);
    return {
      salesOrders: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get sales order statistics' })
  @ApiResponse({
    status: 200,
    description: 'Sales order statistics retrieved successfully',
  })
  async getStats(@tenant_id() tenant_id: string) {
    return this.salesOrdersService.getStats(tenant_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sales order by ID' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({
    status: 200,
    description: 'Sales order retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @tenant_id() tenant_id: string,
  ) {
    return this.salesOrdersService.findOne(id, tenant_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sales order' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({ status: 200, description: 'Sales order updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSalesOrderDto: UpdateSalesOrderDto,
    @tenant_id() tenant_id: string,
  ) {
    return this.salesOrdersService.update(id, updateSalesOrderDto, tenant_id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a sales order' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({ status: 204, description: 'Sales order deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Only draft sales orders can be deleted',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @tenant_id() tenant_id: string,
  ) {
    await this.salesOrdersService.remove(id, tenant_id);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a sales order' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({
    status: 200,
    description: 'Sales order submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Only draft sales orders can be submitted',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @tenant_id() tenant_id: string,
  ) {
    return this.salesOrdersService.submit(id, tenant_id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a sales order' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({
    status: 200,
    description: 'Sales order cancelled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel sales order with current status',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @tenant_id() tenant_id: string,
  ) {
    return this.salesOrdersService.cancel(id, tenant_id);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close a sales order' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({ status: 200, description: 'Sales order closed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot close sales order with current status',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async close(
    @Param('id', ParseUUIDPipe) id: string,
    @tenant_id() tenant_id: string,
  ) {
    return this.salesOrdersService.close(id, tenant_id);
  }

  @Post(':id/hold')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Put a sales order on hold' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({
    status: 200,
    description: 'Sales order put on hold successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot hold sales order with current status',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async hold(
    @Param('id', ParseUUIDPipe) id: string,
    @tenant_id() tenant_id: string,
  ) {
    return this.salesOrdersService.hold(id, tenant_id);
  }

  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume a sales order from hold' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({ status: 200, description: 'Sales order resumed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Only sales orders on hold can be resumed',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async resume(
    @Param('id', ParseUUIDPipe) id: string,
    @tenant_id() tenant_id: string,
  ) {
    return this.salesOrdersService.resume(id, tenant_id);
  }
}
