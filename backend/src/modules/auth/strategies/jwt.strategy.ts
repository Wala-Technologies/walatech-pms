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
      return user;
    }
    
    // Fallback to regular validation for backward compatibility
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}