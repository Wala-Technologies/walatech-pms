import { Controller, Post, Body, Get, UseGuards, Query, Param } from '@nestjs/common';
import { AccountingService } from '../services/accounting.service';
import { ChartOfAccountsSeederService } from '../services/chart-of-accounts-seeder.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { CreateJournalEntryDto } from '../dto/create-journal-entry.dto';
import { CreateGLEntryDto } from '../dto/create-gl-entry.dto';
import { CreateCostCenterDto } from '../dto/create-cost-center.dto';
import { CreateFiscalYearDto } from '../dto/create-fiscal-year.dto';
import { CreatePaymentEntryDto } from '../dto/create-payment-entry.dto';
import { AccountBalanceQueryDto, TrialBalanceQueryDto, GLReportQueryDto } from '../dto/accounting-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUsertenant_id } from '../../../decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('accounting')
export class AccountingController {
  constructor(
    private readonly accountingService: AccountingService,
    private readonly seederService: ChartOfAccountsSeederService,
  ) {}

  @Post('accounts')
  createAccount(
    @Body() dto: CreateAccountDto,
    @CurrentUsertenant_id() tenant_id: string,
  ) {
    if (!tenant_id) throw new Error('Tenant context missing');
    return this.accountingService.createAccount(dto, tenant_id);
  }

  @Get('accounts')
  listAccounts(@CurrentUsertenant_id() tenant_id: string) {
    if (!tenant_id) throw new Error('Tenant context missing');
    return this.accountingService.listAccounts(tenant_id);
  }

  @Post('journal-entries')
  createJournalEntry(
    @Body() dto: CreateJournalEntryDto,
    @CurrentUsertenant_id() tenant_id: string,
  ) {
    if (!tenant_id) throw new Error('Tenant context missing');
    return this.accountingService.createJournalEntry(dto, tenant_id);
  }

  @Get('journal-entries')
  listJournalEntries(@CurrentUsertenant_id() tenant_id: string) {
    if (!tenant_id) throw new Error('Tenant context missing');
    return this.accountingService.listJournalEntries(tenant_id);
  }

  @Post('seed-chart-of-accounts')
  async seedChartOfAccounts(@CurrentUsertenant_id() tenantId: string) {
    return this.seederService.seedStandardChartOfAccounts(tenantId, 'Default Company');
  }

  // GL Entry endpoints
  @Post('gl-entries')
  async createGLEntry(
    @Body() createGLEntryDto: CreateGLEntryDto,
    @CurrentUsertenant_id() tenantId: string
  ) {
    return this.accountingService.createGLEntry(createGLEntryDto, tenantId);
  }

  @Get('gl-entries')
  async getGLReport(
    @Query() query: GLReportQueryDto,
    @CurrentUsertenant_id() tenantId: string
  ) {
    return this.accountingService.getGLReport(query, tenantId);
  }

  // Cost Center endpoints
  @Post('cost-centers')
  async createCostCenter(
    @Body() createCostCenterDto: CreateCostCenterDto,
    @CurrentUsertenant_id() tenantId: string
  ) {
    return this.accountingService.createCostCenter(createCostCenterDto, tenantId);
  }

  @Get('cost-centers')
  async listCostCenters(@CurrentUsertenant_id() tenantId: string) {
    return this.accountingService.listCostCenters(tenantId);
  }

  // Fiscal Year endpoints
  @Post('fiscal-years')
  async createFiscalYear(
    @Body() createFiscalYearDto: CreateFiscalYearDto,
    @CurrentUsertenant_id() tenantId: string
  ) {
    return this.accountingService.createFiscalYear(createFiscalYearDto, tenantId);
  }

  @Get('fiscal-years')
  async listFiscalYears(@CurrentUsertenant_id() tenantId: string) {
    return this.accountingService.listFiscalYears(tenantId);
  }

