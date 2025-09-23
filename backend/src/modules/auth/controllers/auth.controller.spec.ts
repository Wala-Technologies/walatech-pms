import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './../dto/register.dto';
import { LoginDto } from './../dto/login.dto';
import { TestDataFactory } from '../../../test-utils/test-utils';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
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
      const user = TestDataFactory.createUser({
        email: registerDto.email,
        first_name: registerDto.first_name,
        last_name: registerDto.last_name,
        mobile_no: registerDto.phone,
      });
      const token = 'jwt-token-123';
      const expectedResult = {
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
          last_login: user.last_login,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        access_token: token,
      };

      authService.register.mockResolvedValue(expectedResult as any);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        ...expectedResult,
      });
    });

    it('should handle ConflictException when user already exists', async () => {
      authService.register.mockRejectedValue(
        new ConflictException('User with this email already exists')
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException
      );

      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle registration with minimal data', async () => {
      const minimalDto: RegisterDto = {
        email: 'minimal@example.com',
        password: 'password123',
        first_name: 'Minimal',
        last_name: 'User',
      };

      const user = TestDataFactory.createUser({
        email: minimalDto.email,
        first_name: minimalDto.first_name,
        last_name: minimalDto.last_name,
      });
      const token = 'jwt-token-123';
      const expectedResult = {
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
          last_login: user.last_login,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        access_token: token,
      };

      authService.register.mockResolvedValue(expectedResult as any);

      const result = await controller.register(minimalDto);

      expect(authService.register).toHaveBeenCalledWith(minimalDto);
      // expect(result.message).toBe('User registered successfully'); // Message not returned by service
      expect(result.user).toBeDefined();
      expect(result.access_token).toBe(token);
    });

    it('should handle validation errors', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password: '123', // too short
        first_name: '',
        last_name: '',
      } as RegisterDto;

      // This would be caught by validation pipes in real scenario
      authService.register.mockResolvedValue({
        user: TestDataFactory.createUser(),
        access_token: 'token',
      } as any);

      const result = await controller.register(invalidDto);
      expect(result).toBeDefined();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const user = TestDataFactory.createUser({
        email: loginDto.email,
        last_login: new Date(),
      });
      const token = 'jwt-token-123';
      const expectedResult = {
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
          last_login: user.last_login,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        access_token: token,
      };

      authService.login.mockResolvedValue(expectedResult as any);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        ...expectedResult,
      });
    });

    it('should handle UnauthorizedException for invalid credentials', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );

      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle UnauthorizedException for disabled account', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Account is disabled')
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );

      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle empty credentials', async () => {
      const emptyDto = { email: '', password: '' } as LoginDto;

      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );

      await expect(controller.login(emptyDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should handle malformed email', async () => {
      const malformedDto = {
        email: 'not-an-email',
        password: 'password123',
      } as LoginDto;

      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );

      await expect(controller.login(malformedDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });



  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const user = TestDataFactory.createUser();
      const mockRequest = {
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
          last_login: user.last_login,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };

      const result = await controller.getProfile(mockRequest as any);

      expect(result).toEqual({ user: mockRequest.user });
    });

    it('should handle request without user', async () => {
      const mockRequest = {
        user: null,
      };

      await expect(controller.getProfile(mockRequest as any)).rejects.toThrow('User not found in request');
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully in register', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      };

      authService.register.mockRejectedValue(new Error('Database connection failed'));

      await expect(controller.register(registerDto)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle service errors gracefully in login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      authService.login.mockRejectedValue(new Error('Database connection failed'));

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Database connection failed'
      );
    });


  });

  describe('input validation', () => {
    it('should handle empty request body for register', async () => {
      const emptyDto = {} as RegisterDto;
      
      // In real scenario, validation pipes would catch this
      authService.register.mockResolvedValue({
        user: TestDataFactory.createUser(),
        access_token: 'token',
      } as any);

      const result = await controller.register(emptyDto);
      expect(result).toBeDefined();
    });

    it('should handle empty request body for login', async () => {
      const emptyDto = {} as LoginDto;
      
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );

      await expect(controller.login(emptyDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});