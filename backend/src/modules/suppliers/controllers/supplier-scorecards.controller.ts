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
import { SupplierScorecardsService } from '../services/supplier-scorecards.service';
import { CreateSupplierScorecardDto } from '../dto/create-supplier-scorecard.dto';
import { UpdateSupplierScorecardDto } from '../dto/update-supplier-scorecard.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SupplierScorecard } from '../../../entities/supplier-scorecard.entity';
import { Supplier } from '../../../entities/supplier.entity';

@ApiTags('supplier-scorecards')
@Controller({ path: 'supplier-scorecards', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupplierScorecardsController {
  constructor(private readonly supplierScorecardsService: SupplierScorecardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier scorecard' })
  @ApiResponse({ status: 201, description: 'Supplier scorecard created successfully' })
  @ApiResponse({ status: 409, description: 'Scorecard already exists for this supplier and period' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async create(@Body() createScorecardDto: CreateSupplierScorecardDto): Promise<SupplierScorecard> {
    return this.supplierScorecardsService.create(createScorecardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all supplier scorecards with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Supplier scorecards retrieved successfully' })
  async findAll(@Query() query: any): Promise<{ scorecards: SupplierScorecard[]; total: number }> {
    return this.supplierScorecardsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get supplier scorecard statistics' })
  @ApiResponse({ status: 200, description: 'Scorecard statistics retrieved successfully' })
  async getScorecardStats(): Promise<{
    total: number;
    byStanding: { [key: string]: number };
    byPeriod: { [key: string]: number };
    averageScore: number;
    topPerformers: SupplierScorecard[];
    poorPerformers: SupplierScorecard[];
  }> {
    return this.supplierScorecardsService.getScorecardStats();
  }

  @Get('supplier/:supplierId')
  @ApiOperation({ summary: 'Get all scorecards for a specific supplier' })
  @ApiResponse({ status: 200, description: 'Supplier scorecards retrieved successfully' })
  async findBySupplier(@Param('supplierId') supplierId: string): Promise<SupplierScorecard[]> {
    return this.supplierScorecardsService.findBySupplier(supplierId);
  }

  @Get('supplier/:supplierId/performance-trend')
  @ApiOperation({ summary: 'Get supplier performance trend analysis' })
  @ApiResponse({ status: 200, description: 'Supplier performance trend retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async getSupplierPerformanceTrend(@Param('supplierId') supplierId: string): Promise<{
    supplier: Supplier;
    scorecards: SupplierScorecard[];
    trend: 'improving' | 'declining' | 'stable';
    trendPercentage: number;
  }> {
    return this.supplierScorecardsService.getSupplierPerformanceTrend(supplierId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier scorecard by ID' })
  @ApiResponse({ status: 200, description: 'Supplier scorecard retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Supplier scorecard not found' })
  async findOne(@Param('id') id: string): Promise<SupplierScorecard> {
    return this.supplierScorecardsService.findOne(id);
  }

  @Post(':id/calculate-score')
  @ApiOperation({ summary: 'Calculate score for a supplier scorecard' })
  @ApiResponse({ status: 200, description: 'Scorecard score calculated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier scorecard not found' })
  @ApiResponse({ status: 409, description: 'No criteria defined for scorecard' })
  async calculateScore(@Param('id') id: string): Promise<SupplierScorecard> {
    return this.supplierScorecardsService.calculateScore(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier scorecard' })
  @ApiResponse({ status: 200, description: 'Supplier scorecard updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier scorecard not found' })
  @ApiResponse({ status: 409, description: 'Scorecard already exists for this supplier and period' })
  async update(
    @Param('id') id: string,
    @Body() updateScorecardDto: UpdateSupplierScorecardDto,
  ): Promise<SupplierScorecard> {
    return this.supplierScorecardsService.update(id, updateScorecardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a supplier scorecard' })
  @ApiResponse({ status: 204, description: 'Supplier scorecard deleted successfully' })
  @ApiResponse({ status: 404, description: 'Supplier scorecard not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.supplierScorecardsService.remove(id);
  }
}