import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Tenant } from '../../entities/tenant.entity';
import { User } from '../../entities/user.entity';
import { TenantLifecycleAudit } from '../../entities/tenant-lifecycle-audit.entity';
import { Department } from '../hr/entities/department.entity';
import { TenantsService } from './services/tenants.service';
import { TenantProvisioningService } from './services/tenant-provisioning.service';
import { TenantSettingsService } from './services/tenant-settings.service';
import { TenantCleanupService } from './services/tenant-cleanup.service';
import { TenantsController } from './controllers/tenants.controller';
import { TenantProvisioningController } from './controllers/tenant-provisioning.controller';
import { TenantSettingsController } from './controllers/tenant-settings.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, User, TenantLifecycleAudit, Department]),
    ScheduleModule.forRoot(),
  ],
  controllers: [TenantsController, TenantProvisioningController, TenantSettingsController],
  providers: [TenantsService, TenantProvisioningService, TenantSettingsService, TenantCleanupService],
  exports: [TenantsService, TenantProvisioningService, TenantSettingsService, TenantCleanupService],
})
export class TenantsModule {}