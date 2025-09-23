import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from '../modules/tenants/services/tenants.service';
import { Tenant } from '../entities/tenant.entity';

// Extend Express Request interface to include tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      tenantId?: string;
    }
  }
}

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  constructor(private readonly tenantsService: TenantsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const host = req.get('host') || '';
      
      // Extract subdomain from host
      // Expected format: subdomain.domain.com or subdomain.localhost:3000
      const subdomain = this.extractSubdomain(host);
      
      if (subdomain) {
        // Find tenant by subdomain
        const tenant = await this.tenantsService.findBySubdomain(subdomain);
        
        if (!tenant) {
          throw new BadRequestException(`Tenant not found for subdomain: ${subdomain}`);
        }
        
        if (tenant.status !== 'active') {
          throw new BadRequestException(`Tenant is not active: ${tenant.status}`);
        }
        
        // Add tenant to request context
        req.tenant = tenant;
        req.tenantId = tenant.id;
      } else {
        // For development or admin routes without subdomain
        // You might want to handle this differently based on your requirements
        console.warn('No subdomain found in request host:', host);
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