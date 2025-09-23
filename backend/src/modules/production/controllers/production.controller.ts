import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProductionService } from '../services/production.service';
import {
  CreateProductionPlanDto,
  UpdateProductionPlanDto,
  ProductionPlanQueryDto,
  ProductionPlanResponseDto,
} from '../dto/production-plan.dto';
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  WorkOrderQueryDto,
  WorkOrderResponseDto,
} from '../dto/work-order.dto';
import {
  CreateWorkOrderTaskDto,
  UpdateWorkOrderTaskDto,
  WorkOrderTaskQueryDto,
  WorkOrderTaskResponseDto,
} from '../dto/work-order-task.dto';

@ApiTags('Production')
@Controller('production')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  // Production Plan Endpoints
  @Post('plans')
  @ApiOperation({ summary: 'Create a new production plan' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Production plan created successfully',
    type: ProductionPlanResponseDto,
  })
  async createProductionPlan(
    @Body() createDto: CreateProductionPlanDto,
    @Request() req: any,
  ) {
    return await this.productionService.createProductionPlan(
      createDto,
      req.user.tenant_id,
      req.user.sub,
    );
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all production plans' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Production plans retrieved successfully',
  })
  async findAllProductionPlans(
    @Query() query: ProductionPlanQueryDto,
    @Request() req: any,
  ) {
    return await this.productionService.findAllProductionPlans(
      req.user.tenant_id,
      query.page,
      query.limit,
      query.status,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    );
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get production plan by ID' })
  @ApiParam({ name: 'id', description: 'Production plan ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Production plan retrieved successfully',
    type: ProductionPlanResponseDto,
  })
  async findProductionPlanById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return await this.productionService.findProductionPlanById(
      id,
      req.user.tenant_id,
    );
  }

  @Put('plans/:id')
  @ApiOperation({ summary: 'Update production plan' })
  @ApiParam({ name: 'id', description: 'Production plan ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Production plan updated successfully',
    type: ProductionPlanResponseDto,
  })
  async updateProductionPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductionPlanDto,
    @Request() req: any,
  ) {
    return await this.productionService.updateProductionPlan(
      id,
      updateDto,
      req.user.tenant_id,
    );
  }

  @Delete('plans/:id')
  @ApiOperation({ summary: 'Delete production plan' })
  @ApiParam({ name: 'id', description: 'Production plan ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Production plan deleted successfully',
  })
  async deleteProductionPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    await this.productionService.deleteProductionPlan(id, req.user.tenant_id);
  }

  @Post('plans/:id/approve')
  @ApiOperation({ summary: 'Approve production plan' })
  @ApiParam({ name: 'id', description: 'Production plan ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Production plan approved successfully',
    type: ProductionPlanResponseDto,
  })
  async approveProductionPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return await this.productionService.approveProductionPlan(
      id,
      req.user.tenant_id,
      req.user.sub,
    );
  }

  // Work Order Endpoints
  @Post('work-orders')
  @ApiOperation({ summary: 'Create a new work order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Work order created successfully',
    type: WorkOrderResponseDto,
  })
  async createWorkOrder(
    @Body() createDto: CreateWorkOrderDto,
    @Request() req: any,
  ) {
    return await this.productionService.createWorkOrder(
      createDto,
      req.user.tenant_id,
      req.user.sub,
    );
  }

  @Get('work-orders')
  @ApiOperation({ summary: 'Get all work orders' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Work orders retrieved successfully',
  })
  async findAllWorkOrders(
    @Query() query: WorkOrderQueryDto,
    @Request() req: any,
  ) {
    return await this.productionService.findAllWorkOrders(
      req.user.tenant_id,
      query.page,
      query.limit,
      query.status,
      query.productionPlanId,
    );
  }

  @Get('work-orders/:id')
  @ApiOperation({ summary: 'Get work order by ID' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Work order retrieved successfully',
    type: WorkOrderResponseDto,
  })
  async findWorkOrderById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return await this.productionService.findWorkOrderById(id, req.user.tenant_id);
  }

  @Put('work-orders/:id')
  @ApiOperation({ summary: 'Update work order' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Work order updated successfully',
    type: WorkOrderResponseDto,
  })
  async updateWorkOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateWorkOrderDto,
    @Request() req: any,
  ) {
    return await this.productionService.updateWorkOrder(
      id,
      updateDto,
      req.user.tenant_id,
    );
  }

  @Post('work-orders/:id/start')
  @ApiOperation({ summary: 'Start work order' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Work order started successfully',
    type: WorkOrderResponseDto,
  })
  async startWorkOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return await this.productionService.startWorkOrder(id, req.user.tenant_id);
  }

  @Post('work-orders/:id/complete')
  @ApiOperation({ summary: 'Complete work order' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Work order completed successfully',
    type: WorkOrderResponseDto,
  })
  async completeWorkOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return await this.productionService.completeWorkOrder(id, req.user.tenant_id);
  }

  // Work Order Task Endpoints
  @Post('work-orders/:workOrderId/tasks')
  @ApiOperation({ summary: 'Create a new work order task' })
  @ApiParam({ name: 'workOrderId', description: 'Work order ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Work order task created successfully',
    type: WorkOrderTaskResponseDto,
  })
  async createWorkOrderTask(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @Body() createDto: CreateWorkOrderTaskDto,
    @Request() req: any,
  ) {
    createDto.workOrderId = workOrderId;
    return await this.productionService.createWorkOrderTask(
      createDto,
      req.user.tenant_id,
    );
  }

  @Put('tasks/:id')
  @ApiOperation({ summary: 'Update work order task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Work order task updated successfully',
    type: WorkOrderTaskResponseDto,
  })
  async updateWorkOrderTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateWorkOrderTaskDto,
    @Request() req: any,
  ) {
    return await this.productionService.updateWorkOrderTask(
      id,
      updateDto,
      req.user.tenant_id,
    );
  }

  @Post('tasks/:id/start')
  @ApiOperation({ summary: 'Start work order task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task started successfully',
    type: WorkOrderTaskResponseDto,
  })
  async startTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return await this.productionService.startTask(
      id,
      req.user.tenant_id,
      req.user.sub,
    );
  }

  @Post('tasks/:id/complete')
  @ApiOperation({ summary: 'Complete work order task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task completed successfully',
    type: WorkOrderTaskResponseDto,
  })
  async completeTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return await this.productionService.completeTask(
      id,
      req.user.tenant_id,
      req.user.sub,
    );
  }

  // Dashboard and Analytics
  @Get('dashboard')
  @ApiOperation({ summary: 'Get production dashboard data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard data retrieved successfully',
  })
  async getProductionDashboard(@Request() req: any) {
    return await this.productionService.getProductionDashboard(
      req.user.tenant_id,
    );
  }
}