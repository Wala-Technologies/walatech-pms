import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'default-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    // If tenant_id is present in payload, validate with tenant context
    if (payload.tenant_id) {
      const user = await this.authService.validateUserWithTenant(payload.sub, payload.tenant_id);
      if (!user) {
        throw new UnauthorizedException('Invalid user or tenant');
      }
      
      // Determine super admin status based on tenant subdomain
      const superAdminSubdomain = process.env.SUPER_ADMIN_SUBDOMAIN || 'walatech';
      const isSuperAdmin = user.tenant?.subdomain === superAdminSubdomain;
      
      // Add isSuperAdmin to user object
      return {
        ...user,
        isSuperAdmin,
      };
    }
    
    // Fallback to regular validation for backward compatibility
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    
    // For backward compatibility, set isSuperAdmin to false if no tenant context
    return {
      ...user,
      isSuperAdmin: false,
    };
  }
}