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
import { EmployeesService } from '../services/employees.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { EmployeeQueryDto } from '../dto/employee-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Employee } from '../entities/employee.entity';

@ApiTags('employees')
@Controller({ path: 'hr/employees', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 409, description: 'Employee already exists' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  async findAll(@Query() query: EmployeeQueryDto): Promise<{ employees: Employee[]; total: number }> {
    return this.employeesService.findAll(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active employees' })
  @ApiResponse({ status: 200, description: 'Active employees retrieved successfully' })
  async getActiveEmployees(): Promise<Employee[]> {
    return this.employeesService.getActiveEmployees();
  }

  @Get('by-department/:departmentId')
  @ApiOperation({ summary: 'Get employees by department' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  async getEmployeesByDepartment(@Param('departmentId') departmentId: string): Promise<Employee[]> {
    return this.employeesService.getEmployeesByDepartment(departmentId);
  }

  @Get('by-name/:name')
  @ApiOperation({ summary: 'Get employee by name/ID' })
  @ApiResponse({ status: 200, description: 'Employee found successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findByName(@Param('name') name: string): Promise<Employee> {
    return this.employeesService.findByName(name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee found successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findOne(@Param('id') id: string): Promise<Employee> {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 409, description: 'Employee data conflict' })
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an employee' })
  @ApiResponse({ status: 204, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.employeesService.remove(id);
  }
}