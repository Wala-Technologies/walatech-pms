import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductionModule } from './modules/production/production.module';
import { ProductionModule as ProductionOrderModule } from './modules/production/production.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { DatabaseConfigService } from './config/database.config';
import { JwtTenantMiddleware } from './middleware/jwt-tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule,
    UsersModule,
    InventoryModule,
    ProductionModule,
    ProductionOrderModule,
    TenantsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtTenantMiddleware)
      .exclude('/health', '/metrics', '/auth/login', '/auth/register') // Exclude health check, metrics, and auth endpoints
      .forRoutes('*'); // Apply to all routes
  }
}
