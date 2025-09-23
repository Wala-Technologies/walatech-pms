import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UserRole } from '../dto/create-user.dto';
import { UpdateUserDto } from './../dto/update-user.dto';
import { UserQueryDto } from './../dto/user-query.dto';
import { ChangePasswordDto } from './../dto/change-password.dto';
import { TestDataFactory } from '../../../test-utils/test-utils';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            changePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
      phone: '+251911234567',
      role: UserRole.VIEWER,
      department: 'IT',
    };

    it('should create a new user successfully', async () => {
      const expectedUser = TestDataFactory.createUser({
        email: createUserDto.email,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        mobile_no: createUserDto.phone,
        role_profile_name: createUserDto.role,
      });

      usersService.create.mockResolvedValue(expectedUser as any);

      const result = await controller.create(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });

    it('should handle ConflictException from service', async () => {
      usersService.create.mockRejectedValue(
        new ConflictException('User with this email already exists')
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException
      );

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle validation errors', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password: '123', // too short
        first_name: '',
        last_name: '',
      } as CreateUserDto;

      usersService.create.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.create(invalidDto)).rejects.toThrow('Validation failed');
    });
  });

  describe('findAll', () => {
    const queryDto: UserQueryDto = {
      page: 1,
      limit: 10,
      search: 'test',
      role: UserRole.VIEWER,
      status: 'active',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };

    it('should return paginated users', async () => {
      const users = [
        TestDataFactory.createUser({ email: 'user1@example.com' }),
        TestDataFactory.createUser({ email: 'user2@example.com' }),
      ];
      const expectedResult = {
        users,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      usersService.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(queryDto);

      expect(usersService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty query parameters', async () => {
      const emptyResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      usersService.findAll.mockResolvedValue(emptyResult as any);

      const result = await controller.findAll({});

      expect(usersService.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(emptyResult);
    });

    it('should handle large page numbers', async () => {
      const queryWithLargePage = { page: 999, limit: 10 };
      const emptyResult = {
        users: [],
        total: 0,
        page: 999,
        limit: 10,
        totalPages: 0,
      };

      usersService.findAll.mockResolvedValue(emptyResult as any);

      const result = await controller.findAll(queryWithLargePage);

      expect(result).toEqual(emptyResult);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = TestDataFactory.createUser();
      usersService.findOne.mockResolvedValue(user as any);

      const result = await controller.findOne('test-user-id');

      expect(usersService.findOne).toHaveBeenCalledWith('test-user-id');
      expect(result).toEqual(user);
    });

    it('should handle NotFoundException from service', async () => {
      usersService.findOne.mockRejectedValue(
        new NotFoundException('User not found')
      );

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException
      );

      expect(usersService.findOne).toHaveBeenCalledWith('non-existent-id');
    });

    it('should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';
      usersService.findOne.mockRejectedValue(
        new BadRequestException('Invalid user ID format')
      );

      await expect(controller.findOne(invalidId)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = {
      first_name: 'Updated',
      last_name: 'Name',
      phone: '+251911111111',
      role: UserRole.SYSTEM_ADMIN,
      department: 'Management',
    };

    it('should update a user successfully', async () => {
      const updatedUser = TestDataFactory.createUser({
        first_name: updateDto.first_name,
        last_name: updateDto.last_name,
        mobile_no: updateDto.phone,
        role_profile_name: updateDto.role,
      });

      usersService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.update('test-user-id', updateDto);

      expect(usersService.update).toHaveBeenCalledWith('test-user-id', updateDto);
      expect(result).toEqual(updatedUser);
    });

    it('should handle NotFoundException from service', async () => {
      usersService.update.mockRejectedValue(
        new NotFoundException('User not found')
      );

      await expect(controller.update('non-existent-id', updateDto)).rejects.toThrow(
        NotFoundException
      );

      expect(usersService.update).toHaveBeenCalledWith('non-existent-id', updateDto);
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { first_name: 'NewName' };
      const updatedUser = TestDataFactory.createUser({
        first_name: partialUpdate.first_name,
      });

      usersService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.update('test-user-id', partialUpdate);

      expect(usersService.update).toHaveBeenCalledWith('test-user-id', partialUpdate);
      expect(result.first_name).toBe(partialUpdate.first_name);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123',
    };

    it('should change password successfully', async () => {
      usersService.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword('test-user-id', changePasswordDto);

      expect(usersService.changePassword).toHaveBeenCalledWith(
        'test-user-id',
        changePasswordDto
      );
      expect(result).toBeUndefined();
    });

    it('should handle NotFoundException from service', async () => {
      usersService.changePassword.mockRejectedValue(
        new NotFoundException('User not found')
      );

      await expect(
        controller.changePassword('non-existent-id', changePasswordDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle BadRequestException for incorrect current password', async () => {
      usersService.changePassword.mockRejectedValue(
        new BadRequestException('Current password is incorrect')
      );

      await expect(
        controller.changePassword('test-user-id', changePasswordDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle weak new password', async () => {
      const weakPasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: '123', // too weak
      };

      usersService.changePassword.mockRejectedValue(
        new BadRequestException('New password does not meet requirements')
      );

      await expect(
        controller.changePassword('test-user-id', weakPasswordDto)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      usersService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('test-user-id');

      expect(usersService.remove).toHaveBeenCalledWith('test-user-id');
      expect(result).toBeUndefined();
    });

    it('should handle NotFoundException from service', async () => {
      usersService.remove.mockRejectedValue(
        new NotFoundException('User not found')
      );

      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        NotFoundException
      );

      expect(usersService.remove).toHaveBeenCalledWith('non-existent-id');
    });

    it('should handle deletion of non-existent user', async () => {
      usersService.remove.mockRejectedValue(
        new NotFoundException('User not found')
      );

      await expect(controller.remove('deleted-user-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      };

      usersService.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle unexpected errors in findAll', async () => {
      usersService.findAll.mockRejectedValue(new Error('Unexpected error'));

      await expect(controller.findAll({})).rejects.toThrow('Unexpected error');
    });
  });

  describe('input validation', () => {
    it('should handle empty request body for create', async () => {
      const emptyDto = {} as CreateUserDto;
      
      // In real scenario, validation pipes would catch this
      // Here we test that controller can handle the call
      usersService.create.mockRejectedValue(
        new BadRequestException('Validation failed')
      );

      await expect(controller.create(emptyDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should handle malformed query parameters', async () => {
      const malformedQuery = {
        page: 'not-a-number',
        limit: 'invalid',
      } as any;

      // Validation pipes would normally handle this
      usersService.findAll.mockResolvedValue({
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      } as any);

      const result = await controller.findAll(malformedQuery);
      expect(result).toBeDefined();
    });
  });
});