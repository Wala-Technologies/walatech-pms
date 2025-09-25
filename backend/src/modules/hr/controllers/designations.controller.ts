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
  Query,
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
import { DesignationsService } from '../services/designations.service';
import { CreateDesignationDto } from '../dto/create-designation.dto';
import { UpdateDesignationDto } from '../dto/update-designation.dto';
import { Designation } from '../entities/designation.entity';

@ApiTags('Designations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/designations')
export class DesignationsController {
  constructor(private readonly designationsService: DesignationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new designation' })
  @ApiResponse({
    status: 201,
    description: 'Designation created successfully',
    type: Designation,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Designation with this name already exists' })
  async create(
    @Body() createDesignationDto: CreateDesignationDto,
    @Request() req: any,
  ): Promise<Designation> {
    return this.designationsService.create(
      createDesignationDto,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all designations' })
  @ApiResponse({
    status: 200,
    description: 'List of designations retrieved successfully',
    type: [Designation],
  })
  async findAll(@Request() req: any): Promise<Designation[]> {
    return this.designationsService.findAll(req.user.tenantId);
  }

  @Get('with-employee-count')
  @ApiOperation({ summary: 'Get designations with employee count' })
  @ApiResponse({
    status: 200,
    description: 'Designations with employee count retrieved successfully',
  })
  async getWithEmployeeCount(@Request() req: any): Promise<any[]> {
    return this.designationsService.getDesignationsWithEmployeeCount(req.user.tenantId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search designations' })
  @ApiQuery({ name: 'q', description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [Designation],
  })
  async search(
    @Query('q') searchTerm: string,
    @Request() req: any,
  ): Promise<Designation[]> {
    return this.designationsService.searchDesignations(searchTerm, req.user.tenantId);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get designation by name' })
  @ApiParam({ name: 'name', description: 'Designation name' })
  @ApiResponse({
    status: 200,
    description: 'Designation retrieved successfully',
    type: Designation,
  })
  @ApiResponse({ status: 404, description: 'Designation not found' })
  async findByName(
    @Param('name') name: string,
    @Request() req: any,
  ): Promise<Designation> {
    return this.designationsService.findByName(name, req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get designation by ID' })
  @ApiParam({ name: 'id', description: 'Designation ID' })
  @ApiResponse({
    status: 200,
    description: 'Designation retrieved successfully',
    type: Designation,
  })
  @ApiResponse({ status: 404, description: 'Designation not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<Designation> {
    return this.designationsService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update designation' })
  @ApiParam({ name: 'id', description: 'Designation ID' })
  @ApiResponse({
    status: 200,
    description: 'Designation updated successfully',
    type: Designation,
  })
  @ApiResponse({ status: 404, description: 'Designation not found' })
  @ApiResponse({ status: 409, description: 'Designation with this name already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateDesignationDto: UpdateDesignationDto,
    @Request() req: any,
  ): Promise<Designation> {
    return this.designationsService.update(
      id,
      updateDesignationDto,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete designation' })
  @ApiParam({ name: 'id', description: 'Designation ID' })
  @ApiResponse({ status: 200, description: 'Designation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Designation not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete designation that is assigned to employees' })
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.designationsService.remove(id, req.user.tenantId);
  }
}