import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChartOfAccountsSeederService } from './chart-of-accounts-seeder.service';
import { Account } from '../entities/account.entity';
import { createMockRepository } from '../../../test-utils/test-utils';

describe('ChartOfAccountsSeederService', () => {
  let service: ChartOfAccountsSeederService;
  let accountRepo: jest.Mocked<Repository<Account>>;

  const mockTenantId = 'test-tenant-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChartOfAccountsSeederService,
        {
          provide: getRepositoryToken(Account),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ChartOfAccountsSeederService>(ChartOfAccountsSeederService);
    accountRepo = module.get(getRepositoryToken(Account));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedStandardChartOfAccounts', () => {
    it('should seed standard chart of accounts successfully', async () => {
      const mockCompany = 'Test Company';
      
      // Mock that no accounts exist initially
      accountRepo.findOne.mockResolvedValue(null);
      
      // Mock account creation and saving
      const mockAccount = { id: '1', code: '1000', name: 'Assets', rootType: 'Asset', isGroup: true };

      accountRepo.create.mockImplementation((data) => ({ ...data, id: 'mock-id' } as any));
      accountRepo.save.mockImplementation((account) => Promise.resolve({ ...account, id: 'mock-id' } as any));

      const result = await service.seedStandardChartOfAccounts(mockTenantId, mockCompany);

      expect(accountRepo.findOne).toHaveBeenCalled();
      expect(accountRepo.create).toHaveBeenCalled();
      expect(accountRepo.save).toHaveBeenCalled();
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBeGreaterThan(0);
    });

    it('should skip creating accounts that already exist', async () => {
      const mockCompany = 'Test Company';
      const existingAccount = { id: '1', code: '1000', name: 'Assets', rootType: 'Asset', isGroup: true };
      
      // Mock that some accounts already exist
      accountRepo.findOne.mockResolvedValue(existingAccount as any);

      const result = await service.seedStandardChartOfAccounts(mockTenantId, mockCompany);

      expect(accountRepo.findOne).toHaveBeenCalled();
      expect(accountRepo.create).not.toHaveBeenCalled();
      expect(accountRepo.save).toHaveBeenCalled(); // Still called for parent relationship updates
      
      expect(result).toBeInstanceOf(Map);
    });

    it('should create accounts with proper hierarchy', async () => {
      const mockCompany = 'Test Company';
      accountRepo.findOne.mockResolvedValue(null);
      
      let createdAccounts: any[] = [];
      accountRepo.create.mockImplementation((data) => {
        const account = { id: `account-${createdAccounts.length + 1}`, ...data };
        createdAccounts.push(account);
        return account as any;
      });
      
      accountRepo.save.mockImplementation((account) => {
        return Promise.resolve(account as any);
      });

      const result = await service.seedStandardChartOfAccounts(mockTenantId, mockCompany);

      // Verify that accounts are created with proper structure
      expect(accountRepo.create).toHaveBeenCalled();
      expect(accountRepo.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Map);
      
      // Verify the create calls include proper data structure
      const createCalls = accountRepo.create.mock.calls;
      const assetsCall = createCalls.find(call => call[0].code === '1000');
      expect(assetsCall).toBeDefined();
      expect(assetsCall[0].isGroup).toBe(true);
      expect(assetsCall[0].rootType).toBe('Asset');
    });

    it('should create all major account categories', async () => {
      const mockCompany = 'Test Company';
      accountRepo.findOne.mockResolvedValue(null);
      
      accountRepo.create.mockImplementation((data) => ({ ...data, id: 'mock-id' } as any));
      accountRepo.save.mockImplementation((account) => Promise.resolve(account as any));

      const result = await service.seedStandardChartOfAccounts(mockTenantId, mockCompany);

      // Check that create was called for major categories
      const createCalls = accountRepo.create.mock.calls;
      const assetCall = createCalls.find(call => call[0].code === '1000');
      const liabilityCall = createCalls.find(call => call[0].code === '2000');
      const equityCall = createCalls.find(call => call[0].code === '3000');
      const incomeCall = createCalls.find(call => call[0].code === '4000');
      const expenseCall = createCalls.find(call => call[0].code === '5000');

      expect(assetCall).toBeDefined();
      expect(assetCall[0].rootType).toBe('Asset');

      expect(liabilityCall).toBeDefined();
      expect(liabilityCall[0].rootType).toBe('Liability');

      expect(equityCall).toBeDefined();
      expect(equityCall[0].rootType).toBe('Equity');

      expect(incomeCall).toBeDefined();
      expect(incomeCall[0].rootType).toBe('Income');

      expect(expenseCall).toBeDefined();
      expect(expenseCall[0].rootType).toBe('Expense');
    });

    it('should set tenant for all created accounts', async () => {
      const mockCompany = 'Test Company';
      accountRepo.findOne.mockResolvedValue(null);
      
      accountRepo.create.mockImplementation((data) => ({ ...data, id: 'mock-id' } as any));
      accountRepo.save.mockImplementation((account) => Promise.resolve(account as any));

      await service.seedStandardChartOfAccounts(mockTenantId, mockCompany);

      // Verify all create calls include the correct tenant
      const createCalls = accountRepo.create.mock.calls;
      createCalls.forEach(call => {
        expect(call[0].tenant).toEqual({ id: mockTenantId });
      });
    });

    it('should handle repository errors gracefully', async () => {
      const mockCompany = 'Test Company';
      accountRepo.findOne.mockResolvedValue(null);
      accountRepo.create.mockImplementation((data) => data as any);
      accountRepo.save.mockRejectedValue(new Error('Database error'));

      await expect(service.seedStandardChartOfAccounts(mockTenantId, mockCompany))
        .rejects.toThrow('Database error');
    });

    it('should create accounts with proper account types', async () => {
      const mockCompany = 'Test Company';
      accountRepo.findOne.mockResolvedValue(null);
      
      accountRepo.create.mockImplementation((data) => ({ ...data, id: 'mock-id' } as any));
      accountRepo.save.mockImplementation((account) => Promise.resolve(account as any));

      await service.seedStandardChartOfAccounts(mockTenantId, mockCompany);

      // Check specific account types from create calls
      const createCalls = accountRepo.create.mock.calls;
      const cashCall = createCalls.find(call => call[0].code === '1111');
      const bankCall = createCalls.find(call => call[0].code === '1112');
      const debtorsCall = createCalls.find(call => call[0].code === '1121');
      const stockCall = createCalls.find(call => call[0].code === '1131');

      expect(cashCall).toBeDefined();
      expect(cashCall[0].name).toBe('Cash in Hand');
      expect(cashCall[0].currency).toBe('USD');
      expect(cashCall[0].isGroup).toBe(false);

      expect(bankCall).toBeDefined();
      expect(bankCall[0].name).toBe('Bank Account - Main');
      expect(bankCall[0].currency).toBe('USD');

      expect(debtorsCall).toBeDefined();
      expect(debtorsCall[0].name).toBe('Debtors');

      expect(stockCall).toBeDefined();
      expect(stockCall[0].name).toBe('Stock in Hand');
    });
  });
});