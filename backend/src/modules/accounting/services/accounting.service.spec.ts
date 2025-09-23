import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { Account } from '../entities/account.entity';
import { JournalEntry } from '../entities/journal-entry.entity';
import { JournalEntryLine } from '../entities/journal-entry-line.entity';
import { GLEntry } from '../entities/gl-entry.entity';
import { CostCenter } from '../entities/cost-center.entity';
import { FiscalYear } from '../entities/fiscal-year.entity';
import { PaymentEntry } from '../entities/payment-entry.entity';
import { createMockRepository } from '../../../test-utils/test-utils';

describe('AccountingService', () => {
  let service: AccountingService;
  let accountRepo: jest.Mocked<Repository<Account>>;
  let jeRepo: jest.Mocked<Repository<JournalEntry>>;
  let jelRepo: jest.Mocked<Repository<JournalEntryLine>>;
  let glRepo: jest.Mocked<Repository<GLEntry>>;
  let costCenterRepo: jest.Mocked<Repository<CostCenter>>;
  let fiscalYearRepo: jest.Mocked<Repository<FiscalYear>>;
  let paymentRepo: jest.Mocked<Repository<PaymentEntry>>;

  const mockTenantId = 'test-tenant-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingService,
        {
          provide: getRepositoryToken(Account),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(JournalEntry),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(JournalEntryLine),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(GLEntry),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(CostCenter),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(FiscalYear),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(PaymentEntry),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<AccountingService>(AccountingService);
    accountRepo = module.get(getRepositoryToken(Account));
    jeRepo = module.get(getRepositoryToken(JournalEntry));
    jelRepo = module.get(getRepositoryToken(JournalEntryLine));
    glRepo = module.get(getRepositoryToken(GLEntry));
    costCenterRepo = module.get(getRepositoryToken(CostCenter));
    fiscalYearRepo = module.get(getRepositoryToken(FiscalYear));
    paymentRepo = module.get(getRepositoryToken(PaymentEntry));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should create an account successfully', async () => {
      const createAccountDto = {
        code: '1000',
        name: 'Cash',
        rootType: 'Asset' as const,
        isGroup: false,
        currency: 'USD',
      };

      const mockAccount = { id: '1', ...createAccountDto, tenant: { id: mockTenantId } };
      
      accountRepo.findOne.mockResolvedValue(null);
      accountRepo.create.mockReturnValue(mockAccount as any);
      accountRepo.save.mockResolvedValue(mockAccount as any);

      const result = await service.createAccount(createAccountDto, mockTenantId);

      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { code: '1000', tenant: { id: mockTenantId } },
      });
      expect(accountRepo.create).toHaveBeenCalledWith({
        ...createAccountDto,
        tenant: { id: mockTenantId },
      });
      expect(result).toEqual(mockAccount);
    });

    it('should throw error if account code already exists', async () => {
      const createAccountDto = {
        code: '1000',
        name: 'Cash',
        rootType: 'Asset' as const,
        isGroup: false,
        currency: 'USD',
      };

      accountRepo.findOne.mockResolvedValue({ id: '1' } as any);

      await expect(service.createAccount(createAccountDto, mockTenantId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('createJournalEntry', () => {
    it('should create a journal entry successfully', async () => {
      const createJournalEntryDto = {
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

      const mockJE = { id: '1', ...createJournalEntryDto };
      jeRepo.create.mockReturnValue(mockJE as any);
      jeRepo.save.mockResolvedValue(mockJE as any);
      jelRepo.create.mockReturnValue({} as any);

      const result = await service.createJournalEntry(createJournalEntryDto, mockTenantId);

      expect(jeRepo.create).toHaveBeenCalled();
      expect(jeRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockJE);
    });

    it('should throw error if debits and credits do not balance', async () => {
      const createJournalEntryDto = {
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
            creditInAccountCurrency: 500, // Unbalanced
          },
        ],
      };

      await expect(service.createJournalEntry(createJournalEntryDto, mockTenantId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('createGLEntry', () => {
    it('should create a GL entry successfully', async () => {
      const createGLEntryDto = {
        postingDate: '2024-01-01',
        accountId: 'account-1',
        debit: 1000,
        credit: 0,
        voucherType: 'Journal Entry',
        voucherNo: 'JE-001',
      };

      const mockAccount = { id: 'account-1', name: 'Cash' };
      const mockGLEntry = { id: '1', ...createGLEntryDto };

      accountRepo.findOne.mockResolvedValue(mockAccount as any);
      glRepo.create.mockReturnValue(mockGLEntry as any);
      glRepo.save.mockResolvedValue(mockGLEntry as any);

      const result = await service.createGLEntry(createGLEntryDto, mockTenantId);

      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'account-1', tenant: { id: mockTenantId } },
      });
      expect(result).toEqual(mockGLEntry);
    });

    it('should throw error if account not found', async () => {
      const createGLEntryDto = {
        postingDate: '2024-01-01',
        accountId: 'invalid-account',
        debit: 1000,
        credit: 0,
        voucherType: 'Journal Entry',
        voucherNo: 'JE-001',
      };

      accountRepo.findOne.mockResolvedValue(null);

      await expect(service.createGLEntry(createGLEntryDto, mockTenantId))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw error if both debit and credit are provided', async () => {
      const createGLEntryDto = {
        postingDate: '2024-01-01',
        accountId: 'account-1',
        debit: 1000,
        credit: 500,
        voucherType: 'Journal Entry',
        voucherNo: 'JE-001',
      };

      const mockAccount = { id: 'account-1', name: 'Cash' };
      accountRepo.findOne.mockResolvedValue(mockAccount as any);

      await expect(service.createGLEntry(createGLEntryDto, mockTenantId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getAccountBalance', () => {
    it('should calculate account balance correctly for Asset account', async () => {
      const mockGLEntries = [
        { debit: 1000, credit: 0 },
        { debit: 500, credit: 0 },
        { debit: 0, credit: 200 },
      ];

      const mockAccount = { rootType: 'Asset' };
      accountRepo.findOne.mockResolvedValue(mockAccount as any);
      glRepo.find.mockResolvedValue(mockGLEntries as any);

      const result = await service.getAccountBalance('account-1', '2024-01-31', mockTenantId);

      expect(result.balance).toBe(1300); // 1000 + 500 - 200
      expect(result.totalDebit).toBe(1500);
      expect(result.totalCredit).toBe(200);
    });

    it('should calculate account balance correctly for Liability account', async () => {
      const mockGLEntries = [
        { debit: 200, credit: 0 },
        { debit: 0, credit: 1000 },
        { debit: 0, credit: 500 },
      ];

      const mockAccount = { rootType: 'Liability' };
      accountRepo.findOne.mockResolvedValue(mockAccount as any);
      glRepo.find.mockResolvedValue(mockGLEntries as any);

      const result = await service.getAccountBalance('account-1', '2024-01-31', mockTenantId);

      expect(result.balance).toBe(1300); // 1000 + 500 - 200
      expect(result.totalDebit).toBe(200);
      expect(result.totalCredit).toBe(1500);
    });
  });

  describe('getTrialBalance', () => {
    it('should generate trial balance report', async () => {
      const query = {
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
        company: 'Test Company',
      };

      const mockResults = [
        {
          accountId: 'account-1',
          accountCode: '1000',
          accountName: 'Cash',
          rootType: 'Asset',
          totalDebit: '1500',
          totalCredit: '200',
        },
        {
          accountId: 'account-2',
          accountCode: '2000',
          accountName: 'Accounts Payable',
          rootType: 'Liability',
          totalDebit: '100',
          totalCredit: '1000',
        },
      ];

      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockResults),
      };

      glRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getTrialBalance(query, mockTenantId);

      expect(result).toHaveLength(2);
      expect(result[0].balance).toBe(1300); // Asset: debit - credit
      expect(result[1].balance).toBe(900); // Liability: credit - debit
    });
  });

  describe('createCostCenter', () => {
    it('should create a cost center successfully', async () => {
      const createCostCenterDto = {
        code: 'CC001',
        name: 'Marketing',
        isGroup: false,
      };

      const mockCostCenter = { id: '1', ...createCostCenterDto };
      
      costCenterRepo.findOne.mockResolvedValue(null);
      costCenterRepo.create.mockReturnValue(mockCostCenter as any);
      costCenterRepo.save.mockResolvedValue(mockCostCenter as any);

      const result = await service.createCostCenter(createCostCenterDto, mockTenantId);

      expect(costCenterRepo.findOne).toHaveBeenCalledWith({
        where: { code: 'CC001', tenant: { id: mockTenantId } },
      });
      expect(result).toEqual(mockCostCenter);
    });

    it('should throw error if cost center code already exists', async () => {
      const createCostCenterDto = {
        code: 'CC001',
        name: 'Marketing',
        isGroup: false,
      };

      costCenterRepo.findOne.mockResolvedValue({ id: '1' } as any);

      await expect(service.createCostCenter(createCostCenterDto, mockTenantId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('createFiscalYear', () => {
    it('should create a fiscal year successfully', async () => {
      const createFiscalYearDto = {
        name: 'FY 2024',
        yearStartDate: '2024-01-01',
        yearEndDate: '2024-12-31',
      };

      const mockFiscalYear = { id: '1', ...createFiscalYearDto };
      
      fiscalYearRepo.findOne.mockResolvedValue(null);
      fiscalYearRepo.create.mockReturnValue(mockFiscalYear as any);
      fiscalYearRepo.save.mockResolvedValue(mockFiscalYear as any);

      const result = await service.createFiscalYear(createFiscalYearDto, mockTenantId);

      expect(fiscalYearRepo.findOne).toHaveBeenCalledWith({
        where: { name: 'FY 2024', tenant: { id: mockTenantId } },
      });
      expect(result).toEqual(mockFiscalYear);
    });
  });

  describe('createPaymentEntry', () => {
    it('should create a payment entry successfully', async () => {
      const createPaymentEntryDto = {
        paymentType: 'Pay',
        postingDate: '2024-01-01',
        paidFromAccountId: 'account-1',
        paidToAccountId: 'account-2',
        paidAmount: 1000,
        receivedAmount: 1000,
      };

      const mockAccounts = [
        { id: 'account-1', name: 'Cash' },
        { id: 'account-2', name: 'Supplier' },
      ];

      const mockPaymentEntry = { id: '1', ...createPaymentEntryDto };

      accountRepo.findOne
        .mockResolvedValueOnce(mockAccounts[0] as any)
        .mockResolvedValueOnce(mockAccounts[1] as any);
      paymentRepo.create.mockReturnValue(mockPaymentEntry as any);
      paymentRepo.save.mockResolvedValue(mockPaymentEntry as any);

      const result = await service.createPaymentEntry(createPaymentEntryDto, mockTenantId);

      expect(accountRepo.findOne).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockPaymentEntry);
    });

    it('should throw error if accounts not found', async () => {
      const createPaymentEntryDto = {
        paymentType: 'Pay',
        postingDate: '2024-01-01',
        paidFromAccountId: 'invalid-account',
        paidToAccountId: 'account-2',
        paidAmount: 1000,
        receivedAmount: 1000,
      };

      accountRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'account-2' } as any);

      await expect(service.createPaymentEntry(createPaymentEntryDto, mockTenantId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('postJournalEntryToGL', () => {
    it('should post journal entry to GL successfully', async () => {
      const mockJournalEntry = {
        id: 'je-1',
        docstatus: 1,
        postingDate: '2024-01-01',
        voucherType: 'Journal Entry',
        voucherNo: 'JE-001',
        company: 'Test Company',
        lines: [
          {
            account: { id: 'account-1' },
            debitInAccountCurrency: 1000,
            creditInAccountCurrency: 0,
          },
          {
            account: { id: 'account-2' },
            debitInAccountCurrency: 0,
            creditInAccountCurrency: 1000,
          },
        ],
      };

      jeRepo.findOne.mockResolvedValue(mockJournalEntry as any);
      glRepo.save.mockResolvedValue([{}, {}] as any);

      const result = await service.postJournalEntryToGL('je-1', mockTenantId);

      expect(jeRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'je-1', tenant: { id: mockTenantId } },
        relations: ['lines', 'lines.account'],
      });
      expect(glRepo.save).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should throw error if journal entry not found', async () => {
      jeRepo.findOne.mockResolvedValue(null);

      await expect(service.postJournalEntryToGL('invalid-je', mockTenantId))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw error if journal entry not submitted', async () => {
      const mockJournalEntry = {
        id: 'je-1',
        docstatus: 0,
      };

      jeRepo.findOne.mockResolvedValue(mockJournalEntry as any);

      await expect(service.postJournalEntryToGL('je-1', mockTenantId))
        .rejects.toThrow(BadRequestException);
    });
  });
});