import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../../entities/user.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtPayloadWithTenant } from '../interfaces/jwt-payload.interface';
import { TenantsService } from '../../tenants/services/tenants.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private jwtService: JwtService,
    private tenantsService: TenantsService,
  ) {}

  async register(
    registerDto: RegisterDto,
    tenant?: Tenant,
  ): Promise<{ user: Partial<User>; access_token: string }> {
    const {
      email,
      password,
      first_name,
      last_name,
      language = 'en',
    } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Get tenant - use provided tenant or default to super admin tenant subdomain
    let userTenant: Tenant;
    if (tenant) {
      userTenant = tenant;
    } else {
      // Fallback for requests without tenant context (e.g., direct API calls)
      // Use configurable SUPER_ADMIN_SUBDOMAIN (defaults to 'walatech' if not set)
      const superAdminSubdomain =
        process.env.SUPER_ADMIN_SUBDOMAIN || 'walatech';
      const defaultTenant = await this.tenantRepository.findOne({
        where: { subdomain: superAdminSubdomain },
      });

      if (!defaultTenant) {
        throw new UnauthorizedException(
          `Default tenant (subdomain: ${superAdminSubdomain}) not found. Please contact administrator.`,
        );
      }
      userTenant = defaultTenant;
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
      tenant_id: userTenant.id,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token with tenant context
    const payload: JwtPayloadWithTenant = {
      sub: savedUser.id,
      email: savedUser.email,
      tenant_id: savedUser.tenant_id,
    };
    const access_token = this.jwtService.sign(payload);

    // Remove password from response
    // Exclude password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  async login(
    loginDto: LoginDto,
    requestTenant?: Tenant,
  ): Promise<{ user: Partial<User>; access_token: string }> {
    const { email, password, subdomain } = loginDto as LoginDto & {
      subdomain?: string;
    };

    // If a tenant context exists (subdomain resolved), restrict lookup to that tenant
    // EXCEPT if the subdomain itself is the super admin subdomain: then we still scope
    // login to that tenant only (prevent cross-tenant login from super admin host) unless
    // future requirements introduce explicit cross-tenant impersonation workflow.
    let user: User | null = null;
    if (requestTenant) {
      user = await this.userRepository.findOne({
        where: { email, tenant_id: requestTenant.id },
      });
    } else {
      // Attempt fallback tenant resolution using provided subdomain if supplied
      if (subdomain) {
        const fallbackTenant = await this.tenantRepository.findOne({
          where: { subdomain },
        });
        if (fallbackTenant && fallbackTenant.status === 'active') {
          user = await this.userRepository.findOne({
            where: { email, tenant_id: fallbackTenant.id },
          });
        }
      }
      // Last resort: derive subdomain from email domain prefix (admin@tenant.example -> tenant) if still no user
      if (!user && !subdomain && email.includes('@')) {
        const derived = email.split('@')[1]?.split('.')[0];
        if (derived) {
          const derivedTenant = await this.tenantRepository.findOne({
            where: { subdomain: derived },
          });
          if (derivedTenant && derivedTenant.status === 'active') {
            user = await this.userRepository.findOne({
              where: { email, tenant_id: derivedTenant.id },
            });
            if (process.env.NODE_ENV !== 'production') {
              console.debug(
                '[AuthService.login] Used derived subdomain from email:',
                derived,
                'user found:',
                Boolean(user),
              );
            }
          }
        }
      }
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    if (!user) {
      // To avoid leaking that email exists on another tenant, keep generic error
      throw new UnauthorizedException('Invalid credentials');
    }

    // (Defense in depth removed) Since we constrain lookup by tenant_id, cross-tenant login via super admin host is already prevented.

    if (!user.enabled) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[AuthService.login] Password mismatch for', email);
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[AuthService.login] Successful login', {
        email,
        tenant_id: user.tenant_id,
        usedRequestTenant: Boolean(requestTenant),
        hadExplicitSubdomain: Boolean(subdomain),
      });
    }

    const payload: JwtPayloadWithTenant = {
      sub: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
    };
    const access_token = this.jwtService.sign(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, access_token };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });
  }

  async validateUserWithTenant(
    userId: string,
    tenant_id: string,
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId, tenant_id: tenant_id },
      relations: ['tenant'],
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
