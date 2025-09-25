import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LeaveTypesService } from '../services/leave-types.service';
import { CreateLeaveTypeDto } from '../dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from '../dto/update-leave-type.dto';
import { LeaveType } from '../entities/leave-type.entity';

@ApiTags('Leave Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/leave-types')
export class LeaveTypesController {
  constructor(private readonly leaveTypesService: LeaveTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new leave type' })
  @ApiResponse({
    status: 201,
    description: 'Leave type created successfully',
    type: LeaveType,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Leave type with this name already exists' })
  async create(
    @Body() createLeaveTypeDto: CreateLeaveTypeDto,
    @Request() req: any,
  ): Promise<LeaveType> {
    return this.leaveTypesService.create(
      createLeaveTypeDto,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all leave types' })
  @ApiResponse({
    status: 200,
    description: 'List of leave types retrieved successfully',
    type: [LeaveType],
  })
  async findAll(@Request() req: any): Promise<LeaveType[]> {
    return this.leaveTypesService.findAll(req.user.tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get leave types with statistics' })
  @ApiResponse({
    status: 200,
    description: 'Leave types with statistics retrieved successfully',
  })
  async getStats(@Request() req: any): Promise<any[]> {
    return this.leaveTypesService.getLeaveTypesWithStats(req.user.tenantId);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get leave type by name' })
  @ApiParam({ name: 'name', description: 'Leave type name' })
  @ApiResponse({
    status: 200,
    description: 'Leave type retrieved successfully',
    type: LeaveType,
  })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  async findByName(
    @Param('name') name: string,
    @Request() req: any,
  ): Promise<LeaveType> {
    return this.leaveTypesService.findByName(name, req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave type by ID' })
  @ApiParam({ name: 'id', description: 'Leave type ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave type retrieved successfully',
    type: LeaveType,
  })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<LeaveType> {
    return this.leaveTypesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update leave type' })
  @ApiParam({ name: 'id', description: 'Leave type ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave type updated successfully',
    type: LeaveType,
  })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  @ApiResponse({ status: 409, description: 'Leave type with this name already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateLeaveTypeDto: UpdateLeaveTypeDto,
    @Request() req: any,
  ): Promise<LeaveType> {
    return this.leaveTypesService.update(
      id,
      updateLeaveTypeDto,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete leave type' })
  @ApiParam({ name: 'id', description: 'Leave type ID' })
  @ApiResponse({ status: 200, description: 'Leave type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete leave type that is being used' })
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.leaveTypesService.remove(id, req.user.tenantId);
  }
}