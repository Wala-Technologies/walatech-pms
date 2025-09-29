import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';
import type { Tenant } from '../../../entities/tenant.entity';

interface AuthRequest extends ExpressRequest {
  tenant?: Tenant;
  user?: {
    id: string;
    email: string;
    tenant_id?: string;
    isSuperAdmin?: boolean;
    [key: string]: unknown;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Request() req: AuthRequest,
  ) {
    return this.authService.register(registerDto, req.tenant);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req: AuthRequest) {
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.E2E_DEBUG === 'true'
    ) {
      // Temporary diagnostic logging
      const diagnostic: Record<string, unknown> = {
        email: loginDto.email,
        hasTenant: Boolean(req.tenant),
        tenantSubdomain: req.tenant?.subdomain,
        explicitSubdomain: (loginDto as unknown as { subdomain?: string })
          .subdomain,
      };
      console.debug('[AuthController.login] incoming', diagnostic);
    }
    // Pass along resolved tenant (if any) so service can enforce tenant scoping
    return this.authService.login(loginDto, req.tenant);
  }

  // Stateless logout endpoint (client should discard token)
  @Post('logout')
  logout() {
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: AuthRequest) {
    if (!req.user) {
      throw new Error('User not found in request');
    }
    const { id, email, tenant_id, isSuperAdmin, ...rest } = req.user;
    return {
      user: { id, email, tenant_id, isSuperAdmin, ...rest },
    };
  }
}
