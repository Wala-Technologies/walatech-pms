import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from '../modules/tenants/services/tenants.service';
import { Tenant } from '../entities/tenant.entity';

// Extend Express Request interface to include tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      tenant_id?: string;
    }
  }
}

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  constructor(private readonly tenantsService: TenantsService) {}

  // Simple in-memory cache (per instance) to reduce repetitive tenant lookups per subdomain
  private static cache: Map<string, { tenant: Tenant; expires: number }> =
    new Map();
  private static lastCleanup = 0;
  private readonly ttlMs: number = parseInt(
    process.env.TENANT_CACHE_TTL_MS || '30000',
    10,
  ); // 30s default
  private readonly cacheEnabled: boolean =
    (process.env.TENANT_CACHE_ENABLED || 'true').toLowerCase() === 'true';

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const host = req.get('host') || '';

      // First check for x-tenant-subdomain header (for tenant switching scenarios)
      let subdomain = req.get('x-tenant-subdomain');
      
      // If no header, extract subdomain from host
      // Expected format: subdomain.domain.com or subdomain.localhost:3000
      if (!subdomain) {
        subdomain = this.extractSubdomain(host) || undefined;
      }

      if (subdomain) {
        let tenant: Tenant | null | undefined;

        if (this.cacheEnabled) {
          const now = Date.now();
          // Attempt cache hit
          const cached = TenantResolutionMiddleware.cache.get(subdomain);
          if (cached && cached.expires > now) {
            tenant = cached.tenant;
          } else {
            // Cleanup occasionally (every 60s) to avoid unbounded growth
            if (now - TenantResolutionMiddleware.lastCleanup > 60000) {
              for (const [key, entry] of TenantResolutionMiddleware.cache) {
                if (entry.expires <= now) {
                  TenantResolutionMiddleware.cache.delete(key);
                }
              }
              TenantResolutionMiddleware.lastCleanup = now;
            }
          }
        }

        if (!tenant) {
          const found = await this.tenantsService.findBySubdomain(subdomain);
          tenant = found;
          if (tenant && this.cacheEnabled) {
            TenantResolutionMiddleware.cache.set(subdomain, {
              tenant,
              expires: Date.now() + this.ttlMs,
            });
          }
        }

        if (!tenant) {
          throw new BadRequestException(
            `Tenant not found for subdomain: ${subdomain}`,
          );
        }

        if (tenant.status !== 'active') {
          throw new BadRequestException(
            `Tenant is not active: ${tenant.status}`,
          );
        }

        // Add tenant to request context
        req.tenant = tenant;
        req.tenant_id = tenant.id;
      } else {
        // Suppress warning for plain localhost or ipv4 addresses (common in tests) to reduce noise
        const hostWithoutPort = host.split(':')[0];
        const isIPv4 = /^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort);
        if (hostWithoutPort !== 'localhost' && !isIPv4) {
          console.warn('No subdomain found in request host:', host);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  private extractSubdomain(host: string): string | null {
    // Remove port if present
    const hostWithoutPort = host.split(':')[0];

    // Split by dots
    const parts = hostWithoutPort.split('.');

    // For localhost development (e.g., tenant1.localhost)
    if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
      return parts[0];
    }

    // For production domains (e.g., tenant1.walatech.app)
    if (parts.length >= 3) {
      return parts[0];
    }

    // No subdomain found
    return null;
  }
}
