import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { User } from '../../../entities/user.entity';
import { CreateUserDto, UserRole } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { createMockRepository, TestDataFactory } from '../../../test-utils/test-utils';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
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

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(expectedUser as User);
      userRepository.save.mockResolvedValue(expectedUser as User);

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await service.create(createUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: 'hashedPassword',
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        mobile_no: createUserDto.phone,
        role_profile_name: createUserDto.role,
        enabled: true,
        time_zone: 'Africa/Addis_Ababa',
      });
      expect(userRepository.save).toHaveBeenCalledWith(expectedUser);
      expect(result).toEqual(expectedUser);
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = TestDataFactory.createUser({ email: createUserDto.email });
      userRepository.findOne.mockResolvedValue(existingUser as User);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('User with this email already exists')
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should handle optional fields correctly', async () => {
      const minimalDto: CreateUserDto = {
        email: 'minimal@example.com',
        password: 'password123',
        first_name: 'Minimal',
        last_name: 'User',
      };

      const expectedUser = TestDataFactory.createUser({
        email: minimalDto.email,
        first_name: minimalDto.first_name,
        last_name: minimalDto.last_name,
      });

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(expectedUser as User);
      userRepository.save.mockResolvedValue(expectedUser as User);

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await service.create(minimalDto);

      expect(userRepository.create).toHaveBeenCalledWith({
        email: minimalDto.email,
        password: 'hashedPassword',
        first_name: minimalDto.first_name,
        last_name: minimalDto.last_name,
        enabled: true,
        time_zone: 'Africa/Addis_Ababa',
      });
      expect(result).toEqual(expectedUser);
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

    it('should return paginated users with search and filters', async () => {
      const users = [
        TestDataFactory.createUser({ email: 'user1@example.com' }),
        TestDataFactory.createUser({ email: 'user2@example.com' }),
      ];
      const total = 2;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([users, total]),
      };

      userRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(queryDto);

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        users,
        total,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should handle empty results', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      userRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = TestDataFactory.createUser();
      userRepository.findOne.mockResolvedValue(user as User);

      const result = await service.findOne('test-user-id');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          mobile_no: true,
          role_profile_name: true,
          language: true,
          time_zone: true,
          enabled: true,
          last_login: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = {
      first_name: 'Updated',
      last_name: 'Name',
      phone: '+251911111111',
    };

    it('should update a user successfully', async () => {
      const existingUser = TestDataFactory.createUser();
      const updatedUser = { ...existingUser, ...updateDto, mobile_no: updateDto.phone };

      userRepository.findOne.mockResolvedValue(existingUser as User);
      userRepository.save.mockResolvedValue(updatedUser as User);

      const result = await service.update('test-user-id', updateDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...existingUser,
        first_name: updateDto.first_name,
        last_name: updateDto.last_name,
        mobile_no: updateDto.phone,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123',
    };

    it('should change password successfully', async () => {
      const user = TestDataFactory.createUser({
        password: await bcrypt.hash('oldPassword', 12),
      });

      userRepository.findOne.mockResolvedValue(user as User);
      userRepository.save.mockResolvedValue(user as User);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('newHashedPassword' as never);

      await service.changePassword('test-user-id', changePasswordDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword', user.password);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 12);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...user,
        password: 'newHashedPassword',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword('non-existent-id', changePasswordDto)
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should throw BadRequestException if current password is incorrect', async () => {
      const user = TestDataFactory.createUser();
      userRepository.findOne.mockResolvedValue(user as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.changePassword('test-user-id', changePasswordDto)
      ).rejects.toThrow(new BadRequestException('Current password is incorrect'));
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const user = TestDataFactory.createUser();
      userRepository.findOne.mockResolvedValue(user as User);
      userRepository.remove.mockResolvedValue(user as User);

      await service.remove('test-user-id');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      });
      expect(userRepository.remove).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = TestDataFactory.createUser();
      userRepository.findOne.mockResolvedValue(user as User);

      const result = await service.findByEmail('test@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});