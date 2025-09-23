import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request & {
      user?: { isSuperAdmin?: boolean };
      isSuperAdmin?: boolean;
      tenant?: { subdomain?: string };
    } = context.switchToHttp().getRequest();
    const user = request.user;

    const superAdminSubdomain = process.env.SUPER_ADMIN_SUBDOMAIN || 'walatech';
    const byUserFlag = !!(user && user.isSuperAdmin);
    const byRequestFlag = !!request.isSuperAdmin;
    const byTenantSub = !!(
      request.tenant && request.tenant.subdomain === superAdminSubdomain
    );
    const isSuper = Boolean(byUserFlag || byRequestFlag || byTenantSub);

    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.E2E_DEBUG === 'true'
    ) {
      console.debug('[SuperAdminGuard] evaluation', {
        path: (request as unknown as { path?: string })?.path,
        userIsSuper: user?.isSuperAdmin,
        requestIsSuper: request.isSuperAdmin,
        tenantSubdomain: request.tenant?.subdomain,
        superAdminSubdomain,
        byUserFlag,
        byRequestFlag,
        byTenantSub,
        isSuper,
      });
    }

    if (!isSuper) {
      throw new ForbiddenException(
        'Access denied. Super admin privileges required.',
      );
    }

    return true;
  }
}
