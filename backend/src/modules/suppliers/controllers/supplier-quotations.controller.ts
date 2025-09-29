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
import { SupplierQuotationsService } from '../services/supplier-quotations.service';
import { CreateSupplierQuotationDto } from '../dto/create-supplier-quotation.dto';
import { UpdateSupplierQuotationDto } from '../dto/update-supplier-quotation.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SupplierQuotation } from '../../../entities/supplier-quotation.entity';

@ApiTags('supplier-quotations')
@Controller({ path: 'supplier-quotations', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupplierQuotationsController {
  constructor(private readonly supplierQuotationsService: SupplierQuotationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier quotation' })
  @ApiResponse({ status: 201, description: 'Supplier quotation created successfully' })
  @ApiResponse({ status: 409, description: 'Quotation number already exists' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async create(@Body() createQuotationDto: CreateSupplierQuotationDto): Promise<SupplierQuotation> {
    return this.supplierQuotationsService.create(createQuotationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all supplier quotations with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Supplier quotations retrieved successfully' })
  async findAll(@Query() query: any): Promise<{ quotations: SupplierQuotation[]; total: number }> {
    return this.supplierQuotationsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get supplier quotation statistics' })
  @ApiResponse({ status: 200, description: 'Quotation statistics retrieved successfully' })
  async getQuotationStats(): Promise<{
    total: number;
    byStatus: { [key: string]: number };
    bySupplier: { [key: string]: number };
    totalValue: number;
    averageValue: number;
  }> {
    return this.supplierQuotationsService.getQuotationStats();
  }

  @Post('compare')
  @ApiOperation({ summary: 'Compare multiple supplier quotations' })
  @ApiResponse({ status: 200, description: 'Quotations compared successfully' })
  @ApiResponse({ status: 409, description: 'At least 2 quotations required for comparison' })
  async compareQuotations(@Body('quotationIds') quotationIds: string[]): Promise<{
    quotations: SupplierQuotation[];
    comparison: any;
  }> {
    return this.supplierQuotationsService.compareQuotations(quotationIds);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier quotation by ID' })
  @ApiResponse({ status: 200, description: 'Supplier quotation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Supplier quotation not found' })
  async findOne(@Param('id') id: string): Promise<SupplierQuotation> {
    return this.supplierQuotationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier quotation' })
  @ApiResponse({ status: 200, description: 'Supplier quotation updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier quotation not found' })
  @ApiResponse({ status: 409, description: 'Cannot update quotation with current status' })
  async update(
    @Param('id') id: string,
    @Body() updateQuotationDto: UpdateSupplierQuotationDto,
  ): Promise<SupplierQuotation> {
    return this.supplierQuotationsService.update(id, updateQuotationDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update supplier quotation status' })
  @ApiResponse({ status: 200, description: 'Quotation status updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier quotation not found' })
  @ApiResponse({ status: 409, description: 'Invalid status transition' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<SupplierQuotation> {
    return this.supplierQuotationsService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a supplier quotation' })
  @ApiResponse({ status: 204, description: 'Supplier quotation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Supplier quotation not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete quotation that has been ordered' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.supplierQuotationsService.remove(id);
  }
}