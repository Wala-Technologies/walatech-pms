import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TestHelpers } from '../../../test/test-helpers';
import { TestDataSource } from '../../../test/test-data-source';
import { TestGLEntry } from '../../../test/entities/gl-entry.test.entity';
import { TestTenant } from '../../../test/entities/tenant.test.entity';

describe('Accounting Integration Tests', () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let testtenant_id: string;

  beforeAll(async () => {
    dataSource = await TestHelpers.setupTestDatabase();
    
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...TestDataSource.options,
          entities: [TestTenant, TestGLEntry],
        }),
        TypeOrmModule.forFeature([TestTenant, TestGLEntry]),
      ],
      providers: [],
    }).compile();
  });

  beforeEach(async () => {
    await TestHelpers.clearDatabase();
    testtenant_id = (await TestHelpers.createTestTenant()).id;
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
    await TestHelpers.teardownTestDatabase();
  });

  describe('Database Connectivity', () => {
    it('should connect to test database successfully', async () => {
      expect(dataSource.isInitialized).toBe(true);
    });

    it('should create and retrieve tenant', async () => {
      const tenant = await TestHelpers.createTestTenant({ name: 'Test Company' });
      expect(tenant.id).toBeDefined();
      expect(tenant.name).toBe('Test Company');
    });
  });

  describe('GL Entry Operations', () => {
    it('should create GL entry successfully', async () => {
      const savedEntry = await TestHelpers.createTestGLEntry(testtenant_id, {
        accountCode: '1000',
        accountName: 'Cash',
        debit: 1000,
        credit: 0,
        voucherNo: 'TEST-001',
        remarks: 'Test GL Entry',
      });

      expect(savedEntry.id).toBeDefined();
      expect(savedEntry.debit).toBe(1000);
      expect(savedEntry.credit).toBe(0);
      expect(savedEntry.accountCode).toBe('1000');
      expect(savedEntry.accountName).toBe('Cash');
    });

    it('should retrieve GL entries by tenant', async () => {
      const glRepo = dataSource.getRepository(TestGLEntry);
      
      // Create GL entries for test tenant
      await TestHelpers.createTestGLEntry(testtenant_id, {
        accountCode: '1000',
        accountName: 'Cash',
        debit: 1000,
        credit: 0,
        voucherNo: 'TEST-001',
        remarks: 'Test GL Entry 1',
      });

      await TestHelpers.createTestGLEntry(testtenant_id, {
        accountCode: '2000',
        accountName: 'Accounts Payable',
        debit: 0,
        credit: 500,
        voucherNo: 'TEST-002',
        remarks: 'Test GL Entry 2',
      });

      const entries = await glRepo.find({
        where: { tenant_id: testtenant_id },
      });

      expect(entries).toHaveLength(2);
      expect(entries[0].debit).toBe(1000);
      expect(entries[1].credit).toBe(500);
    });

    it('should calculate account balance from GL entries', async () => {
      const glRepo = dataSource.getRepository(TestGLEntry);
      
      // Create multiple GL entries for the same account
      await TestHelpers.createTestGLEntry(testtenant_id, {
        accountCode: '1000',
        accountName: 'Cash',
        debit: 1000,
        credit: 0,
        voucherNo: 'TEST-001',
      });

      await TestHelpers.createTestGLEntry(testtenant_id, {
        accountCode: '1000',
        accountName: 'Cash',
        debit: 500,
        credit: 0,
        voucherNo: 'TEST-002',
      });

      await TestHelpers.createTestGLEntry(testtenant_id, {
        accountCode: '1000',
        accountName: 'Cash',
        debit: 0,
        credit: 200,
        voucherNo: 'TEST-003',
      });

      // Calculate balance manually (this would be done by the service)
      const entries = await glRepo.find({
        where: { 
          tenant_id: testtenant_id,
          accountCode: '1000'
        },
      });

      const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
      const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);
      const balance = totalDebit - totalCredit;

      expect(balance).toBe(1300); // 1000 + 500 - 200
      expect(entries).toHaveLength(3);
    });
  });
});