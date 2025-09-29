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
import { SuppliersService } from '../services/suppliers.service';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { SupplierQueryDto } from '../dto/supplier-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Supplier } from '../../../entities/supplier.entity';

@ApiTags('suppliers')
@Controller({ path: 'suppliers', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  @ApiResponse({ status: 409, description: 'Supplier already exists' })
  async create(@Body() createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all suppliers with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  async findAll(@Query() query: SupplierQueryDto): Promise<{ suppliers: Supplier[]; total: number }> {
    return this.suppliersService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get supplier statistics' })
  @ApiResponse({ status: 200, description: 'Supplier statistics retrieved successfully' })
  async getSupplierStats(): Promise<{
    total: number;
    active: number;
    disabled: number;
    onHold: number;
    byType: { [key: string]: number };
    byCountry: { [key: string]: number };
    byGstCategory: { [key: string]: number };
    bySupplierGroup: { [key: string]: number };
  }> {
    return this.suppliersService.getSupplierStats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search suppliers by name, email, or code' })
  @ApiResponse({ status: 200, description: 'Suppliers found successfully' })
  async searchSuppliers(
    @Query('q') searchTerm: string,
    @Query('limit') limit: number = 10,
  ): Promise<Supplier[]> {
    return this.suppliersService.searchSuppliers(searchTerm, limit);
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get suppliers by type' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  async getSuppliersByType(@Param('type') type: string): Promise<Supplier[]> {
    return this.suppliersService.getSuppliersByType(type);
  }

  @Get('by-country/:country')
  @ApiOperation({ summary: 'Get suppliers by country' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  async getSuppliersByCountry(@Param('country') country: string): Promise<Supplier[]> {
    return this.suppliersService.getSuppliersByCountry(country);
  }

  @Get('by-group/:groupId')
  @ApiOperation({ summary: 'Get suppliers by supplier group' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  async getSuppliersByGroup(@Param('groupId') groupId: string): Promise<Supplier[]> {
    return this.suppliersService.getSuppliersByGroup(groupId);
  }

  @Get('by-gst-category/:category')
  @ApiOperation({ summary: 'Get suppliers by GST category' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  async getSuppliersByGstCategory(@Param('category') category: string): Promise<Supplier[]> {
    return this.suppliersService.getSuppliersByGstCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findOne(@Param('id') id: string): Promise<Supplier> {
    return this.suppliersService.findOne(id);
  }

  @Get(':id/payment-terms')
  @ApiOperation({ summary: 'Get effective payment terms for supplier' })
  @ApiResponse({ status: 200, description: 'Payment terms retrieved successfully' })
  async getPaymentTerms(@Param('id') id: string): Promise<string | null> {
    return this.suppliersService.getEffectivePaymentTerms(id);
  }

  @Get(':id/price-list')
  @ApiOperation({ summary: 'Get effective price list for supplier' })
  @ApiResponse({ status: 200, description: 'Price list retrieved successfully' })
  async getPriceList(@Param('id') id: string): Promise<string | null> {
    return this.suppliersService.getEffectivePriceList(id);
  }

  @Get(':id/validate-rfq')
  @ApiOperation({ summary: 'Validate if RFQ can be created for supplier' })
  @ApiResponse({ status: 200, description: 'RFQ validation result' })
  async validateRfq(@Param('id') id: string): Promise<{
    canCreate: boolean;
    warning?: string;
    reason?: string;
  }> {
    return this.suppliersService.validateRfqCreation(id);
  }

  @Get(':id/validate-po')
  @ApiOperation({ summary: 'Validate if Purchase Order can be created for supplier' })
  @ApiResponse({ status: 200, description: 'PO validation result' })
  async validatePo(@Param('id') id: string): Promise<{
    canCreate: boolean;
    warning?: string;
    reason?: string;
  }> {
    return this.suppliersService.validatePurchaseOrderCreation(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 409, description: 'Supplier name or code already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiResponse({ status: 204, description: 'Supplier deleted successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.suppliersService.remove(id);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle supplier active/disabled status' })
  @ApiResponse({ status: 200, description: 'Supplier status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async toggleSupplierStatus(@Param('id') id: string): Promise<Supplier> {
    return this.suppliersService.toggleSupplierStatus(id);
  }

  @Patch(':id/hold-status')
  @ApiOperation({ summary: 'Update supplier hold status' })
  @ApiResponse({ status: 200, description: 'Supplier hold status updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async updateHoldStatus(
    @Param('id') id: string,
    @Body('holdType') holdType: string,
    @Body('releaseDate') releaseDate?: string,
  ): Promise<Supplier> {
    return this.suppliersService.updateHoldStatus(id, holdType, releaseDate);
  }

  @Patch('bulk-update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk update suppliers' })
  @ApiResponse({ status: 204, description: 'Suppliers updated successfully' })
  @ApiResponse({ status: 400, description: 'No supplier IDs provided' })
  async bulkUpdateSuppliers(
    @Body('supplierIds') supplierIds: string[],
    @Body('updateData') updateData: Partial<UpdateSupplierDto>,
  ): Promise<void> {
    return this.suppliersService.bulkUpdateSuppliers(supplierIds, updateData);
  }
}