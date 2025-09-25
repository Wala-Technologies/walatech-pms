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
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerQueryDto } from '../dto/customer-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Customer } from '../../../entities/customer.entity';

@ApiTags('customers')
@Controller({ path: 'customers', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 409, description: 'Customer already exists' })
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  async findAll(@Query() query: CustomerQueryDto): Promise<{ customers: Customer[]; total: number }> {
    return this.customersService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get customer statistics' })
  @ApiResponse({ status: 200, description: 'Customer statistics retrieved successfully' })
  async getCustomerStats(): Promise<{
    total: number;
    active: number;
    frozen: number;
    disabled: number;
    byType: { [key: string]: number };
    byCountry: { [key: string]: number };
  }> {
    return this.customersService.getCustomerStats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search customers by name, email, or code' })
  @ApiResponse({ status: 200, description: 'Customers found successfully' })
  async searchCustomers(
    @Query('q') searchTerm: string,
    @Query('limit') limit: number = 10,
  ): Promise<Customer[]> {
    return this.customersService.searchCustomers(searchTerm, limit);
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get customers by type' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  async getCustomersByType(@Param('type') type: string): Promise<Customer[]> {
    return this.customersService.getCustomersByType(type);
  }

  @Get('by-country/:country')
  @ApiOperation({ summary: 'Get customers by country' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  async getCustomersByCountry(@Param('country') country: string): Promise<Customer[]> {
    return this.customersService.getCustomersByCountry(country);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id') id: string): Promise<Customer> {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Customer name or code already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.customersService.remove(id);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle customer active/disabled status' })
  @ApiResponse({ status: 200, description: 'Customer status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async toggleCustomerStatus(@Param('id') id: string): Promise<Customer> {
    return this.customersService.toggleCustomerStatus(id);
  }

  @Patch(':id/toggle-frozen')
  @ApiOperation({ summary: 'Toggle customer frozen status' })
  @ApiResponse({ status: 200, description: 'Customer frozen status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async toggleFrozenStatus(@Param('id') id: string): Promise<Customer> {
    return this.customersService.toggleFrozenStatus(id);
  }

  @Patch('bulk-update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk update customers' })
  @ApiResponse({ status: 204, description: 'Customers updated successfully' })
  @ApiResponse({ status: 400, description: 'No customer IDs provided' })
  async bulkUpdateCustomers(
    @Body('customerIds') customerIds: string[],
    @Body('updateData') updateData: Partial<UpdateCustomerDto>,
  ): Promise<void> {
    return this.customersService.bulkUpdateCustomers(customerIds, updateData);
  }
}