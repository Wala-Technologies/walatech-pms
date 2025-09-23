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
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InventoryService } from '../services/inventory.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemQueryDto } from '../dto/item-query.dto';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('items')
  async create(@Body() createItemDto: CreateItemDto, @Request() req) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.createItem(createItemDto, tenant_id, req.user.id);
  }

  @Get('items')
  async findAll(@Query() query: ItemQueryDto, @Request() req) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.findAllItems(query, tenant_id);
  }

  @Get('items/:id')
  async findOne(@Param('id') id: string, @Request() req) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.findOneItem(id, tenant_id);
  }

  @Patch('items/:id')
  async update(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
    @Request() req,
  ) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.updateItem(id, updateItemDto, tenant_id, req.user.id);
  }

  @Delete('items/:id')
  async remove(@Param('id') id: string, @Request() req) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.removeItem(id, tenant_id);
  }

  @Get('items/:id/stock-levels')
  async getStockLevels(@Param('id') id: string, @Request() req) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.getStockLevels(id, tenant_id);
  }

  @Get('dashboard/summary')
  async getDashboardSummary(@Request() req) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.getDashboardSummary(tenant_id);
  }

  @Get('reports/low-stock')
  async getLowStockReport(@Request() req) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.getLowStockReport(tenant_id);
  }

  @Get('reports/valuation')
  @ApiOperation({ summary: 'Get inventory valuation report' })
  async getValuationReport(@Request() req) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.getValuationReport(tenant_id);
  }

  @Get('stock-summary')
  @ApiOperation({ summary: 'Get comprehensive stock summary' })
  @ApiQuery({ name: 'company', required: false, description: 'Filter by company' })
  @ApiQuery({ name: 'warehouseCode', required: false, description: 'Filter by warehouse' })
  @ApiQuery({ name: 'itemGroup', required: false, description: 'Filter by item group' })
  @ApiQuery({ name: 'includeZeroStock', required: false, type: Boolean, description: 'Include items with zero stock' })
  async getStockSummary(
    @Query() query: {
      company?: string;
      warehouseCode?: string;
      itemGroup?: string;
      includeZeroStock?: boolean;
    },
    @Request() req: any,
  ) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.getStockSummary(query, tenant_id);
  }

  @Get('stock-ledger')
  @ApiOperation({ summary: 'Get stock ledger entries' })
  @ApiQuery({ name: 'itemCode', required: false, description: 'Filter by item code' })
  @ApiQuery({ name: 'warehouseCode', required: false, description: 'Filter by warehouse' })
  @ApiQuery({ name: 'company', required: false, description: 'Filter by company' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Filter from date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Filter to date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'voucherType', required: false, description: 'Filter by voucher type' })
  @ApiQuery({ name: 'voucherNo', required: false, description: 'Filter by voucher number' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  async getStockLedger(
    @Query() query: {
      itemCode?: string;
      warehouseCode?: string;
      company?: string;
      fromDate?: string;
      toDate?: string;
      voucherType?: string;
      voucherNo?: string;
      page?: number;
      limit?: number;
    },
    @Request() req: any,
  ) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.getStockLedger(query, tenant_id);
  }

  @Post('stock-reconciliation')
  @ApiOperation({ summary: 'Perform stock reconciliation' })
  async performStockReconciliation(
    @Body() reconciliationDto: {
      company: string;
      warehouseCode?: string;
      items: Array<{
        itemCode: string;
        warehouseCode: string;
        actualQty: number;
        valuationRate?: number;
      }>;
      postingDate?: string;
      remarks?: string;
    },
    @Request() req: any,
  ) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    const userId = req.user?.id;
    return this.inventoryService.performStockReconciliation(reconciliationDto, tenant_id, userId);
  }

  @Get('aging-report')
  @ApiOperation({ summary: 'Get stock aging report' })
  @ApiQuery({ name: 'company', required: false, description: 'Filter by company' })
  @ApiQuery({ name: 'warehouseCode', required: false, description: 'Filter by warehouse' })
  @ApiQuery({ name: 'itemGroup', required: false, description: 'Filter by item group' })
  @ApiQuery({ name: 'agingBasis', required: false, enum: ['fifo', 'lifo'], description: 'Aging calculation basis' })
  async getAgingReport(
    @Query() query: {
      company?: string;
      warehouseCode?: string;
      itemGroup?: string;
      agingBasis?: 'fifo' | 'lifo';
    },
    @Request() req: any,
  ) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.getAgingReport(query, tenant_id);
  }

  @Get('movement-report')
  @ApiOperation({ summary: 'Get inventory movement report' })
  @ApiQuery({ name: 'itemCode', required: false, description: 'Filter by item code' })
  @ApiQuery({ name: 'warehouseCode', required: false, description: 'Filter by warehouse' })
  @ApiQuery({ name: 'company', required: false, description: 'Filter by company' })
  @ApiQuery({ name: 'fromDate', required: true, description: 'From date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: true, description: 'To date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['item', 'warehouse', 'date'], description: 'Group results by' })
  async getMovementReport(
    @Query() query: {
      itemCode?: string;
      warehouseCode?: string;
      company?: string;
      fromDate: string;
      toDate: string;
      groupBy?: 'item' | 'warehouse' | 'date';
    },
    @Request() req: any,
  ) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.getMovementReport(query, tenant_id);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get inventory alerts and notifications' })
  @ApiQuery({ name: 'company', required: false, description: 'Filter by company' })
  @ApiQuery({ name: 'alertType', required: false, enum: ['low_stock', 'out_of_stock', 'expiry', 'negative_stock'], description: 'Filter by alert type' })
  async getInventoryAlerts(
    @Query() query: {
      company?: string;
      alertType?: 'low_stock' | 'out_of_stock' | 'expiry' | 'negative_stock';
    },
    @Request() req: any,
  ) {
    const tenant_id = req.user?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return this.inventoryService.getInventoryAlerts(query, tenant_id);
  }
}