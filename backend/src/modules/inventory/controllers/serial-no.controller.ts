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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SerialNoService } from '../services/serial-no.service';
import type {
  CreateSerialNoDto,
  UpdateSerialNoDto,
  SerialNoQueryDto,
} from '../services/serial-no.service';
import { SerialNo } from '../entities/serial-no.entity';

@ApiTags('serial-numbers')
@Controller('serial-numbers')
// @UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class SerialNoController {
  constructor(private readonly serialNoService: SerialNoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new serial number' })
  @ApiResponse({
    status: 201,
    description: 'Serial number created successfully',
    type: SerialNo,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or serial number already exists',
  })
  @ApiResponse({
    status: 404,
    description: 'Item or warehouse not found',
  })
  async create(
    @Body() createSerialNoDto: CreateSerialNoDto,
    @Request() req: any,
  ): Promise<SerialNo> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    return this.serialNoService.create(createSerialNoDto, tenant_id, userId);
  }

  @Post('bulk-create')
  @ApiOperation({ summary: 'Bulk create serial numbers for an item' })
  @ApiResponse({
    status: 201,
    description: 'Serial numbers created successfully',
    type: [SerialNo],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Item or warehouse not found',
  })
  async bulkCreate(
    @Body() bulkCreateDto: {
      itemCode: string;
      warehouseCode: string;
      quantity: number;
      prefix?: string;
    },
    @Request() req: any,
  ): Promise<SerialNo[]> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    const { itemCode, warehouseCode, quantity, prefix } = bulkCreateDto;
    return this.serialNoService.bulkCreateSerialNos(itemCode, warehouseCode, quantity, tenant_id, userId, prefix);
  }

  @Get()
  @ApiOperation({ summary: 'Get all serial numbers with filtering and pagination' })
  @ApiQuery({ name: 'itemCode', required: false, description: 'Filter by item code' })
  @ApiQuery({ name: 'warehouseCode', required: false, description: 'Filter by warehouse code' })
  @ApiQuery({ name: 'company', required: false, description: 'Filter by company' })
  @ApiQuery({ name: 'status', required: false, enum: ['Active', 'Inactive', 'Delivered', 'Expired'], description: 'Filter by status' })
  @ApiQuery({ name: 'assetStatus', required: false, enum: ['In Use', 'Available', 'Damaged', 'Lost', 'Sold', 'Scrapped'], description: 'Filter by asset status' })
  @ApiQuery({ name: 'maintenanceStatus', required: false, enum: ['Under Maintenance', 'Out of Order', 'Issue', 'Working'], description: 'Filter by maintenance status' })
  @ApiQuery({ name: 'warrantyStatus', required: false, enum: ['valid', 'expired', 'expiring_soon'], description: 'Filter by warranty status' })
  @ApiQuery({ name: 'amcStatus', required: false, enum: ['valid', 'expired', 'expiring_soon'], description: 'Filter by AMC status' })
  @ApiQuery({ name: 'purchaseDateFrom', required: false, description: 'Filter from purchase date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'purchaseDateTo', required: false, description: 'Filter to purchase date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'deliveryDateFrom', required: false, description: 'Filter from delivery date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'deliveryDateTo', required: false, description: 'Filter to delivery date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in serial number, description, and location' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['serialNo', 'itemCode', 'purchaseDate', 'deliveryDate', 'warrantyExpiryDate', 'amcExpiryDate', 'createdAt'], description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Serial numbers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        serialNos: {
          type: 'array',
          items: { $ref: '#/components/schemas/SerialNo' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query() query: SerialNoQueryDto,
    @Request() req: any,
  ): Promise<{
    serialNos: SerialNo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const { serialNos, total } = await this.serialNoService.findAll(query, tenant_id);
    
    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      serialNos,
      total,
      page,
      limit,
      totalPages,
    };
  }

  @Get('expiring-warranties')
  @ApiOperation({ summary: 'Get serial numbers with expiring warranties' })
  @ApiQuery({ name: 'daysAhead', required: false, type: Number, description: 'Days ahead to check for warranty expiry (default: 30)' })
  @ApiResponse({
    status: 200,
    description: 'Serial numbers with expiring warranties retrieved successfully',
    type: [SerialNo],
  })
  async getExpiringWarranties(
    @Query('daysAhead') daysAhead: number = 30,
    @Request() req: any,
  ): Promise<SerialNo[]> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.serialNoService.getExpiringWarranties(tenant_id, daysAhead);
  }

  @Get('expiring-amcs')
  @ApiOperation({ summary: 'Get serial numbers with expiring AMCs' })
  @ApiQuery({ name: 'daysAhead', required: false, type: Number, description: 'Days ahead to check for AMC expiry (default: 30)' })
  @ApiResponse({
    status: 200,
    description: 'Serial numbers with expiring AMCs retrieved successfully',
    type: [SerialNo],
  })
  async getExpiringAMCs(
    @Query('daysAhead') daysAhead: number = 30,
    @Request() req: any,
  ): Promise<SerialNo[]> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.serialNoService.getExpiringAMCs(tenant_id, daysAhead);
  }

  @Get('by-item/:itemCode')
  @ApiOperation({ summary: 'Get serial numbers by item code' })
  @ApiQuery({ name: 'warehouseCode', required: false, description: 'Filter by warehouse code' })
  @ApiResponse({
    status: 200,
    description: 'Serial numbers retrieved successfully',
    type: [SerialNo],
  })
  async getSerialNosByItem(
    @Param('itemCode') itemCode: string,
    @Query('warehouseCode') warehouseCode: string,
    @Request() req: any,
  ): Promise<SerialNo[]> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.serialNoService.getSerialNosByItem(itemCode, tenant_id, warehouseCode);
  }

  @Get('generate/:itemCode')
  @ApiOperation({ summary: 'Generate a unique serial number for an item' })
  @ApiQuery({ name: 'prefix', required: false, description: 'Prefix for the serial number (default: SN)' })
  @ApiResponse({
    status: 200,
    description: 'Serial number generated successfully',
    schema: {
      type: 'object',
      properties: {
        serialNo: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found',
  })
  async generateSerialNo(
    @Param('itemCode') itemCode: string,
    @Query('prefix') prefix: string,
    @Request() req: any,
  ): Promise<{ serialNo: string }> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const serialNo = await this.serialNoService.generateSerialNo(itemCode, tenant_id, prefix);
    return { serialNo };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get serial number by ID' })
  @ApiResponse({
    status: 200,
    description: 'Serial number retrieved successfully',
    type: SerialNo,
  })
  @ApiResponse({
    status: 404,
    description: 'Serial number not found',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<SerialNo> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.serialNoService.findOne(id, tenant_id);
  }

  @Get('by-serial/:serialNo')
  @ApiOperation({ summary: 'Get serial number by serial number string' })
  @ApiResponse({
    status: 200,
    description: 'Serial number retrieved successfully',
    type: SerialNo,
  })
  @ApiResponse({
    status: 404,
    description: 'Serial number not found',
  })
  async findBySerialNo(
    @Param('serialNo') serialNo: string,
    @Request() req: any,
  ): Promise<SerialNo> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.serialNoService.findBySerialNo(serialNo, tenant_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update serial number' })
  @ApiResponse({
    status: 200,
    description: 'Serial number updated successfully',
    type: SerialNo,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Serial number not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSerialNoDto: UpdateSerialNoDto,
    @Request() req: any,
  ): Promise<SerialNo> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    return this.serialNoService.update(id, updateSerialNoDto, tenant_id, userId);
  }

  @Post(':serialNo/transfer')
  @ApiOperation({ summary: 'Transfer serial number between warehouses' })
  @ApiResponse({
    status: 200,
    description: 'Serial number transferred successfully',
    type: SerialNo,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid transfer',
  })
  @ApiResponse({
    status: 404,
    description: 'Serial number or warehouse not found',
  })
  async transfer(
    @Param('serialNo') serialNo: string,
    @Body() transferDto: {
      fromWarehouse: string;
      toWarehouse: string;
    },
    @Request() req: any,
  ): Promise<SerialNo> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    const { fromWarehouse, toWarehouse } = transferDto;
    return this.serialNoService.transferSerialNo(serialNo, fromWarehouse, toWarehouse, tenant_id, userId);
  }

  @Post(':serialNo/validate')
  @ApiOperation({ summary: 'Validate serial number for transaction' })
  @ApiResponse({
    status: 200,
    description: 'Serial number validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        message: { type: 'string' },
        serialNo: { $ref: '#/components/schemas/SerialNo' },
      },
    },
  })
  async validateSerialNo(
    @Param('serialNo') serialNo: string,
    @Body('itemCode') itemCode: string,
    @Request() req: any,
  ): Promise<{ valid: boolean; message?: string; serialNo?: SerialNo }> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.serialNoService.validateSerialNoForTransaction(serialNo, itemCode, tenant_id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete serial number' })
  @ApiResponse({
    status: 204,
    description: 'Serial number deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Serial number not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.serialNoService.remove(id, tenant_id);
  }
}