import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BinService } from '../services/bin.service';
import type {
  CreateBinDto,
  UpdateBinDto,
  BinQueryDto,
  BinStockDto,
} from '../services/bin.service';
import { Bin } from '../entities/bin.entity';

@ApiTags('bins')
@Controller('bins')
// @UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class BinController {
  constructor(private readonly binService: BinService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bin' })
  @ApiResponse({
    status: 201,
    description: 'Bin created successfully',
    type: Bin,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or bin already exists',
  })
  @ApiResponse({
    status: 404,
    description: 'Item or warehouse not found',
  })
  async create(
    @Body() createBinDto: CreateBinDto,
    @Request() req: any,
  ): Promise<Bin> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    return this.binService.create(createBinDto, tenant_id, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bins with filtering and pagination' })
  @ApiQuery({ name: 'itemCode', required: false, description: 'Filter by item code' })
  @ApiQuery({ name: 'warehouseCode', required: false, description: 'Filter by warehouse code' })
  @ApiQuery({ name: 'company', required: false, description: 'Filter by company' })
  @ApiQuery({ name: 'hasStock', required: false, type: Boolean, description: 'Filter bins with stock (actualQty > 0)' })
  @ApiQuery({ name: 'hasReservedStock', required: false, type: Boolean, description: 'Filter bins with reserved stock' })
  @ApiQuery({ name: 'hasProjectedStock', required: false, type: Boolean, description: 'Filter bins with projected stock' })
  @ApiQuery({ name: 'stockStatus', required: false, enum: ['in_stock', 'out_of_stock', 'low_stock'], description: 'Filter by stock status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in item code and warehouse code' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['itemCode', 'warehouseCode', 'actualQty', 'projectedQty', 'reservedQty', 'modifiedAt'], description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Bins retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        bins: {
          type: 'array',
          items: { $ref: '#/components/schemas/Bin' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query() query: BinQueryDto,
    @Request() req: any,
  ): Promise<{
    bins: Bin[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const { bins, total } = await this.binService.findAll(query, tenant_id);
    
    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      bins,
      total,
      page,
      limit,
      totalPages,
    };
  }

  @Get('stock-balance')
  @ApiOperation({ summary: 'Get stock balance for item-warehouse combinations' })
  @ApiQuery({ name: 'itemCode', required: false, description: 'Filter by item code' })
  @ApiQuery({ name: 'warehouseCode', required: false, description: 'Filter by warehouse code' })
  @ApiQuery({ name: 'company', required: false, description: 'Filter by company' })
  @ApiQuery({ name: 'includeZeroStock', required: false, type: Boolean, description: 'Include bins with zero stock (default: false)' })
  @ApiResponse({
    status: 200,
    description: 'Stock balance retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          itemCode: { type: 'string' },
          warehouseCode: { type: 'string' },
          actualQty: { type: 'number' },
          projectedQty: { type: 'number' },
          reservedQty: { type: 'number' },
          orderedQty: { type: 'number' },
          plannedQty: { type: 'number' },
          requestedQty: { type: 'number' },
          reservedQtyForProduction: { type: 'number' },
          reservedQtyForSubContract: { type: 'number' },
          reservedQtyForProductionPlan: { type: 'number' },
          valuationRate: { type: 'number' },
          stockValue: { type: 'number' },
        },
      },
    },
  })
  async getStockBalance(
    @Query() query: {
      itemCode?: string;
      warehouseCode?: string;
      company?: string;
      includeZeroStock?: boolean;
    },
    @Request() req: any,
  ): Promise<any> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const balance = await this.binService.getStockBalance(query.itemCode || '', query.warehouseCode || '', tenant_id);
    return { itemCode: query.itemCode, warehouse: query.warehouseCode, balance };
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get bins with low stock levels' })
  @ApiQuery({ name: 'company', required: false, description: 'Filter by company' })
  @ApiResponse({
    status: 200,
    description: 'Low stock bins retrieved successfully',
    type: [Bin],
  })
  async getLowStockBins(
    @Query('company') company: string,
    @Request() req: any,
  ): Promise<Bin[]> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.binService.getLowStockItems(tenant_id);
  }

  @Get('by-item/:itemCode')
  @ApiOperation({ summary: 'Get bins by item code' })
  @ApiQuery({ name: 'warehouseCode', required: false, description: 'Filter by warehouse code' })
  @ApiQuery({ name: 'includeZeroStock', required: false, type: Boolean, description: 'Include bins with zero stock (default: false)' })
  @ApiResponse({
    status: 200,
    description: 'Bins retrieved successfully',
    type: [Bin],
  })
  async getBinsByItem(
    @Param('itemCode') itemCode: string,
    @Query('warehouseCode') warehouseCode: string,
    @Query('includeZeroStock') includeZeroStock: boolean = false,
    @Request() req: any,
  ): Promise<Bin[]> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.binService.getBinsByItem(itemCode, tenant_id, warehouseCode, includeZeroStock);
  }

  @Get('by-warehouse/:warehouseCode')
  @ApiOperation({ summary: 'Get bins by warehouse code' })
  @ApiQuery({ name: 'itemCode', required: false, description: 'Filter by item code' })
  @ApiQuery({ name: 'includeZeroStock', required: false, type: Boolean, description: 'Include bins with zero stock (default: false)' })
  @ApiResponse({
    status: 200,
    description: 'Bins retrieved successfully',
    type: [Bin],
  })
  async getBinsByWarehouse(
    @Param('warehouseCode') warehouseCode: string,
    @Query('itemCode') itemCode: string,
    @Query('includeZeroStock') includeZeroStock: boolean = false,
    @Request() req: any,
  ): Promise<Bin[]> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.binService.getBinsByWarehouse(warehouseCode, tenant_id, itemCode, includeZeroStock);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bin by ID' })
  @ApiResponse({
    status: 200,
    description: 'Bin retrieved successfully',
    type: Bin,
  })
  @ApiResponse({
    status: 404,
    description: 'Bin not found',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<Bin> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.binService.findOne(id, tenant_id);
  }

  @Get('item/:itemCode/warehouse/:warehouseCode')
  @ApiOperation({ summary: 'Get bin by item code and warehouse code' })
  @ApiResponse({
    status: 200,
    description: 'Bin retrieved successfully',
    type: Bin,
  })
  @ApiResponse({
    status: 404,
    description: 'Bin not found',
  })
  async findByItemAndWarehouse(
    @Param('itemCode') itemCode: string,
    @Param('warehouseCode') warehouseCode: string,
    @Request() req: any,
  ): Promise<Bin[]> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.binService.findByItemAndWarehouse(itemCode, warehouseCode, tenant_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update bin' })
  @ApiResponse({
    status: 200,
    description: 'Bin updated successfully',
    type: Bin,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Bin not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateBinDto: UpdateBinDto,
    @Request() req: any,
  ): Promise<Bin> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    return this.binService.update(id, updateBinDto, tenant_id, userId);
  }

  @Post(':id/update-quantity')
  @ApiOperation({ summary: 'Update bin quantity' })
  @ApiResponse({
    status: 200,
    description: 'Bin quantity updated successfully',
    type: Bin,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid quantity or insufficient stock',
  })
  @ApiResponse({
    status: 404,
    description: 'Bin not found',
  })
  async updateQuantity(
    @Param('id') id: string,
    @Body() quantityDto: {
      qtyChange: number;
      voucherType: string;
      voucherNo: string;
      allowNegativeStock?: boolean;
    },
    @Request() req: any,
  ): Promise<Bin> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    const { qtyChange, voucherType, voucherNo, allowNegativeStock } = quantityDto;
    
    return this.binService.updateQuantity(
      id,
      qtyChange,
      tenant_id,
      userId,
      allowNegativeStock,
      voucherType,
      voucherNo,
    );
  }

  @Post(':id/reserve')
  @ApiOperation({ summary: 'Reserve quantity in bin' })
  @ApiResponse({
    status: 200,
    description: 'Quantity reserved successfully',
    type: Bin,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - insufficient available quantity',
  })
  @ApiResponse({
    status: 404,
    description: 'Bin not found',
  })
  async reserveQuantity(
    @Param('id') id: string,
    @Body() reserveDto: {
      qty: number;
      voucherType: string;
      voucherNo: string;
      reservationType?: 'production' | 'subcontract' | 'production_plan' | 'general';
    },
    @Request() req: any,
  ): Promise<Bin> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    const { qty, voucherType, voucherNo, reservationType } = reserveDto;
    
    return this.binService.reserveQuantity(
      id,
      qty,
      voucherType,
      voucherNo,
      tenant_id,
      userId,
      reservationType,
    );
  }

  @Post(':id/unreserve')
  @ApiOperation({ summary: 'Unreserve quantity in bin' })
  @ApiResponse({
    status: 200,
    description: 'Quantity unreserved successfully',
    type: Bin,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - insufficient reserved quantity',
  })
  @ApiResponse({
    status: 404,
    description: 'Bin not found',
  })
  async unreserveQuantity(
    @Param('id') id: string,
    @Body() unreserveDto: {
      qty: number;
      voucherType: string;
      voucherNo: string;
      reservationType?: 'production' | 'subcontract' | 'production_plan' | 'general';
    },
    @Request() req: any,
  ): Promise<Bin> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    const { qty, voucherType, voucherNo, reservationType } = unreserveDto;
    
    return this.binService.unreserveQuantity(
      id,
      qty,
      voucherType,
      voucherNo,
      tenant_id,
      userId,
      reservationType,
    );
  }

  @Post('check-availability')
  @ApiOperation({ summary: 'Check stock availability for multiple items' })
  @ApiResponse({
    status: 200,
    description: 'Stock availability checked successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          itemCode: { type: 'string' },
          warehouseCode: { type: 'string' },
          requiredQty: { type: 'number' },
          availableQty: { type: 'number' },
          isAvailable: { type: 'boolean' },
          shortage: { type: 'number' },
        },
      },
    },
  })
  async checkAvailability(
    @Body() checkDto: {
      items: Array<{
        itemCode: string;
        warehouseCode: string;
        requiredQty: number;
      }>;
    },
    @Request() req: any,
  ): Promise<Array<{
    itemCode: string;
    warehouseCode: string;
    requiredQty: number;
    availableQty: number;
    isAvailable: boolean;
    shortage: number;
  }>> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.binService.checkStockAvailability(checkDto.items, tenant_id);
  }
}