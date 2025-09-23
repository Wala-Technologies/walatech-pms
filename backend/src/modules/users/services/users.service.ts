import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import * as bcrypt from 'bcryptjs';
import { User } from '../../../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { TenantScopedService } from '../../../common/services/tenant-scoped.service';

@Injectable({ scope: Scope.REQUEST })
export class UsersService extends TenantScopedService<User> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(REQUEST) request: Request,
  ) {
    super(userRepository, request);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, phone, role, department, ...userData } = createUserDto;

    // Check if user already exists within tenant
    const existingUser = await this.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Map DTO properties to entity properties
    const entityData: any = { ...userData };
    if (phone) {
      entityData.mobile_no = phone;
    }
    if (role) {
      entityData.role_profile_name = role;
    }
    // department is not mapped to entity

    // Create user with tenant context
    const userDataToCreate = {
      ...entityData,
      email,
      password: hashedPassword,
      enabled: true,
      time_zone: 'Africa/Addis_Ababa',
    };

    const savedUser = await this.create(userDataToCreate);

    // Ensure savedUser is a single user object, not an array
    const userResult = Array.isArray(savedUser) ? savedUser[0] : savedUser;

    // Remove password from response
    const { password: _, ...userWithoutPassword } = userResult;
    return userWithoutPassword as User;
  }

  async findAllUsers(query: UserQueryDto): Promise<{ users: User[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      department,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.createQueryBuilder('user');

    // Search functionality
    if (search) {
      queryBuilder.where(
        '(user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by role
    if (role) {
      queryBuilder.andWhere('user.role_profile_name = :role', { role });
    }

    // Filter by status (enabled/disabled)
    if (status !== undefined) {
      const enabled = status === 'active';
      queryBuilder.andWhere('user.enabled = :enabled', { enabled });
    }

    // Department filtering not available in current entity schema
    // if (department) {
    //   queryBuilder.andWhere('user.department = :department', { department });
    // }

    // Sorting
    const validSortFields = ['creation', 'modified', 'first_name', 'last_name', 'email'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'creation';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder as 'ASC' | 'DESC');

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const [users, total] = await queryBuilder.getManyAndCount();

    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });

    return {
      users: usersWithoutPasswords,
      total,
    };
  }

  async findOne(options: any): Promise<User | null> {
    const user = await super.findOne(options);

    if (!user) {
      return null;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await super.findOne({
         where: { email: updateUserDto.email },
       });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Map DTO properties to entity properties
    const updateData: any = { ...updateUserDto };
    if (updateUserDto.phone) {
      updateData.mobile_no = updateUserDto.phone;
      delete updateData.phone;
    }
    if (updateUserDto.role) {
      updateData.role_profile_name = updateUserDto.role;
      delete updateData.role;
    }
    delete updateData.department; // Not mapped to entity

    // Update user
    const updatedUser = await super.update(id, updateData);

    return this.findUserById(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await super.remove(id);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;
    
    const user = await super.findOne({ 
       where: { id },
       select: ['id', 'password']
     });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await super.update(id, {
       password: hashedNewPassword,
     });
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await super.update(id, {
       password: hashedPassword,
     });
  }

  async toggleUserStatus(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Toggle enabled status
    await super.update(id, {
       enabled: !user.enabled,
     });

    return this.findUserById(id);
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: { [key: string]: number };
    byDepartment: { [key: string]: number };
  }> {
    const total = await this.count();
     const active = await this.count({ where: { enabled: true } });
     const inactive = await this.count({ where: { enabled: false } });

    // Get users by role
    const roleStats = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role_profile_name', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('user.tenant_id = :tenant_id', { tenant_id: this.gettenant_id() })
      .groupBy('user.role_profile_name')
      .getRawMany();

    const byRole = roleStats.reduce((acc, stat) => {
      acc[stat.role || 'No Role'] = parseInt(stat.count);
      return acc;
    }, {});

    // Department stats not available in current entity schema
    const byDepartment = {};

    return {
      total,
      active,
      inactive,
      byRole,
      byDepartment,
    };
  }

  async bulkUpdateUsers(userIds: string[], updateData: Partial<UpdateUserDto>): Promise<void> {
    if (userIds.length === 0) {
      throw new BadRequestException('No user IDs provided');
    }

    // Map DTO properties to entity properties
    const mappedData: any = { ...updateData };
    if (updateData.phone) {
      mappedData.mobile_no = updateData.phone;
      delete mappedData.phone;
    }
    if (updateData.role) {
      mappedData.role_profile_name = updateData.role;
      delete mappedData.role;
    }
    delete mappedData.department; // Not mapped to entity

    // Bulk update using repository directly with tenant scoping
     const repository = this.getRepository();
     await repository.update(userIds, mappedData);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const queryBuilder = this.createQueryBuilder('user')
      .where('user.tenant_id = :tenant_id', { tenant_id: this.gettenant_id() })
      .andWhere('user.role_profile_name = :role', { role })
      .orderBy('user.first_name', 'ASC');

    const users = await queryBuilder.getMany();

    // Remove passwords from response
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await super.findOne({
       where: { email },
     });
  }

  // Department functionality not available in current entity schema
  async getUsersByDepartment(department: string): Promise<User[]> {
    // Return empty array since department is not mapped to entity
    return [];
  }
}