  // Payment Entry endpoints
  @Post('payment-entries')
  async createPaymentEntry(
    @Body() createPaymentEntryDto: CreatePaymentEntryDto,
    @CurrentUsertenant_id() tenantId: string
  ) {
    return this.accountingService.createPaymentEntry(createPaymentEntryDto, tenantId);
  }

  @Get('payment-entries')
  async listPaymentEntries(@CurrentUsertenant_id() tenantId: string) {
    return this.accountingService.listPaymentEntries(tenantId);
  }

  // Account Balance endpoint
  @Get('accounts/:accountId/balance')
  async getAccountBalance(
    @Param('accountId') accountId: string,
    @Query() query: AccountBalanceQueryDto,
    @CurrentUsertenant_id() tenantId: string
  ) {
    const asOfDate = query.asOfDate ? new Date(query.asOfDate) : new Date();
    return this.accountingService.getAccountBalance(accountId, asOfDate, tenantId);
  }

  // Trial Balance endpoint
  @Get('reports/trial-balance')
  async getTrialBalance(
    @Query() query: TrialBalanceQueryDto,
    @CurrentUsertenant_id() tenantId: string
  ) {
    return this.accountingService.getTrialBalance(query, tenantId);
  }

  // Profit & Loss Statement endpoint
  @Get('reports/profit-loss')
  async getProfitLossStatement(
    @Query() query: TrialBalanceQueryDto,
    @CurrentUsertenant_id() tenantId: string
  ) {
    const trialBalance = await this.accountingService.getTrialBalance(query, tenantId);
    
    // Filter for Income and Expense accounts
    const incomeAccounts = trialBalance.filter(account => 
      account.rootType === 'Income'
    );
    const expenseAccounts = trialBalance.filter(account => 
      account.rootType === 'Expense'
    );

    const totalIncome = incomeAccounts.reduce((sum, account) => sum + account.totalCredit - account.totalDebit, 0);
    const totalExpenses = expenseAccounts.reduce((sum, account) => sum + account.totalDebit - account.totalCredit, 0);
    const netIncome = totalIncome - totalExpenses;

    return {
      period: {
        fromDate: query.fromDate,
        toDate: query.toDate,
        company: query.company
      },
      income: {
        accounts: incomeAccounts,
        total: totalIncome
      },
      expenses: {
        accounts: expenseAccounts,
        total: totalExpenses
      },
      netIncome
    };
  }

  // Balance Sheet endpoint
  @Get('reports/balance-sheet')
  async getBalanceSheet(
    @Query() query: TrialBalanceQueryDto,
    @CurrentUsertenant_id() tenantId: string
  ) {
    const trialBalance = await this.accountingService.getTrialBalance(query, tenantId);
    
    // Filter for Balance Sheet accounts
    const assetAccounts = trialBalance.filter(account => 
      account.rootType === 'Asset'
    );
    const liabilityAccounts = trialBalance.filter(account => 
      account.rootType === 'Liability'
    );
    const equityAccounts = trialBalance.filter(account => 
      account.rootType === 'Equity'
    );

    const totalAssets = assetAccounts.reduce((sum, account) => sum + account.totalDebit - account.totalCredit, 0);
    const totalLiabilities = liabilityAccounts.reduce((sum, account) => sum + account.totalCredit - account.totalDebit, 0);
    const totalEquity = equityAccounts.reduce((sum, account) => sum + account.totalCredit - account.totalDebit, 0);

    return {
      asOfDate: query.toDate,
      company: query.company,
      assets: {
        accounts: assetAccounts,
        total: totalAssets
      },
      liabilities: {
        accounts: liabilityAccounts,
        total: totalLiabilities
      },
      equity: {
        accounts: equityAccounts,
        total: totalEquity
      },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity
    };
  }

  // Post Journal Entry to GL
  @Post('journal-entries/:id/post-to-gl')
  async postJournalEntryToGL(
    @Param('id') journalEntryId: string,
    @CurrentUsertenant_id() tenantId: string
  ) {
    return this.accountingService.postJournalEntryToGL(journalEntryId, tenantId);
  }
}
