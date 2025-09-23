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
import { WarehouseService } from '../services/warehouse.service';
import type { CreateWarehouseDto, UpdateWarehouseDto, WarehouseQueryDto } from '../services/warehouse.service';
import { Warehouse } from '../entities/warehouse.entity';

// Assuming you have these guards and decorators
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { TenantGuard } from '../../auth/guards/tenant.guard';

@ApiTags('warehouses')
@Controller('warehouses')
// @UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({
    status: 201,
    description: 'Warehouse created successfully',
    type: Warehouse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or warehouse name already exists',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant or parent warehouse not found',
  })
  async create(
    @Body() createWarehouseDto: CreateWarehouseDto,
    @Request() req: any,
  ): Promise<Warehouse> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    return this.warehouseService.create(createWarehouseDto, tenant_id, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all warehouses with filtering and pagination' })
  @ApiQuery({ name: 'company', required: false, description: 'Filter by company' })
  @ApiQuery({ name: 'warehouseType', required: false, description: 'Filter by warehouse type' })
  @ApiQuery({ name: 'isGroup', required: false, type: Boolean, description: 'Filter by group status' })
  @ApiQuery({ name: 'disabled', required: false, type: Boolean, description: 'Filter by disabled status' })
  @ApiQuery({ name: 'parentWarehouse', required: false, description: 'Filter by parent warehouse' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in warehouse name and company' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({
    status: 200,
    description: 'Warehouses retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        warehouses: {
          type: 'array',
          items: { $ref: '#/components/schemas/Warehouse' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query() query: WarehouseQueryDto,
    @Request() req: any,
  ): Promise<{
    warehouses: Warehouse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const { warehouses, total } = await this.warehouseService.findAll(query, tenant_id);
    
    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      warehouses,
      total,
      page,
      limit,
      totalPages,
    };
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get warehouse hierarchy' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse hierarchy retrieved successfully',
    type: [Warehouse],
  })
  async getHierarchy(@Request() req: any): Promise<Warehouse[]> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.warehouseService.getWarehouseHierarchy(tenant_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse retrieved successfully',
    type: Warehouse,
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<Warehouse> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.warehouseService.findOne(id, tenant_id);
  }

  @Get('name/:warehouseName')
  @ApiOperation({ summary: 'Get warehouse by name' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse retrieved successfully',
    type: Warehouse,
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found',
  })
  async findByName(
    @Param('warehouseName') warehouseName: string,
    @Request() req: any,
  ): Promise<Warehouse> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.warehouseService.findByName(warehouseName, tenant_id);
  }

  @Get(':warehouseName/children')
  @ApiOperation({ summary: 'Get child warehouses' })
  @ApiResponse({
    status: 200,
    description: 'Child warehouses retrieved successfully',
    type: [Warehouse],
  })
  async getChildren(
    @Param('warehouseName') warehouseName: string,
    @Request() req: any,
  ): Promise<Warehouse[]> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.warehouseService.getChildWarehouses(warehouseName, tenant_id);
  }

  @Get(':warehouseName/all-children')
  @ApiOperation({ summary: 'Get all descendant warehouses' })
  @ApiResponse({
    status: 200,
    description: 'All descendant warehouses retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        children: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  async getAllChildren(
    @Param('warehouseName') warehouseName: string,
    @Request() req: any,
  ): Promise<{ children: string[] }> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const children = await this.warehouseService.getAllChildWarehouses(warehouseName, tenant_id);
    return { children };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update warehouse' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse updated successfully',
    type: Warehouse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or warehouse name already exists',
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse or parent warehouse not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateWarehouseDto: Omit<UpdateWarehouseDto, 'id'>,
    @Request() req: any,
  ): Promise<Warehouse> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    const userId = req.user?.id;
    return this.warehouseService.update({ ...updateWarehouseDto, id }, tenant_id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete warehouse' })
  @ApiResponse({
    status: 204,
    description: 'Warehouse deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - warehouse has child warehouses or stock entries',
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found',
  })
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    const tenant_id = req.user?.tenant_id || req.tenant_id;
    return this.warehouseService.remove(id, tenant_id);
  }
}
