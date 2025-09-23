import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { User } from '../../entities/user.entity';
import { TenantsService } from './services/tenants.service';
import { TenantProvisioningService } from './services/tenant-provisioning.service';
import { TenantSettingsService } from './services/tenant-settings.service';
import { TenantsController } from './controllers/tenants.controller';
import { TenantProvisioningController } from './controllers/tenant-provisioning.controller';
import { TenantSettingsController } from './controllers/tenant-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, User])],
  controllers: [TenantsController, TenantProvisioningController, TenantSettingsController],
  providers: [TenantsService, TenantProvisioningService, TenantSettingsService],
  exports: [TenantsService, TenantProvisioningService, TenantSettingsService],
})
export class TenantsModule {}