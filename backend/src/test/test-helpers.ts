import { DataSource, Repository, ObjectLiteral, EntityTarget } from 'typeorm';
import { TestDataSource } from './test-data-source';
import { TestTenant } from './entities/tenant.test.entity';
import { TestGLEntry } from './entities/gl-entry.test.entity';

export class TestHelpers {
  private static dataSource: DataSource | undefined;

  static async setupTestDatabase(): Promise<DataSource> {
    if (!this.dataSource) {
      this.dataSource = TestDataSource;
      await this.dataSource.initialize();
    }
    return this.dataSource;
  }

  static async teardownTestDatabase(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.dataSource = undefined;
    }
  }

  static async clearDatabase(): Promise<void> {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      return;
    }

    const entities = this.dataSource.entityMetadatas;
    
    // For SQLite, we don't need to disable foreign key checks
    // Clear all tables
    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.clear();
    }
  }

  // Simplified test helpers for accounting entities only

  static async createTestTenant(data: Partial<TestTenant> = {}): Promise<TestTenant> {
    if (!this.dataSource) {
      throw new Error('DataSource not initialized. Call setupTestDatabase() first.');
    }
    const tenantRepo = this.dataSource.getRepository(TestTenant);
    const tenant = tenantRepo.create({
      id: data.id || 'test-tenant-123',
      name: data.name || 'Test Tenant',
      domain: data.domain || 'test.com',
      status: data.status || 'Active',
      plan: data.plan || 'Basic',
      ...data,
    });
    return await tenantRepo.save(tenant);
  }

  static async createTestGLEntry(
    tenant_id: string,
    data: Partial<TestGLEntry> = {}
  ): Promise<TestGLEntry> {
    if (!this.dataSource) {
      throw new Error('DataSource not initialized. Call setupTestDatabase() first.');
    }
    const glRepo = this.dataSource.getRepository(TestGLEntry);
    
    const glEntry = glRepo.create({
      tenant_id: tenant_id,
      accountCode: data.accountCode || '1000',
      accountName: data.accountName || 'Test Account',
      debit: data.debit || 0,
      credit: data.credit || 0,
      postingDate: data.postingDate || new Date().toISOString().split('T')[0],
      voucherType: data.voucherType || 'Journal Entry',
      voucherNo: data.voucherNo || 'JV-001',
      company: data.company || 'Test Company',
      isCancelled: data.isCancelled || false,
      ...data,
    });
    return await glRepo.save(glEntry);
  }

  static getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
    if (!this.dataSource) {
      throw new Error('DataSource not initialized. Call setupTestDatabase() first.');
    }
    return this.dataSource.getRepository(entity);
  }
}