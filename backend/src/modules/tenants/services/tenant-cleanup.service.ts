import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TenantsService } from './tenants.service';
import { TenantLifecycleAudit, TenantLifecycleAction } from '../../../entities/tenant-lifecycle-audit.entity';

@Injectable()
export class TenantCleanupService {
  private readonly logger = new Logger(TenantCleanupService.name);

  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * Runs daily at 2 AM to check for tenants eligible for hard deletion
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleTenantCleanup(): Promise<void> {
    this.logger.log('Starting tenant cleanup job...');

    try {
      const eligibleTenants = await this.tenantsService.getTenantsEligibleForHardDeletion();
      
      if (eligibleTenants.length === 0) {
        this.logger.log('No tenants eligible for hard deletion');
        return;
      }

      this.logger.log(`Found ${eligibleTenants.length} tenants eligible for hard deletion`);

      for (const tenant of eligibleTenants) {
        try {
          const daysOverdue = tenant.getDaysUntilHardDeletion();
          this.logger.log(
            `Hard deleting tenant: ${tenant.name} (${tenant.id}) - ${Math.abs(daysOverdue || 0)} days overdue`
          );

          await this.tenantsService.hardDelete(
            tenant.id,
            'system-cleanup',
            `Automated cleanup - retention period expired`
          );

          this.logger.log(`Successfully hard deleted tenant: ${tenant.name} (${tenant.id})`);
        } catch (error) {
          this.logger.error(
            `Failed to hard delete tenant: ${tenant.name} (${tenant.id})`,
            error.stack
          );
        }
      }

      this.logger.log(`Tenant cleanup job completed. Processed ${eligibleTenants.length} tenants`);
    } catch (error) {
      this.logger.error('Tenant cleanup job failed', error.stack);
    }
  }

  /**
   * Runs weekly on Sundays at 3 AM to generate cleanup reports
   */
  @Cron('0 3 * * 0') // Every Sunday at 3 AM
  async generateCleanupReport(): Promise<void> {
    this.logger.log('Generating weekly tenant cleanup report...');

    try {
      const eligibleTenants = await this.tenantsService.getTenantsEligibleForHardDeletion();
      const upcomingDeletions = await this.getUpcomingDeletions();

      this.logger.log(`Cleanup Report:
        - Tenants eligible for immediate hard deletion: ${eligibleTenants.length}
        - Tenants scheduled for deletion in next 7 days: ${upcomingDeletions.length}
      `);

      // Log details for each tenant
      for (const tenant of eligibleTenants) {
        const daysOverdue = Math.abs(tenant.getDaysUntilHardDeletion() || 0);
        this.logger.log(`  - ${tenant.name} (${tenant.id}): ${daysOverdue} days overdue`);
      }

      for (const tenant of upcomingDeletions) {
        const daysUntil = tenant.getDaysUntilHardDeletion() || 0;
        this.logger.log(`  - ${tenant.name} (${tenant.id}): ${daysUntil} days until deletion`);
      }

    } catch (error) {
      this.logger.error('Failed to generate cleanup report', error.stack);
    }
  }

  /**
   * Get tenants that will be eligible for hard deletion in the next 7 days
   */
  private async getUpcomingDeletions() {
    const allSoftDeleted = await this.tenantsService.findAll(true);
    const softDeletedTenants = allSoftDeleted.filter(t => t.isSoftDeleted());
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return softDeletedTenants.filter(tenant => {
      if (!tenant.hardDeleteScheduledAt) return false;
      const scheduledDate = new Date(tenant.hardDeleteScheduledAt);
      const now = new Date();
      return scheduledDate > now && scheduledDate <= nextWeek;
    });
  }

  /**
   * Manual trigger for cleanup (for testing or emergency cleanup)
   */
  async triggerManualCleanup(performedBy: string): Promise<{
    processed: number;
    successful: number;
    failed: number;
    errors: string[];
  }> {
    this.logger.log(`Manual tenant cleanup triggered by: ${performedBy}`);

    const eligibleTenants = await this.tenantsService.getTenantsEligibleForHardDeletion();
    const results = {
      processed: eligibleTenants.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const tenant of eligibleTenants) {
      try {
        await this.tenantsService.hardDelete(
          tenant.id,
          performedBy,
          'Manual cleanup trigger'
        );
        results.successful++;
        this.logger.log(`Successfully hard deleted tenant: ${tenant.name} (${tenant.id})`);
      } catch (error) {
        results.failed++;
        const errorMsg = `Failed to hard delete tenant: ${tenant.name} (${tenant.id}) - ${error.message}`;
        results.errors.push(errorMsg);
        this.logger.error(errorMsg, error.stack);
      }
    }

    this.logger.log(`Manual cleanup completed: ${results.successful} successful, ${results.failed} failed`);
    return results;
  }
}