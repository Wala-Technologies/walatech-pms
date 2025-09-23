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
import { StockEntryService } from '../services/stock-entry.service';
import type {
  CreateStockEntryDto,
  UpdateStockEntryDto,
  StockEntryQueryDto,
} from '../services/stock-entry.service';
import { StockEntry } from '../entities/stock-entry.entity';

@ApiTags('stock-entries')
@Controller('stock-entries')
// @UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class StockEntryController {
  constructor(private readonly stockEntryService: StockEntryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stock entry' })
  @ApiResponse({
    status: 201,
    description: 'Stock entry created successfully',
    type: StockEntry,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Item, warehouse, or batch not found',
  })
  async create(
    @Body() createStockEntryDto: CreateStockEntryDto,
    @Request() req: any,
  ): Promise<StockEntry> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    return this.stockEntryService.create(createStockEntryDto, tenant_id, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stock entries with filtering and pagination' })
  @ApiQuery({ name: 'stockEntryType', required: false, description: 'Filter by stock entry type' })
  @ApiQuery({ name: 'purpose', required: false, description: 'Filter by purpose' })
  @ApiQuery({ name: 'company', required: false, description: 'Filter by company' })
  @ApiQuery({ name: 'fromWarehouse', required: false, description: 'Filter by from warehouse' })
  @ApiQuery({ name: 'toWarehouse', required: false, description: 'Filter by to warehouse' })
  @ApiQuery({ name: 'docstatus', required: false, type: Number, description: 'Filter by document status (0=Draft, 1=Submitted, 2=Cancelled)' })
  @ApiQuery({ name: 'isReturn', required: false, type: Boolean, description: 'Filter by return status' })
  @ApiQuery({ name: 'workOrder', required: false, description: 'Filter by work order' })
  @ApiQuery({ name: 'materialRequest', required: false, description: 'Filter by material request' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Filter from posting date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Filter to posting date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in stock entry name and remarks' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({
    status: 200,
    description: 'Stock entries retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        stockEntries: {
          type: 'array',
          items: { $ref: '#/components/schemas/StockEntry' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query() query: StockEntryQueryDto,
    @Request() req: any,
  ): Promise<{
    stockEntries: StockEntry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const { stockEntries, total } = await this.stockEntryService.findAll(query, tenant_id);
    
    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      stockEntries,
      total,
      page,
      limit,
      totalPages,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Stock entry retrieved successfully',
    type: StockEntry,
  })
  @ApiResponse({
    status: 404,
    description: 'Stock entry not found',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<StockEntry> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.stockEntryService.findOne(id, tenant_id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit stock entry' })
  @ApiResponse({
    status: 200,
    description: 'Stock entry submitted successfully',
    type: StockEntry,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - stock entry cannot be submitted or insufficient stock',
  })
  @ApiResponse({
    status: 404,
    description: 'Stock entry not found',
  })
  async submit(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<StockEntry> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    return this.stockEntryService.submit(id, tenant_id, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel stock entry' })
  @ApiResponse({
    status: 200,
    description: 'Stock entry cancelled successfully',
    type: StockEntry,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - stock entry cannot be cancelled',
  })
  @ApiResponse({
    status: 404,
    description: 'Stock entry not found',
  })
  async cancel(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<StockEntry> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    return this.stockEntryService.cancel(id, tenant_id, userId);
  }

  // Additional endpoints for specific stock entry types

  @Post('material-receipt')
  @ApiOperation({ summary: 'Create material receipt stock entry' })
  @ApiResponse({
    status: 201,
    description: 'Material receipt created successfully',
    type: StockEntry,
  })
  async createMaterialReceipt(
    @Body() createDto: Omit<CreateStockEntryDto, 'purpose' | 'stockEntryType'>,
    @Request() req: any,
  ): Promise<StockEntry> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    
    const stockEntryDto: CreateStockEntryDto = {
      ...createDto,
      purpose: 'Material Receipt' as any,
      stockEntryType: 'Material Receipt' as any,
    };
    
    return this.stockEntryService.create(stockEntryDto, tenant_id, userId);
  }

  @Post('material-issue')
  @ApiOperation({ summary: 'Create material issue stock entry' })
  @ApiResponse({
    status: 201,
    description: 'Material issue created successfully',
    type: StockEntry,
  })
  async createMaterialIssue(
    @Body() createDto: Omit<CreateStockEntryDto, 'purpose' | 'stockEntryType'>,
    @Request() req: any,
  ): Promise<StockEntry> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    
    const stockEntryDto: CreateStockEntryDto = {
      ...createDto,
      purpose: 'Material Issue' as any,
      stockEntryType: 'Material Issue' as any,
    };
    
    return this.stockEntryService.create(stockEntryDto, tenant_id, userId);
  }

  @Post('material-transfer')
  @ApiOperation({ summary: 'Create material transfer stock entry' })
  @ApiResponse({
    status: 201,
    description: 'Material transfer created successfully',
    type: StockEntry,
  })
  async createMaterialTransfer(
    @Body() createDto: Omit<CreateStockEntryDto, 'purpose' | 'stockEntryType'>,
    @Request() req: any,
  ): Promise<StockEntry> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    
    const stockEntryDto: CreateStockEntryDto = {
      ...createDto,
      purpose: 'Material Transfer' as any,
      stockEntryType: 'Material Transfer' as any,
    };
    
    return this.stockEntryService.create(stockEntryDto, tenant_id, userId);
  }

  @Post('manufacture')
  @ApiOperation({ summary: 'Create manufacture stock entry' })
  @ApiResponse({
    status: 201,
    description: 'Manufacture stock entry created successfully',
    type: StockEntry,
  })
  async createManufacture(
    @Body() createDto: Omit<CreateStockEntryDto, 'purpose' | 'stockEntryType'>,
    @Request() req: any,
  ): Promise<StockEntry> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    
    const stockEntryDto: CreateStockEntryDto = {
      ...createDto,
      purpose: 'Manufacture' as any,
      stockEntryType: 'Manufacture' as any,
    };
    
    return this.stockEntryService.create(stockEntryDto, tenant_id, userId);
  }

  @Post('repack')
  @ApiOperation({ summary: 'Create repack stock entry' })
  @ApiResponse({
    status: 201,
    description: 'Repack stock entry created successfully',
    type: StockEntry,
  })
  async createRepack(
    @Body() createDto: Omit<CreateStockEntryDto, 'purpose' | 'stockEntryType'>,
    @Request() req: any,
  ): Promise<StockEntry> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    
    const stockEntryDto: CreateStockEntryDto = {
      ...createDto,
      purpose: 'Repack' as any,
      stockEntryType: 'Repack' as any,
    };
    
    return this.stockEntryService.create(stockEntryDto, tenant_id, userId);
  }
}