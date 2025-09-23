import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkOrderService } from '../services/work-order.service';
import { WorkOrderStatus } from '../../../entities/work-order.entity';

@Controller('work-orders')
@UseGuards(JwtAuthGuard)
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  async findAll(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: WorkOrderStatus,
    @Query('productionOrderId') productionOrderId?: string,
  ) {
    return await this.workOrderService.findAll(
      page,
      limit,
      req.user.tenant_id,
      search,
      status,
      productionOrderId,
    );
  }

  @Get('statistics')
  async getStatistics(@Request() req: any) {
    return await this.workOrderService.getStatistics(req.user.tenant_id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return await this.workOrderService.findOne(id, req.user.tenant_id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: WorkOrderStatus,
    @Request() req: any,
  ) {
    return await this.workOrderService.updateStatus(id, status, req.user.tenant_id);
  }

  @Patch(':id/progress')
  async updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('progressPercentage', ParseIntPipe) progressPercentage: number,
    @Request() req: any,
  ) {
    return await this.workOrderService.updateProgress(id, progressPercentage, req.user.tenant_id);
  }
}