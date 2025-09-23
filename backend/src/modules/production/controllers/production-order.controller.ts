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
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProductionOrderService } from '../services/production-order.service';
import { CreateProductionOrderDto } from '../dto/create-production-order.dto';
import { UpdateProductionOrderDto } from '../dto/update-production-order.dto';
import { ProductionOrderStatus } from '../../../entities/production-order.entity';

@Controller('production-orders')
@UseGuards(JwtAuthGuard)
export class ProductionOrderController {
  constructor(
    private readonly productionOrderService: ProductionOrderService,
  ) {}

  @Post()
  async create(
    @Body() createDto: CreateProductionOrderDto,
    @Request() req: any,
  ) {
    return await this.productionOrderService.create(createDto, req.user.id, req.user.tenant_id);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    // Convert string status to enum if provided
    const statusEnum = status && Object.values(ProductionOrderStatus).includes(status as ProductionOrderStatus) 
      ? status as ProductionOrderStatus 
      : undefined;
    
    return await this.productionOrderService.findAll(page, limit, search, statusEnum, req.user.tenant_id);
  }

  @Get('statistics')
  async getStatistics(@Request() req: any) {
    return await this.productionOrderService.getStatistics(req.user.tenant_id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return await this.productionOrderService.findOne(id, req.user.tenant_id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductionOrderDto,
    @Request() req: any,
  ) {
    // Convert string dates to Date objects
    const entityUpdate: any = { ...updateDto };
    if (updateDto.plannedStartDate) {
      entityUpdate.plannedStartDate = new Date(updateDto.plannedStartDate);
    }
    if (updateDto.plannedEndDate) {
      entityUpdate.plannedEndDate = new Date(updateDto.plannedEndDate);
    }
    if (updateDto.actualStartDate) {
      entityUpdate.actualStartDate = new Date(updateDto.actualStartDate);
    }
    if (updateDto.actualEndDate) {
      entityUpdate.actualEndDate = new Date(updateDto.actualEndDate);
    }
    
    return await this.productionOrderService.update(id, entityUpdate, req.user.tenant_id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    await this.productionOrderService.remove(id, req.user.tenant_id);
    return { message: 'Production order deleted successfully' };
  }
}