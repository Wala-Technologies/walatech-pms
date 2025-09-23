import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);

export const CurrentUserTenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.tenant_id;
  },
);