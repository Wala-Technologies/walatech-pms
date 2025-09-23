import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Tenant } from '../entities/tenant.entity';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Tenant | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);

export const tenant_id = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant_id;
  },
);