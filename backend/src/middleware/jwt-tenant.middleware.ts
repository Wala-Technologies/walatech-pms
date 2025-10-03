import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TenantsService } from '../modules/tenants/services/tenants.service';
import { Tenant } from '../entities/tenant.entity';

interface JwtPayload {
  sub: string; // user id
  email: string;
  tenant_id: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

// Extend Express Request interface to include multi-tenant context
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenant?: Tenant;
      tenant_id?: string;
      isSuperAdmin?: boolean;
    }
    
    // Extend the Passport User interface to include tenant information
    interface User {
      id: string;
      email: string;
      tenant_id?: string;
      isSuperAdmin?: boolean;
      [key: string]: any;
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
      if (this.shouldSkipTenantResolution(req)) {
        return next();
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException(
          'No valid authorization token provided',
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        // Verify and decode the JWT token
        const payload: JwtPayload = this.jwtService.verify(token);

        // Extract tenant_id from JWT payload
        const usertenant_id = payload.tenant_id;
        if (!usertenant_id) {
          throw new UnauthorizedException('No tenant information in token');
        }

        // Find and validate user's tenant
        const userTenant = await this.tenantsService.findOne(usertenant_id);
        if (!userTenant) {
          throw new UnauthorizedException(`Tenant not found: ${usertenant_id}`);
        }

        if (userTenant.status !== 'active') {
          throw new UnauthorizedException(
            `Tenant is not active: ${userTenant.status}`,
          );
        }

        // Determine super admin via configurable subdomain
        const superAdminSubdomain =
          process.env.SUPER_ADMIN_SUBDOMAIN || 'walatech';
        const isSuperAdmin = userTenant.subdomain === superAdminSubdomain;
        
        // Check for tenant switching via header (only for super admins)
        const requestedTenantSubdomain = req.get('x-tenant-subdomain');
        let effectiveTenant = userTenant;
        
        console.log('[JwtTenantMiddleware] Debug info:', {
          userTenantSubdomain: userTenant.subdomain,
          requestedTenantSubdomain,
          isSuperAdmin,
          userTenantId: userTenant.id,
          path: req.path
        });
        
        if (requestedTenantSubdomain && isSuperAdmin && requestedTenantSubdomain !== userTenant.subdomain) {
          // Super admin is requesting access to a different tenant
          const requestedTenant = await this.tenantsService.findBySubdomain(requestedTenantSubdomain);
          if (requestedTenant && requestedTenant.status === 'active') {
            effectiveTenant = requestedTenant;
            console.log('[JwtTenantMiddleware] Tenant switched:', {
              from: userTenant.subdomain,
              to: effectiveTenant.subdomain,
              effectiveTenantId: effectiveTenant.id
            });
          } else {
            console.log('[JwtTenantMiddleware] Tenant switch failed:', {
              requestedSubdomain: requestedTenantSubdomain,
              found: !!requestedTenant,
              status: requestedTenant?.status
            });
          }
        }
        
        if (
          process.env.NODE_ENV !== 'production' &&
          process.env.E2E_DEBUG === 'true'
        ) {
          console.debug(
            '[JwtTenantMiddleware] user',
            payload.sub,
            'tenant',
            userTenant.subdomain,
            'effectiveTenant',
            effectiveTenant.subdomain,
            'isSuperAdmin',
            isSuperAdmin,
          );
        }

        // Add tenant and user info to request context
        req.tenant = effectiveTenant;
        req.tenant_id = effectiveTenant.id;
        req.user = Object.assign(req.user || {}, {
          id: payload.sub,
          email: payload.email,
          tenant_id: usertenant_id,
          isSuperAdmin,
        });
        req.isSuperAdmin = isSuperAdmin;
        
        console.log('[JwtTenantMiddleware] Final request context:', {
          'req.tenant_id': req.tenant_id,
          'req.user.tenant_id': req.user.tenant_id,
          'effectiveTenant.subdomain': effectiveTenant.subdomain,
          'effectiveTenant.id': effectiveTenant.id
        });

        next();
      } catch {
        throw new UnauthorizedException('Invalid or expired token');
      }
    } catch (error) {
      next(error);
    }
  }

  private shouldSkipTenantResolution(req: Request): boolean {
    // Use originalUrl to avoid Express router path truncation ('/') for nested routes
    const fullPath = (req.originalUrl || req.url || '').split('?')[0];
    const publicMatchers: RegExp[] = [
      /^\/(?:api\/)?$/, // root or /api root
      /^\/(?:api\/)?auth\/(login|register|refresh|forgot-password|reset-password)(?:\/|$)/,
      /^\/(?:api\/)?tenants\/(by-subdomain|validate)(?:\/|$)/,
      /^\/(?:api\/)?(health|docs|swagger)(?:\/|$)/,
    ];
    const isPublic = publicMatchers.some((re) => re.test(fullPath));
    if (isPublic) {
      if (
        process.env.NODE_ENV !== 'production' &&
        process.env.E2E_DEBUG === 'true'
      ) {
        console.debug(
          '[JwtTenantMiddleware] Skipping JWT requirement for public path:',
          fullPath,
        );
      }
      return true;
    }
    return false;
  }
}