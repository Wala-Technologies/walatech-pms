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
import { BatchService } from '../services/batch.service';
import type {
  CreateBatchDto,
  UpdateBatchDto,
  BatchQueryDto,
} from '../services/batch.service';
import { Batch } from '../entities/batch.entity';

@ApiTags('batches')
@Controller('batches')
// @UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new batch' })
  @ApiResponse({
    status: 201,
    description: 'Batch created successfully',
    type: Batch,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or batch already exists',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found',
  })
  async create(
    @Body() createBatchDto: CreateBatchDto,
    @Request() req: any,
  ): Promise<Batch> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    return this.batchService.create(createBatchDto, tenant_id, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all batches with filtering and pagination' })
  @ApiQuery({ name: 'itemCode', required: false, description: 'Filter by item code' })
  @ApiQuery({ name: 'disabled', required: false, type: Boolean, description: 'Filter by disabled status' })
  @ApiQuery({ name: 'expiryStatus', required: false, enum: ['expired', 'expiring_soon', 'valid'], description: 'Filter by expiry status' })
  @ApiQuery({ name: 'manufacturingDateFrom', required: false, description: 'Filter from manufacturing date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'manufacturingDateTo', required: false, description: 'Filter to manufacturing date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'expiryDateFrom', required: false, description: 'Filter from expiry date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'expiryDateTo', required: false, description: 'Filter to expiry date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in batch name, description, and batch ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'itemCode', 'batchQty', 'manufacturingDate', 'expiryDate', 'createdAt'], description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Batches retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        batches: {
          type: 'array',
          items: { $ref: '#/components/schemas/Batch' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query() query: BatchQueryDto,
    @Request() req: any,
  ): Promise<{
    batches: Batch[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const { batches, total } = await this.batchService.findAll(query, tenant_id);
    
    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      batches,
      total,
      page,
      limit,
      totalPages,
    };
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get batches expiring within specified days' })
  @ApiQuery({ name: 'daysAhead', required: false, type: Number, description: 'Days ahead to check for expiry (default: 30)' })
  @ApiResponse({
    status: 200,
    description: 'Expiring batches retrieved successfully',
    type: [Batch],
  })
  async getExpiringBatches(
    @Query('daysAhead') daysAhead: number = 30,
    @Request() req: any,
  ): Promise<Batch[]> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.batchService.getExpiringBatches(tenant_id, daysAhead);
  }

  @Get('expired')
  @ApiOperation({ summary: 'Get expired batches' })
  @ApiResponse({
    status: 200,
    description: 'Expired batches retrieved successfully',
    type: [Batch],
  })
  async getExpiredBatches(@Request() req: any): Promise<Batch[]> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.batchService.getExpiredBatches(tenant_id);
  }

  @Get('by-item/:itemCode')
  @ApiOperation({ summary: 'Get batches by item code' })
  @ApiQuery({ name: 'includeDisabled', required: false, type: Boolean, description: 'Include disabled batches (default: false)' })
  @ApiResponse({
    status: 200,
    description: 'Batches retrieved successfully',
    type: [Batch],
  })
  async getBatchesByItem(
    @Param('itemCode') itemCode: string,
    @Query('includeDisabled') includeDisabled: boolean = false,
    @Request() req: any,
  ): Promise<Batch[]> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.batchService.getBatchesByItem(itemCode, tenant_id, includeDisabled);
  }

  @Get('generate-name/:itemCode')
  @ApiOperation({ summary: 'Generate a unique batch name for an item' })
  @ApiResponse({
    status: 200,
    description: 'Batch name generated successfully',
    schema: {
      type: 'object',
      properties: {
        batchName: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found',
  })
  async generateBatchName(
    @Param('itemCode') itemCode: string,
    @Request() req: any,
  ): Promise<{ batchName: string }> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const batchName = await this.batchService.generateBatchName(itemCode, tenant_id);
    return { batchName };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get batch by ID' })
  @ApiResponse({
    status: 200,
    description: 'Batch retrieved successfully',
    type: Batch,
  })
  @ApiResponse({
    status: 404,
    description: 'Batch not found',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<Batch> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.batchService.findOne(id, tenant_id);
  }

  @Get('by-name/:name/item/:itemCode')
  @ApiOperation({ summary: 'Get batch by name and item code' })
  @ApiResponse({
    status: 200,
    description: 'Batch retrieved successfully',
    type: Batch,
  })
  @ApiResponse({
    status: 404,
    description: 'Batch not found',
  })
  async findByName(
    @Param('name') name: string,
    @Param('itemCode') itemCode: string,
    @Request() req: any,
  ): Promise<Batch> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.batchService.findByName(name, itemCode, tenant_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update batch' })
  @ApiResponse({
    status: 200,
    description: 'Batch updated successfully',
    type: Batch,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Batch not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateBatchDto: UpdateBatchDto,
    @Request() req: any,
  ): Promise<Batch> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    return this.batchService.update(id, updateBatchDto, tenant_id, userId);
  }

  @Patch(':id/quantity')
  @ApiOperation({ summary: 'Update batch quantity' })
  @ApiResponse({
    status: 200,
    description: 'Batch quantity updated successfully',
    type: Batch,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid quantity',
  })
  @ApiResponse({
    status: 404,
    description: 'Batch not found',
  })
  async updateQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Request() req: any,
  ): Promise<Batch> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const batch = await this.batchService.findOne(id, tenant_id);
    return this.batchService.updateBatchQuantity(batch.name, batch.itemCode, tenant_id, quantity);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate batch for transaction' })
  @ApiResponse({
    status: 200,
    description: 'Batch validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        message: { type: 'string' },
        batch: { $ref: '#/components/schemas/Batch' },
      },
    },
  })
  async validateBatch(
    @Param('id') id: string,
    @Body('requiredQty') requiredQty: number,
    @Request() req: any,
  ): Promise<{ valid: boolean; message?: string; batch?: Batch }> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const batch = await this.batchService.findOne(id, tenant_id);
    return this.batchService.validateBatchForTransaction(batch.name, batch.itemCode, tenant_id, requiredQty);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete batch' })
  @ApiResponse({
    status: 204,
    description: 'Batch deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Batch not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.batchService.remove(id, tenant_id);
  }
}
