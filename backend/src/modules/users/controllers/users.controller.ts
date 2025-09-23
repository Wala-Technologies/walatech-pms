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
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../../entities/user.entity';
import { CurrentTenant, TenantId } from '../../../decorators/tenant.decorator';

@ApiTags('users')
@Controller({ path: 'users', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query() query: UserQueryDto): Promise<{ users: User[]; total: number }> {
    return this.usersService.findAllUsers(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: { [key: string]: number };
    byDepartment: { [key: string]: number };
  }> {
    return this.usersService.getUserStats();
  }

  @Get('by-role/:role')
  @ApiOperation({ summary: 'Get users by role' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsersByRole(@Param('role') role: string): Promise<User[]> {
    return this.usersService.getUsersByRole(role);
  }

  @Get('by-department/:department')
  @ApiOperation({ summary: 'Get users by department' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsersByDepartment(@Param('department') department: string): Promise<User[]> {
    return this.usersService.getUsersByDepartment(department);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findUserById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch(':id/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 204, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.usersService.changePassword(id, changePasswordDto);
  }

  @Patch(':id/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset user password (admin only)' })
  @ApiResponse({ status: 204, description: 'Password reset successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
  ): Promise<void> {
    return this.usersService.resetPassword(id, newPassword);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle user active/inactive status' })
  @ApiResponse({ status: 200, description: 'User status toggled successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async toggleUserStatus(@Param('id') id: string): Promise<User> {
    return this.usersService.toggleUserStatus(id);
  }

  @Patch('bulk-update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk update users' })
  @ApiResponse({ status: 204, description: 'Users updated successfully' })
  @ApiResponse({ status: 400, description: 'No user IDs provided' })
  async bulkUpdateUsers(
    @Body('userIds') userIds: string[],
    @Body('updateData') updateData: Partial<UpdateUserDto>,
  ): Promise<void> {
    return this.usersService.bulkUpdateUsers(userIds, updateData);
  }
}