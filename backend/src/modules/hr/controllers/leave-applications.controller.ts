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
import { LeaveApplicationsService } from '../services/leave-applications.service';
import { CreateLeaveApplicationDto } from '../dto/create-leave-application.dto';
import { UpdateLeaveApplicationDto } from '../dto/update-leave-application.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LeaveApplication, LeaveApplicationStatus } from '../entities/leave-application.entity';

@ApiTags('leave-applications')
@Controller({ path: 'hr/leave-applications', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeaveApplicationsController {
  constructor(private readonly leaveApplicationsService: LeaveApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new leave application' })
  @ApiResponse({ status: 201, description: 'Leave application created successfully' })
  @ApiResponse({ status: 409, description: 'Leave application overlaps with existing leave' })
  async create(@Body() createLeaveApplicationDto: CreateLeaveApplicationDto): Promise<LeaveApplication> {
    return this.leaveApplicationsService.create(createLeaveApplicationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leave applications' })
  @ApiResponse({ status: 200, description: 'Leave applications retrieved successfully' })
  async findAll(): Promise<LeaveApplication[]> {
    return this.leaveApplicationsService.findAll();
  }

  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get pending leave applications for approval' })
  @ApiResponse({ status: 200, description: 'Pending leave applications retrieved successfully' })
  async findPendingApprovals(@Query('approver_id') approverId?: string): Promise<LeaveApplication[]> {
    return this.leaveApplicationsService.findPendingApprovals(approverId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get leave application statistics' })
  @ApiResponse({ status: 200, description: 'Leave statistics retrieved successfully' })
  async getLeaveStats(
    @Query('employee_id') employeeId?: string,
    @Query('year') year?: string,
  ): Promise<any> {
    return this.leaveApplicationsService.getLeaveStats(employeeId, year);
  }

  @Get('balance/:employeeId/:leaveTypeId')
  @ApiOperation({ summary: 'Get leave balance for employee and leave type' })
  @ApiResponse({ status: 200, description: 'Leave balance retrieved successfully' })
  async getLeaveBalance(
    @Param('employeeId') employeeId: string,
    @Param('leaveTypeId') leaveTypeId: string,
    @Query('year') year?: string,
  ): Promise<any> {
    return this.leaveApplicationsService.getLeaveBalance(employeeId, leaveTypeId, year);
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get leave applications by status' })
  @ApiResponse({ status: 200, description: 'Leave applications retrieved successfully' })
  async findByStatus(@Param('status') status: LeaveApplicationStatus): Promise<LeaveApplication[]> {
    return this.leaveApplicationsService.findByStatus(status);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get leave applications for a specific employee' })
  @ApiResponse({ status: 200, description: 'Employee leave applications retrieved successfully' })
  async findByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('year') year?: string,
  ): Promise<LeaveApplication[]> {
    return this.leaveApplicationsService.findByEmployee(employeeId, year);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a leave application' })
  @ApiResponse({ status: 200, description: 'Leave application approved successfully' })
  @ApiResponse({ status: 400, description: 'Cannot approve this leave application' })
  async approve(
    @Param('id') id: string,
    @Body('approver_id') approverId?: string,
  ): Promise<LeaveApplication> {
    return this.leaveApplicationsService.approve(id, approverId);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a leave application' })
  @ApiResponse({ status: 200, description: 'Leave application rejected successfully' })
  @ApiResponse({ status: 400, description: 'Cannot reject this leave application' })
  async reject(
    @Param('id') id: string,
    @Body('approver_id') approverId?: string,
  ): Promise<LeaveApplication> {
    return this.leaveApplicationsService.reject(id, approverId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a leave application' })
  @ApiResponse({ status: 200, description: 'Leave application cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel this leave application' })
  async cancel(@Param('id') id: string): Promise<LeaveApplication> {
    return this.leaveApplicationsService.cancel(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave application by ID' })
  @ApiResponse({ status: 200, description: 'Leave application found successfully' })
  @ApiResponse({ status: 404, description: 'Leave application not found' })
  async findOne(@Param('id') id: string): Promise<LeaveApplication> {
    return this.leaveApplicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a leave application' })
  @ApiResponse({ status: 200, description: 'Leave application updated successfully' })
  @ApiResponse({ status: 404, description: 'Leave application not found' })
  @ApiResponse({ status: 400, description: 'Cannot update approved/rejected applications' })
  async update(@Param('id') id: string, @Body() updateLeaveApplicationDto: UpdateLeaveApplicationDto): Promise<LeaveApplication> {
    return this.leaveApplicationsService.update(id, updateLeaveApplicationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a leave application' })
  @ApiResponse({ status: 204, description: 'Leave application deleted successfully' })
  @ApiResponse({ status: 404, description: 'Leave application not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete approved applications' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.leaveApplicationsService.remove(id);
  }
}