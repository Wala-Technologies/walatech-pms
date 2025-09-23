import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkOrderTaskService } from '../services/work-order-task.service';
import { TaskStatus } from '../../../entities/work-order-task.entity';

@Controller('work-order-tasks')
@UseGuards(JwtAuthGuard)
export class WorkOrderTaskController {
  constructor(private readonly taskService: WorkOrderTaskService) {}

  @Get('work-order/:workOrderId')
  async findByWorkOrder(@Param('workOrderId', ParseUUIDPipe) workOrderId: string, @Request() req: any) {
    return await this.taskService.findByWorkOrder(workOrderId, req.user.tenant_id);
  }

  @Get('statistics')
  async getStatistics(@Request() req: any, @Query('workOrderId') workOrderId?: string) {
    return await this.taskService.getTaskStatistics(workOrderId, req.user.tenant_id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return await this.taskService.findOne(id, req.user.tenant_id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TaskStatus,
    @Request() req: any,
  ) {
    return await this.taskService.updateStatus(id, status, req.user.tenant_id);
  }

  @Patch(':id/progress')
  async updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('progressPercentage', ParseIntPipe) progressPercentage: number,
    @Request() req: any,
  ) {
    return await this.taskService.updateProgress(id, progressPercentage, req.user.tenant_id);
  }

  @Patch(':id/notes')
  async addNotes(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('notes') notes: string,
    @Request() req: any,
  ) {
    return await this.taskService.addNotes(id, notes, req.user.tenant_id);
  }

  @Patch(':id/completion-notes')
  async addCompletionNotes(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('completionNotes') completionNotes: string,
    @Request() req: any,
  ) {
    return await this.taskService.addCompletionNotes(id, completionNotes, req.user.tenant_id);
  }
}