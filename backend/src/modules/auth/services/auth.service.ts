import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../../entities/user.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtPayloadWithTenant } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; access_token: string }> {
    const { email, password, first_name, last_name, language = 'en' } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Get default tenant (walatech)
    const defaultTenant = await this.tenantRepository.findOne({ 
      where: { subdomain: 'walatech' } 
    });
    
    if (!defaultTenant) {
      throw new UnauthorizedException('Default tenant not found. Please contact administrator.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with tenant_id
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      language,
      time_zone: 'Africa/Addis_Ababa',
      tenant_id: defaultTenant.id,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token with tenant context
    const payload: JwtPayloadWithTenant = { 
      sub: savedUser.id, 
      email: savedUser.email,
      tenant_id: savedUser.tenant_id 
    };
    const access_token = this.jwtService.sign(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: Partial<User>; access_token: string }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is enabled
    if (!user.enabled) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token with tenant context
    const payload: JwtPayloadWithTenant = { 
      sub: user.id, 
      email: user.email,
      tenant_id: user.tenant_id 
    };
    const access_token = this.jwtService.sign(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['tenant']
    });
  }

  async validateUserWithTenant(userId: string, tenantId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId, tenant_id: tenantId },
      relations: ['tenant']
    });
    
    if (!user || !user.tenant) {
      return null;
    }
    
    // Check if tenant is active
    if (user.tenant.status !== 'active') {
      throw new UnauthorizedException('Tenant is not active');
    }
    
    return user;
  }
}