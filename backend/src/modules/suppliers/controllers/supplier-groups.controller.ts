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
  HttpCode,
  HttpStatus,
  Scope,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupplierGroupsService } from '../services/supplier-groups.service';
import { CreateSupplierGroupDto } from '../dto/create-supplier-group.dto';
import { UpdateSupplierGroupDto } from '../dto/update-supplier-group.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SupplierGroup } from '../../../entities/supplier-group.entity';

@ApiTags('supplier-groups')
@Controller({ path: 'supplier-groups', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupplierGroupsController {
  constructor(private readonly supplierGroupsService: SupplierGroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier group' })
  @ApiResponse({ status: 201, description: 'Supplier group created successfully' })
  @ApiResponse({ status: 409, description: 'Supplier group already exists' })
  async create(@Body() createSupplierGroupDto: CreateSupplierGroupDto): Promise<SupplierGroup> {
    return this.supplierGroupsService.create(createSupplierGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all supplier groups' })
  @ApiResponse({ status: 200, description: 'Supplier groups retrieved successfully' })
  async findAll(@Query() query: any): Promise<{ groups: SupplierGroup[]; total: number }> {
    const groups = await this.supplierGroupsService.findAll();
    return { groups, total: groups.length };
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get supplier groups in tree structure' })
  @ApiResponse({ status: 200, description: 'Supplier group tree retrieved successfully' })
  async getTree(): Promise<SupplierGroup[]> {
    return this.supplierGroupsService.findTree();
  }

  @Get('stats/:id')
  @ApiOperation({ summary: 'Get supplier group statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getGroupStats(@Param('id') id: string): Promise<{
    totalSuppliers: number;
    activeSuppliers: number;
    disabledSuppliers: number;
    childGroups: number;
  }> {
    return this.supplierGroupsService.getGroupStats(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier group by ID' })
  @ApiResponse({ status: 200, description: 'Supplier group retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Supplier group not found' })
  async findOne(@Param('id') id: string): Promise<SupplierGroup> {
    return this.supplierGroupsService.findOne(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get children of a supplier group' })
  @ApiResponse({ status: 200, description: 'Child supplier groups retrieved successfully' })
  async getChildren(@Param('id') id: string): Promise<SupplierGroup[]> {
    return this.supplierGroupsService.findChildren(id);
  }

  @Get(':id/hierarchy')
  @ApiOperation({ summary: 'Get complete hierarchy for a supplier group' })
  @ApiResponse({ status: 200, description: 'Supplier group hierarchy retrieved successfully' })
  async getHierarchy(@Param('id') id: string): Promise<{
    ancestors: SupplierGroup[];
    current: SupplierGroup;
    descendants: SupplierGroup[];
  }> {
    const result = await this.supplierGroupsService.getGroupHierarchy(id);
    return {
      ancestors: result.ancestors,
      current: result.group,
      descendants: result.descendants,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier group' })
  @ApiResponse({ status: 200, description: 'Supplier group updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier group not found' })
  @ApiResponse({ status: 409, description: 'Supplier group name already exists or circular reference detected' })
  async update(
    @Param('id') id: string,
    @Body() updateSupplierGroupDto: UpdateSupplierGroupDto,
  ): Promise<SupplierGroup> {
    return this.supplierGroupsService.update(id, updateSupplierGroupDto);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move supplier group to a new parent' })
  @ApiResponse({ status: 200, description: 'Supplier group moved successfully' })
  @ApiResponse({ status: 404, description: 'Supplier group not found' })
  @ApiResponse({ status: 409, description: 'Cannot move group - circular reference detected' })
  async moveGroup(
    @Param('id') id: string,
    @Body('newParentId') newParentId: string | null,
  ): Promise<SupplierGroup> {
    return this.supplierGroupsService.moveGroup(id, newParentId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a supplier group' })
  @ApiResponse({ status: 204, description: 'Supplier group deleted successfully' })
  @ApiResponse({ status: 404, description: 'Supplier group not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete group with children or assigned suppliers' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.supplierGroupsService.remove(id);
  }
}