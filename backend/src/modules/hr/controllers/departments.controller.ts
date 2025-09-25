import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Scope,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from '../services/departments.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Department } from '../entities/department.entity';

@ApiTags('departments')
@Controller({ path: 'hr/departments', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 409, description: 'Department already exists' })
  async create(@Body() createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  async findAll(): Promise<Department[]> {
    return this.departmentsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active departments' })
  @ApiResponse({ status: 200, description: 'Active departments retrieved successfully' })
  async getActiveDepartments(): Promise<Department[]> {
    return this.departmentsService.getActiveDepartments();
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get department hierarchy' })
  @ApiResponse({ status: 200, description: 'Department hierarchy retrieved successfully' })
  async getDepartmentHierarchy(): Promise<Department[]> {
    return this.departmentsService.getDepartmentHierarchy();
  }

  @Get('by-name/:name')
  @ApiOperation({ summary: 'Get department by name' })
  @ApiResponse({ status: 200, description: 'Department found successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findByName(@Param('name') name: string): Promise<Department> {
    return this.departmentsService.findByName(name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, description: 'Department found successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findOne(@Param('id') id: string): Promise<Department> {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 409, description: 'Department data conflict' })
  async update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a department' })
  @ApiResponse({ status: 204, description: 'Department deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete department with employees' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.departmentsService.remove(id);
  }
}