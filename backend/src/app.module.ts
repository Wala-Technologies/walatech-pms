import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductionModule } from './modules/production/production.module';
import { ProductionModule as ProductionOrderModule } from './modules/production/production.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { HrModule } from './modules/hr/hr.module';
import { SalesModule } from './modules/sales/sales.module';
import { DatabaseConfigService } from './config/database.config';
import { JwtTenantMiddleware } from './middleware/jwt-tenant.middleware';
import { TenantResolutionMiddleware } from './middleware/tenant-resolution.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    CustomersModule,
    SuppliersModule,
    InventoryModule,
    ProductionModule,
    ProductionOrderModule,
    TenantsModule,
    AccountingModule,
    HrModule,
    SalesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply tenant resolution early for ALL routes so that downstream guards/services
    // consistently have subdomain-derived tenant context (where present). This broadens
    // previous scope limited to auth endpoints (todo #4).
    consumer.apply(TenantResolutionMiddleware).forRoutes('*');

    // Apply JWT tenant validation for protected routes
    consumer
      .apply(JwtTenantMiddleware)
      .exclude(
        '/health',
        '/metrics',
        '/auth/login',
        '/auth/register',
        '/auth/refresh',
        '/tenants/by-subdomain/(.*)',
        '/tenants/validate/(.*)',
      ) // Exclude health check, metrics, auth endpoints, and public tenant endpoints (global prefix applied automatically)
      .forRoutes('*');
  }
}
