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
import { ShiftTypesService } from '../services/shift-types.service';
import { CreateShiftTypeDto } from '../dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from '../dto/update-shift-type.dto';
import { ShiftType } from '../entities/shift-type.entity';

@ApiTags('Shift Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/shift-types')
export class ShiftTypesController {
  constructor(private readonly shiftTypesService: ShiftTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shift type' })
  @ApiResponse({
    status: 201,
    description: 'Shift type created successfully',
    type: ShiftType,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Shift type with this name already exists' })
  async create(
    @Body() createShiftTypeDto: CreateShiftTypeDto,
    @Request() req: any,
  ): Promise<ShiftType> {
    return this.shiftTypesService.create(
      createShiftTypeDto,
      req.user.tenant_id,
      req.user.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all shift types' })
  @ApiResponse({
    status: 200,
    description: 'List of shift types retrieved successfully',
    type: [ShiftType],
  })
  async findAll(@Request() req: any): Promise<ShiftType[]> {
    return this.shiftTypesService.findAll(req.user.tenant_id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active shift types' })
  @ApiResponse({
    status: 200,
    description: 'List of active shift types retrieved successfully',
    type: [ShiftType],
  })
  async getActiveShiftTypes(@Request() req: any): Promise<ShiftType[]> {
    return this.shiftTypesService.getActiveShiftTypes(req.user.tenant_id);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current shift type based on time' })
  @ApiResponse({
    status: 200,
    description: 'Current shift type retrieved successfully',
    type: ShiftType,
  })
  async getCurrentShift(@Request() req: any): Promise<ShiftType | null> {
    return this.shiftTypesService.getCurrentShift(req.user.tenant_id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get shift types with statistics' })
  @ApiResponse({
    status: 200,
    description: 'Shift types with statistics retrieved successfully',
  })
  async getStats(@Request() req: any): Promise<any[]> {
    return this.shiftTypesService.getShiftTypesWithStats(req.user.tenant_id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get shift type by name' })
  @ApiParam({ name: 'name', description: 'Shift type name' })
  @ApiResponse({
    status: 200,
    description: 'Shift type retrieved successfully',
    type: ShiftType,
  })
  @ApiResponse({ status: 404, description: 'Shift type not found' })
  async findByName(
    @Param('name') name: string,
    @Request() req: any,
  ): Promise<ShiftType> {
    return this.shiftTypesService.findByName(name, req.user.tenant_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shift type by ID' })
  @ApiParam({ name: 'id', description: 'Shift type ID' })
  @ApiResponse({
    status: 200,
    description: 'Shift type retrieved successfully',
    type: ShiftType,
  })
  @ApiResponse({ status: 404, description: 'Shift type not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ShiftType> {
    return this.shiftTypesService.findOne(id, req.user.tenant_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update shift type' })
  @ApiParam({ name: 'id', description: 'Shift type ID' })
  @ApiResponse({
    status: 200,
    description: 'Shift type updated successfully',
    type: ShiftType,
  })
  @ApiResponse({ status: 404, description: 'Shift type not found' })
  @ApiResponse({ status: 409, description: 'Shift type with this name already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateShiftTypeDto: UpdateShiftTypeDto,
    @Request() req: any,
  ): Promise<ShiftType> {
    return this.shiftTypesService.update(
      id,
      updateShiftTypeDto,
      req.user.tenant_id,
      req.user.userId,
    );
  }

  @Patch(':id/sync')
  @ApiOperation({ summary: 'Update last sync time for shift type' })
  @ApiParam({ name: 'id', description: 'Shift type ID' })
  @ApiResponse({ status: 200, description: 'Sync time updated successfully' })
  @ApiResponse({ status: 404, description: 'Shift type not found' })
  async updateSyncTime(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    return this.shiftTypesService.updateLastSyncTime(id, req.user.tenant_id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete shift type' })
  @ApiParam({ name: 'id', description: 'Shift type ID' })
  @ApiResponse({ status: 200, description: 'Shift type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Shift type not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete shift type that is being used' })
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.shiftTypesService.remove(id, req.user.tenant_id);
  }
}