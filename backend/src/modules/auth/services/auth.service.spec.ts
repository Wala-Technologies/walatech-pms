import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from '../../../entities/user.entity';
import { RegisterDto } from './../dto/register.dto';
import { LoginDto } from './../dto/login.dto';
import { createMockRepository, TestDataFactory } from '../../../test-utils/test-utils';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
      phone: '+251911234567',
    };

    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const savedUser = TestDataFactory.createUser({
        email: registerDto.email,
        first_name: registerDto.first_name,
        last_name: registerDto.last_name,
        mobile_no: registerDto.phone,
        password: hashedPassword,
      });
      const token = 'jwt-token-123';

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(savedUser as User);
      userRepository.save.mockResolvedValue(savedUser as User);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      jwtService.sign.mockReturnValue(token);

      const result = await service.register(registerDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: hashedPassword,
        first_name: registerDto.first_name,
        last_name: registerDto.last_name,
        mobile_no: registerDto.phone,
        enabled: true,
        role_profile_name: 'user',
        time_zone: 'Africa/Addis_Ababa',
      });
      expect(userRepository.save).toHaveBeenCalledWith(savedUser);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: savedUser.id,
        email: savedUser.email,
        role: savedUser.role_profile_name,
      });
      expect(result).toEqual({
        user: {
          id: savedUser.id,
          email: savedUser.email,
          first_name: savedUser.first_name,
          last_name: savedUser.last_name,
          mobile_no: savedUser.mobile_no,
          role_profile_name: savedUser.role_profile_name,
          language: savedUser.language,
          time_zone: savedUser.time_zone,
          enabled: savedUser.enabled,
          last_login: savedUser.last_login,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt,
        },
        access_token: token,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = TestDataFactory.createUser({ email: registerDto.email });
      userRepository.findOne.mockResolvedValue(existingUser as User);

      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('User with this email already exists')
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle registration with minimal data', async () => {
      const minimalDto: RegisterDto = {
        email: 'minimal@example.com',
        password: 'password123',
        first_name: 'Minimal',
        last_name: 'User',
      };

      const hashedPassword = 'hashedPassword123';
      const savedUser = TestDataFactory.createUser({
        email: minimalDto.email,
        first_name: minimalDto.first_name,
        last_name: minimalDto.last_name,
        password: hashedPassword,
      });
      const token = 'jwt-token-123';

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(savedUser as User);
      userRepository.save.mockResolvedValue(savedUser as User);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      jwtService.sign.mockReturnValue(token);

      const result = await service.register(minimalDto);

      expect(userRepository.create).toHaveBeenCalledWith({
        email: minimalDto.email,
        password: hashedPassword,
        first_name: minimalDto.first_name,
        last_name: minimalDto.last_name,
        enabled: true,
        role_profile_name: 'user',
        time_zone: 'Africa/Addis_Ababa',
      });
      expect(result.user).toBeDefined();
      expect(result.access_token).toEqual(token);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const user = TestDataFactory.createUser({
        email: loginDto.email,
        password: hashedPassword,
      });
      const token = 'jwt-token-123';

      userRepository.findOne.mockResolvedValue(user as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue(token);
      userRepository.save.mockResolvedValue({
        ...user,
        last_login: expect.any(Date),
      } as User);

      const result = await service.login(loginDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role_profile_name,
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...user,
        last_login: expect.any(Date),
      });
      expect(result).toEqual({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          mobile_no: user.mobile_no,
          role_profile_name: user.role_profile_name,
          language: user.language,
          time_zone: user.time_zone,
          enabled: user.enabled,
          last_login: expect.any(Date),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        access_token: token,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const user = TestDataFactory.createUser({ email: loginDto.email });
      userRepository.findOne.mockResolvedValue(user as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is disabled', async () => {
      const user = TestDataFactory.createUser({
        email: loginDto.email,
        enabled: false,
      });
      userRepository.findOne.mockResolvedValue(user as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Account is disabled')
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid JWT payload', async () => {
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        role: 'user',
      };
      const user = TestDataFactory.createUser({
        id: payload.sub,
        email: payload.email,
        role_profile_name: payload.role,
      });

      userRepository.findOne.mockResolvedValue(user as User);

      const result = await service.validateUser(payload);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.sub },
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
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        mobile_no: user.mobile_no,
        role_profile_name: user.role_profile_name,
        language: user.language,
        time_zone: user.time_zone,
        enabled: user.enabled,
        last_login: user.last_login,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });

    it('should return null if user not found', async () => {
      const payload = {
        sub: 'non-existent-id',
        email: 'test@example.com',
        role: 'user',
      };

      userRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(payload);

      expect(result).toBeNull();
    });

    it('should return null if user is disabled', async () => {
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        role: 'user',
      };
      const user = TestDataFactory.createUser({
        id: payload.sub,
        enabled: false,
      });

      userRepository.findOne.mockResolvedValue(user as User);

      const result = await service.validateUser(payload);

      expect(result).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should generate new access token for valid user', async () => {
      const user = TestDataFactory.createUser();
      const newToken = 'new-jwt-token-123';

      jwtService.sign.mockReturnValue(newToken);

      const result = await service.refreshToken(user as any);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role_profile_name,
      });
      expect(result).toEqual({
        access_token: newToken,
      });
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const result = await service.logout();

      expect(result).toEqual({
        message: 'Logged out successfully',
      });
    });
  });
});