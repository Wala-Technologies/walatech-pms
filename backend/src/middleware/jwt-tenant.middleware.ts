import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TenantsService } from '../modules/tenants/services/tenants.service';
import { Tenant } from '../entities/tenant.entity';
import { User } from '../entities/user.entity';

// Extend Express Request interface to include tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      tenantId?: string;
      user?: User | undefined;
    }
  }
}

@Injectable()
export class JwtTenantMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantsService: TenantsService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Skip tenant resolution for auth routes and health checks
      if (this.shouldSkipTenantResolution(req.path)) {
        return next();
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No valid authorization token provided');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      try {
        // Verify and decode the JWT token
        const payload = this.jwtService.verify(token);
        
        // Extract tenant_id from JWT payload
        const tenantId = payload.tenant_id;
        if (!tenantId) {
          throw new UnauthorizedException('No tenant information in token');
        }

        // Find and validate tenant
        const tenant = await this.tenantsService.findOne(tenantId);
        if (!tenant) {
          throw new UnauthorizedException(`Tenant not found: ${tenantId}`);
        }

        if (tenant.status !== 'active') {
          throw new UnauthorizedException(`Tenant is not active: ${tenant.status}`);
        }

        // Add tenant and user info to request context
        req.tenant = tenant;
        req.tenantId = tenant.id;
        req.user = {
          id: payload.sub,
          email: payload.email,
          tenantId: payload.tenant_id,
        };

        next();
      } catch (jwtError) {
        throw new UnauthorizedException('Invalid or expired token');
      }
    } catch (error) {
      next(error);
    }
  }

  private shouldSkipTenantResolution(path: string): boolean {
    const skipPaths = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/health',
      '/docs',
      '/swagger',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/health',
      '/api/docs',
      '/api/swagger',
    ];

    return skipPaths.some(skipPath => path.startsWith(skipPath));
  }
}