import { Test, TestingModule } from '@nestjs/testing';
import { AccountingController } from './accounting.controller';
import { AccountingService } from '../services/accounting.service';
import { ChartOfAccountsSeederService } from '../services/chart-of-accounts-seeder.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { CreateJournalEntryDto } from '../dto/create-journal-entry.dto';
import { CreateGLEntryDto } from '../dto/create-gl-entry.dto';
import { CreateCostCenterDto } from '../dto/create-cost-center.dto';
import { CreateFiscalYearDto } from '../dto/create-fiscal-year.dto';
import { CreatePaymentEntryDto } from '../dto/create-payment-entry.dto';
import { AccountBalanceQueryDto, TrialBalanceQueryDto, GLReportQueryDto } from '../dto/accounting-query.dto';

describe('AccountingController', () => {
  let controller: AccountingController;
  let accountingService: jest.Mocked<AccountingService>;
  let seederService: jest.Mocked<ChartOfAccountsSeederService>;

  const mockTenantId = 'test-tenant-id';

  beforeEach(async () => {
    const mockAccountingService = {
      createAccount: jest.fn(),
      listAccounts: jest.fn(),
      createJournalEntry: jest.fn(),
      listJournalEntries: jest.fn(),
      createGLEntry: jest.fn(),
      getGLReport: jest.fn(),
      createCostCenter: jest.fn(),
      listCostCenters: jest.fn(),
      createFiscalYear: jest.fn(),
      listFiscalYears: jest.fn(),
      createPaymentEntry: jest.fn(),
      listPaymentEntries: jest.fn(),
      getAccountBalance: jest.fn(),
      getTrialBalance: jest.fn(),
      postJournalEntryToGL: jest.fn(),
    };

    const mockSeederService = {
      seedStandardChartOfAccounts: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountingController],
      providers: [
        {
          provide: AccountingService,
          useValue: mockAccountingService,
        },
        {
          provide: ChartOfAccountsSeederService,
          useValue: mockSeederService,
        },
      ],
    }).compile();

    controller = module.get<AccountingController>(AccountingController);
    accountingService = module.get(AccountingService);
    seederService = module.get(ChartOfAccountsSeederService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAccount', () => {
    it('should create an account', async () => {
      const createAccountDto: CreateAccountDto = {
        code: '1000',
        name: 'Cash',
        rootType: 'Asset',
        isGroup: false,
        currency: 'USD',
      };

      const mockAccount = { id: '1', ...createAccountDto };
      accountingService.createAccount.mockResolvedValue(mockAccount as any);

      const result = await controller.createAccount(createAccountDto, mockTenantId);

      expect(accountingService.createAccount).toHaveBeenCalledWith(createAccountDto, mockTenantId);
      expect(result).toEqual(mockAccount);
    });

    it('should throw error if tenant context is missing', async () => {
      const createAccountDto: CreateAccountDto = {
        code: '1000',
        name: 'Cash',
        rootType: 'Asset',
        isGroup: false,
        currency: 'USD',
      };

      await expect(controller.createAccount(createAccountDto, '')).rejects.toThrow('Tenant context missing');
    });
  });

  describe('listAccounts', () => {
    it('should list accounts', async () => {
      const mockAccounts = [
        { id: '1', code: '1000', name: 'Cash' },
        { id: '2', code: '1100', name: 'Bank' },
      ];

      accountingService.listAccounts.mockResolvedValue(mockAccounts as any);

      const result = await controller.listAccounts(mockTenantId);

      expect(accountingService.listAccounts).toHaveBeenCalledWith(mockTenantId);
      expect(result).toEqual(mockAccounts);
    });
  });

  describe('createJournalEntry', () => {
    it('should create a journal entry', async () => {
      const createJournalEntryDto: CreateJournalEntryDto = {
        voucherType: 'Journal Entry',
        postingDate: '2024-01-01',
        company: 'Test Company',
        accounts: [
          {
            account: 'account-1',
            debitInAccountCurrency: 1000,
            creditInAccountCurrency: 0,
          },
          {
            account: 'account-2',
            debitInAccountCurrency: 0,
            creditInAccountCurrency: 1000,
          },
        ],
      };

      const mockJournalEntry = { id: '1', ...createJournalEntryDto };
      accountingService.createJournalEntry.mockResolvedValue(mockJournalEntry as any);

      const result = await controller.createJournalEntry(createJournalEntryDto, mockTenantId);

      expect(accountingService.createJournalEntry).toHaveBeenCalledWith(createJournalEntryDto, mockTenantId);
      expect(result).toEqual(mockJournalEntry);
    });
  });

  describe('listJournalEntries', () => {
    it('should list journal entries', async () => {
      const mockJournalEntries = [
        { id: '1', voucherType: 'Journal Entry', postingDate: '2024-01-01' },
        { id: '2', voucherType: 'Journal Entry', postingDate: '2024-01-02' },
      ];

      accountingService.listJournalEntries.mockResolvedValue(mockJournalEntries as any);

      const result = await controller.listJournalEntries(mockTenantId);

      expect(accountingService.listJournalEntries).toHaveBeenCalledWith(mockTenantId);
      expect(result).toEqual(mockJournalEntries);
    });
  });

  describe('seedChartOfAccounts', () => {
    it('should seed chart of accounts', async () => {
      const mockResult = new Map();
      seederService.seedStandardChartOfAccounts.mockResolvedValue(mockResult);

      const result = await controller.seedChartOfAccounts(mockTenantId);

      expect(seederService.seedStandardChartOfAccounts).toHaveBeenCalledWith(mockTenantId, 'Default Company');
      expect(result).toEqual(mockResult);
    });
  });

  describe('createGLEntry', () => {
    it('should create a GL entry', async () => {
      const createGLEntryDto: CreateGLEntryDto = {
        postingDate: '2024-01-01',
        accountId: 'account-1',
        debit: 1000,
        credit: 0,
        voucherType: 'Journal Entry',
        voucherNo: 'JE-001',
      };

      const mockGLEntry = { id: '1', ...createGLEntryDto };
      accountingService.createGLEntry.mockResolvedValue(mockGLEntry as any);

      const result = await controller.createGLEntry(createGLEntryDto, mockTenantId);

      expect(accountingService.createGLEntry).toHaveBeenCalledWith(createGLEntryDto, mockTenantId);
      expect(result).toEqual(mockGLEntry);
    });
  });

  describe('getGLReport', () => {
    it('should get GL report', async () => {
      const query: GLReportQueryDto = {
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
        accountId: 'account-1',
      };

      const mockReport = [
        { id: '1', postingDate: '2024-01-01', debit: 1000, credit: 0 },
        { id: '2', postingDate: '2024-01-15', debit: 0, credit: 500 },
      ];

      accountingService.getGLReport.mockResolvedValue(mockReport as any);

      const result = await controller.getGLReport(query, mockTenantId);

      expect(accountingService.getGLReport).toHaveBeenCalledWith(query, mockTenantId);
      expect(result).toEqual(mockReport);
    });
  });

  describe('createCostCenter', () => {
    it('should create a cost center', async () => {
      const createCostCenterDto: CreateCostCenterDto = {
        code: 'CC001',
        name: 'Marketing',
        isGroup: false,
      };

      const mockCostCenter = { id: '1', ...createCostCenterDto };
      accountingService.createCostCenter.mockResolvedValue(mockCostCenter as any);

      const result = await controller.createCostCenter(createCostCenterDto, mockTenantId);

      expect(accountingService.createCostCenter).toHaveBeenCalledWith(createCostCenterDto, mockTenantId);
      expect(result).toEqual(mockCostCenter);
    });
  });

  describe('listCostCenters', () => {
    it('should list cost centers', async () => {
      const mockCostCenters = [
        { id: '1', code: 'CC001', name: 'Marketing' },
        { id: '2', code: 'CC002', name: 'Sales' },
      ];

      accountingService.listCostCenters.mockResolvedValue(mockCostCenters as any);

      const result = await controller.listCostCenters(mockTenantId);

      expect(accountingService.listCostCenters).toHaveBeenCalledWith(mockTenantId);
      expect(result).toEqual(mockCostCenters);
    });
  });

  describe('createFiscalYear', () => {
    it('should create a fiscal year', async () => {
      const createFiscalYearDto: CreateFiscalYearDto = {
        name: 'FY 2024',
        yearStartDate: '2024-01-01',
        yearEndDate: '2024-12-31',
      };

      const mockFiscalYear = { id: '1', ...createFiscalYearDto };
      accountingService.createFiscalYear.mockResolvedValue(mockFiscalYear as any);

      const result = await controller.createFiscalYear(createFiscalYearDto, mockTenantId);

      expect(accountingService.createFiscalYear).toHaveBeenCalledWith(createFiscalYearDto, mockTenantId);
      expect(result).toEqual(mockFiscalYear);
    });
  });

  describe('listFiscalYears', () => {
    it('should list fiscal years', async () => {
      const mockFiscalYears = [
        { id: '1', name: 'FY 2024', yearStartDate: '2024-01-01' },
        { id: '2', name: 'FY 2023', yearStartDate: '2023-01-01' },
      ];

      accountingService.listFiscalYears.mockResolvedValue(mockFiscalYears as any);

      const result = await controller.listFiscalYears(mockTenantId);

      expect(accountingService.listFiscalYears).toHaveBeenCalledWith(mockTenantId);
      expect(result).toEqual(mockFiscalYears);
    });
  });

  describe('createPaymentEntry', () => {
    it('should create a payment entry', async () => {
      const createPaymentEntryDto: CreatePaymentEntryDto = {
        paymentType: 'Pay',
        postingDate: '2024-01-01',
        paidFromAccountId: 'account-1',
        paidToAccountId: 'account-2',
        paidAmount: 1000,
        receivedAmount: 1000,
      };

      const mockPaymentEntry = { id: '1', ...createPaymentEntryDto };
      accountingService.createPaymentEntry.mockResolvedValue(mockPaymentEntry as any);

      const result = await controller.createPaymentEntry(createPaymentEntryDto, mockTenantId);

      expect(accountingService.createPaymentEntry).toHaveBeenCalledWith(createPaymentEntryDto, mockTenantId);
      expect(result).toEqual(mockPaymentEntry);
    });
  });

  describe('listPaymentEntries', () => {
    it('should list payment entries', async () => {
      const mockPaymentEntries = [
        { id: '1', paymentType: 'Pay', postingDate: '2024-01-01' },
        { id: '2', paymentType: 'Receive', postingDate: '2024-01-02' },
      ];

      accountingService.listPaymentEntries.mockResolvedValue(mockPaymentEntries as any);

      const result = await controller.listPaymentEntries(mockTenantId);

      expect(accountingService.listPaymentEntries).toHaveBeenCalledWith(mockTenantId);
      expect(result).toEqual(mockPaymentEntries);
    });
  });

  describe('getAccountBalance', () => {
    it('should get account balance', async () => {
      const accountId = 'account-1';
      const query: AccountBalanceQueryDto = {
        asOfDate: '2024-01-31',
        company: 'Test Company',
      };

      const mockBalance = {
        accountId: 'account-1',
        balance: 1500,
        totalDebit: 2000,
        totalCredit: 500,
      };

      accountingService.getAccountBalance.mockResolvedValue(mockBalance as any);

      const result = await controller.getAccountBalance(accountId, query, mockTenantId);

      expect(accountingService.getAccountBalance).toHaveBeenCalledWith(
        accountId,
        query.asOfDate,
        mockTenantId,
        query.company
      );
      expect(result).toEqual(mockBalance);
    });
  });

  describe('getTrialBalance', () => {
    it('should get trial balance', async () => {
      const query: TrialBalanceQueryDto = {
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
        company: 'Test Company',
      };

      const mockTrialBalance = [
        {
          accountId: 'account-1',
          accountCode: '1000',
          accountName: 'Cash',
          rootType: 'Asset',
          totalDebit: 1500,
          totalCredit: 200,
          balance: 1300,
        },
        {
          accountId: 'account-2',
          accountCode: '2000',
          accountName: 'Accounts Payable',
          rootType: 'Liability',
          totalDebit: 100,
          totalCredit: 1000,
          balance: 900,
        },
      ];

      accountingService.getTrialBalance.mockResolvedValue(mockTrialBalance as any);

      const result = await controller.getTrialBalance(query, mockTenantId);

      expect(accountingService.getTrialBalance).toHaveBeenCalledWith(query, mockTenantId);
      expect(result).toEqual(mockTrialBalance);
    });
  });

  describe('getProfitLossStatement', () => {
    it('should get profit and loss statement', async () => {
      const query: TrialBalanceQueryDto = {
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        company: 'Test Company'
      };

      const mockTrialBalance = [
        { accountId: '1', accountName: 'Sales Revenue', rootType: 'Income', debit: 0, credit: 5000 },
        { accountId: '2', accountName: 'Cost of Goods Sold', rootType: 'Expense', debit: 3000, credit: 0 },
      ];

      accountingService.getTrialBalance.mockResolvedValue(mockTrialBalance as any);

      const result = await controller.getProfitLossStatement(query, mockTenantId);

      expect(accountingService.getTrialBalance).toHaveBeenCalledWith(query, mockTenantId);
      expect(result.income.total).toBe(5000);
      expect(result.expenses.total).toBe(3000);
      expect(result.netIncome).toBe(2000);
    });
  });

  describe('getBalanceSheet', () => {
    it('should get balance sheet', async () => {
      const query: TrialBalanceQueryDto = {
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        company: 'Test Company'
      };

      const mockTrialBalance = [
        { accountId: '1', accountName: 'Cash', rootType: 'Asset', debit: 1000, credit: 0 },
        { accountId: '2', accountName: 'Inventory', rootType: 'Asset', debit: 300, credit: 0 },
        { accountId: '3', accountName: 'Accounts Payable', rootType: 'Liability', debit: 0, credit: 900 },
        { accountId: '4', accountName: 'Share Capital', rootType: 'Equity', debit: 0, credit: 400 },
      ];

      accountingService.getTrialBalance.mockResolvedValue(mockTrialBalance as any);

      const result = await controller.getBalanceSheet(query, mockTenantId);

      expect(accountingService.getTrialBalance).toHaveBeenCalledWith(query, mockTenantId);
      expect(result.assets.total).toBe(1300);
      expect(result.liabilities.total).toBe(900);
      expect(result.equity.total).toBe(400);
      expect(result.totalLiabilitiesAndEquity).toBe(1300);
    });
  });

  describe('postJournalEntryToGL', () => {
    it('should post journal entry to GL', async () => {
      const journalEntryId = 'je-1';
      const mockGLEntries = [
        { id: '1', accountId: 'account-1', debit: 1000, credit: 0 },
        { id: '2', accountId: 'account-2', debit: 0, credit: 1000 },
      ];

      accountingService.postJournalEntryToGL.mockResolvedValue(mockGLEntries as any);

      const result = await controller.postJournalEntryToGL(journalEntryId, mockTenantId);

      expect(accountingService.postJournalEntryToGL).toHaveBeenCalledWith(journalEntryId, mockTenantId);
      expect(result).toEqual(mockGLEntries);
    });
  });
});