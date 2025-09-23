import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Account } from '../entities/account.entity';
import { JournalEntry } from '../entities/journal-entry.entity';
import { JournalEntryLine } from '../entities/journal-entry-line.entity';
import { GLEntry } from '../entities/gl-entry.entity';
import { CostCenter } from '../entities/cost-center.entity';
import { FiscalYear } from '../entities/fiscal-year.entity';
import { PaymentEntry } from '../entities/payment-entry.entity';
import { CreateAccountDto } from '../dto/create-account.dto';
import { CreateJournalEntryDto } from '../dto/create-journal-entry.dto';
import { CreateGLEntryDto } from '../dto/create-gl-entry.dto';
import { CreateCostCenterDto } from '../dto/create-cost-center.dto';
import { CreateFiscalYearDto } from '../dto/create-fiscal-year.dto';
import { CreatePaymentEntryDto } from '../dto/create-payment-entry.dto';
import { AccountBalanceQueryDto, TrialBalanceQueryDto, GLReportQueryDto } from '../dto/accounting-query.dto';

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    @InjectRepository(JournalEntry) private jeRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine) private jelRepo: Repository<JournalEntryLine>,
    @InjectRepository(GLEntry) private glRepo: Repository<GLEntry>,
    @InjectRepository(CostCenter) private costCenterRepo: Repository<CostCenter>,
    @InjectRepository(FiscalYear) private fiscalYearRepo: Repository<FiscalYear>,
    @InjectRepository(PaymentEntry) private paymentRepo: Repository<PaymentEntry>,
  ) {}

  async createAccount(dto: CreateAccountDto, tenant_id: string) {
    const exists = await this.accountRepo.findOne({
      where: { code: dto.code, tenant: { id: tenant_id } },
    });
    if (exists) {
      throw new BadRequestException('Account code already exists');
    }
    const account = this.accountRepo.create({
      ...dto,
      tenant: { id: tenant_id } as any,
    });
    return this.accountRepo.save(account);
  }

  async listAccounts(tenant_id: string) {
    return this.accountRepo.find({
      where: { tenant: { id: tenant_id } },
      order: { code: 'ASC' },
    });
  }

  async createJournalEntry(dto: CreateJournalEntryDto, tenant_id: string) {
    // Basic debit/credit validation
    const totalDebit = (dto.accounts || []).reduce(
      (s, l) => s + (l.debitInAccountCurrency || 0),
      0,
    );
    const totalCredit = (dto.accounts || []).reduce(
      (s, l) => s + (l.creditInAccountCurrency || 0),
      0,
    );
    if (Number(totalDebit.toFixed(2)) !== Number(totalCredit.toFixed(2))) {
      throw new BadRequestException('Debits and credits must balance');
    }
    const je = this.jeRepo.create({
      voucherType: dto.voucherType,
      postingDate: dto.postingDate,
      company: dto.company,
      referenceNo: dto.referenceNo,
      referenceDate: dto.referenceDate,
      userRemark: dto.userRemark,
      tenant: { id: tenant_id } as any,
      lines: dto.accounts.map((a) =>
        this.jelRepo.create({
          account: a.account,
          debitInAccountCurrency: a.debitInAccountCurrency || 0,
          creditInAccountCurrency: a.creditInAccountCurrency || 0,
          costCenter: a.costCenter,
        }),
      ),
    });
    return this.jeRepo.save(je);
  }

  async listJournalEntries(tenant_id: string) {
    return this.jeRepo.find({
      where: { tenant: { id: tenant_id } },
      relations: ['lines'],
      order: { postingDate: 'DESC' },
    });
  }

  // GL Entry Methods
  async createGLEntry(dto: CreateGLEntryDto, tenant_id: string) {
    // Validate account exists
    const account = await this.accountRepo.findOne({
      where: { id: dto.accountId, tenant: { id: tenant_id } },
    });
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    // Validate debit/credit rules
    if (dto.debit > 0 && dto.credit > 0) {
      throw new BadRequestException('Entry cannot have both debit and credit amounts');
    }
    if (dto.debit === 0 && dto.credit === 0) {
      throw new BadRequestException('Entry must have either debit or credit amount');
    }

    const glEntry = this.glRepo.create({
      ...dto,
      account: { id: dto.accountId } as any,
      tenant: { id: tenant_id } as any,
    });

    return this.glRepo.save(glEntry);
  }

  async postJournalEntryToGL(journalEntryId: string, tenant_id: string) {
    const journalEntry = await this.jeRepo.findOne({
      where: { id: journalEntryId, tenant: { id: tenant_id } },
      relations: ['lines'],
    });

    if (!journalEntry) {
      throw new BadRequestException('Journal Entry not found');
    }

    if (journalEntry.docstatus !== 1) {
      throw new BadRequestException('Journal Entry must be submitted before posting to GL');
    }

    const glEntries: GLEntry[] = [];
    for (const line of journalEntry.lines) {
      // Look up the account entity by code
      const account = await this.accountRepo.findOne({
        where: { code: line.account, tenant: { id: tenant_id } },
      });

      if (!account) {
        throw new BadRequestException(`Account with code ${line.account} not found`);
      }

      if (line.debitInAccountCurrency > 0) {
        const glEntry = this.glRepo.create({
          postingDate: journalEntry.postingDate,
          account: account,
          debit: line.debitInAccountCurrency,
          credit: 0,
          voucherType: 'Journal Entry',
          voucherNo: journalEntry.id,
          costCenter: line.costCenter,
          company: journalEntry.company,
          remarks: journalEntry.userRemark,
          tenant: { id: tenant_id } as any,
        });
        glEntries.push(glEntry);
      }

      if (line.creditInAccountCurrency > 0) {
        const glEntry = this.glRepo.create({
          postingDate: journalEntry.postingDate,
          account: account,
          debit: 0,
          credit: line.creditInAccountCurrency,
          voucherType: 'Journal Entry',
          voucherNo: journalEntry.id,
          costCenter: line.costCenter,
          company: journalEntry.company,
          remarks: journalEntry.userRemark,
          tenant: { id: tenant_id } as any,
        });
        glEntries.push(glEntry);
      }
    }

    return this.glRepo.save(glEntries);
  }

  async getAccountBalance(accountId: string, asOfDate: Date, tenant_id: string) {
    const account = await this.accountRepo.findOne({
      where: { id: accountId, tenant: { id: tenant_id } },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const glEntries = await this.glRepo.find({
      where: {
        account: { id: accountId },
        tenant: { id: tenant_id },
        isCancelled: false,
      },
      relations: ['account', 'tenant'],
    });

    // Filter by date and calculate totals
    const filteredEntries = glEntries.filter(entry => new Date(entry.postingDate) <= asOfDate);
    const totalDebit = filteredEntries.reduce((sum, entry) => sum + Number(entry.debit), 0);
    const totalCredit = filteredEntries.reduce((sum, entry) => sum + Number(entry.credit), 0);

    // Calculate balance based on account type
    let balance = 0;
    if (['Asset', 'Expense'].includes(account.rootType)) {
      balance = totalDebit - totalCredit; // Debit balance
    } else {
      balance = totalCredit - totalDebit; // Credit balance
    }

    return {
      accountId,
      accountName: account.name,
      accountCode: account.code,
      rootType: account.rootType,
      totalDebit,
      totalCredit,
      balance,
      asOfDate,
    };
  }

  async getTrialBalance(query: TrialBalanceQueryDto, tenant_id: string) {
    const { fromDate, toDate, company } = query;

    const queryBuilder = this.glRepo
      .createQueryBuilder('gl')
      .leftJoinAndSelect('gl.account', 'account')
      .select('account.id', 'accountId')
      .addSelect('account.code', 'accountCode')
      .addSelect('account.name', 'accountName')
      .addSelect('account.rootType', 'rootType')
      .addSelect('SUM(gl.debit)', 'totalDebit')
      .addSelect('SUM(gl.credit)', 'totalCredit')
      .where('gl.tenant_id = :tenant_id', { tenant_id })
      .andWhere('gl.isCancelled = 0')
      .groupBy('account.id');

    if (fromDate && toDate) {
      queryBuilder.andWhere('gl.postingDate BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });
    }

    if (company) {
      queryBuilder.andWhere('gl.company = :company', { company });
    }

    const results = await queryBuilder.getRawMany();

    return results.map((result) => {
      const totalDebit = parseFloat(result.totalDebit) || 0;
      const totalCredit = parseFloat(result.totalCredit) || 0;
      
      let balance = 0;
      if (['Asset', 'Expense'].includes(result.rootType)) {
        balance = totalDebit - totalCredit;
      } else {
        balance = totalCredit - totalDebit;
      }

      return {
        accountId: result.accountId,
        accountCode: result.accountCode,
        accountName: result.accountName,
        rootType: result.rootType,
        totalDebit,
        totalCredit,
        balance,
      };
    });
  }

  async getGLReport(query: GLReportQueryDto, tenant_id: string) {
    const { accountId, fromDate, toDate, voucherType } = query;

    const queryBuilder = this.glRepo
      .createQueryBuilder('gl')
      .leftJoinAndSelect('gl.account', 'account')
      .where('gl.tenant_id = :tenant_id', { tenant_id })
      .andWhere('gl.isCancelled = 0')
      .orderBy('gl.postingDate', 'ASC')
      .addOrderBy('gl.creation', 'ASC');

    if (accountId) {
      queryBuilder.andWhere('gl.accountId = :accountId', { accountId });
    }

    if (fromDate && toDate) {
      queryBuilder.andWhere('gl.postingDate BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });
    }

    if (voucherType) {
      queryBuilder.andWhere('gl.voucherType = :voucherType', { voucherType });
    }

    return queryBuilder.getMany();
  }

  // Cost Center Methods
  async createCostCenter(dto: CreateCostCenterDto, tenant_id: string) {
    const exists = await this.costCenterRepo.findOne({
      where: { code: dto.code, tenant: { id: tenant_id } },
    });
    if (exists) {
      throw new BadRequestException('Cost Center code already exists');
    }

    const costCenter = this.costCenterRepo.create({
      ...dto,
      tenant: { id: tenant_id } as any,
    });
    return this.costCenterRepo.save(costCenter);
  }

  async listCostCenters(tenant_id: string) {
    return this.costCenterRepo.find({
      where: { tenant: { id: tenant_id } },
      order: { code: 'ASC' },
    });
  }

  // Fiscal Year Methods
  async createFiscalYear(dto: CreateFiscalYearDto, tenant_id: string) {
    const exists = await this.fiscalYearRepo.findOne({
      where: { name: dto.name, tenant: { id: tenant_id } },
    });
    if (exists) {
      throw new BadRequestException('Fiscal Year already exists');
    }

    const fiscalYear = this.fiscalYearRepo.create({
      ...dto,
      tenant: { id: tenant_id } as any,
    });
    return this.fiscalYearRepo.save(fiscalYear);
  }

  async listFiscalYears(tenant_id: string) {
    return this.fiscalYearRepo.find({
      where: { tenant: { id: tenant_id } },
      order: { yearStartDate: 'DESC' },
    });
  }

  // Payment Entry Methods
  async createPaymentEntry(dto: CreatePaymentEntryDto, tenant_id: string) {
    // Validate accounts exist
    const [paidFromAccount, paidToAccount] = await Promise.all([
      this.accountRepo.findOne({
        where: { id: dto.paidFromAccountId, tenant: { id: tenant_id } },
      }),
      this.accountRepo.findOne({
        where: { id: dto.paidToAccountId, tenant: { id: tenant_id } },
      }),
    ]);

    if (!paidFromAccount || !paidToAccount) {
      throw new BadRequestException('One or both accounts not found');
    }

    const paymentEntry = this.paymentRepo.create({
      ...dto,
      paidFromAccount: { id: dto.paidFromAccountId } as any,
      paidToAccount: { id: dto.paidToAccountId } as any,
      tenant: { id: tenant_id } as any,
    });

    return this.paymentRepo.save(paymentEntry);
  }

  async listPaymentEntries(tenant_id: string) {
    return this.paymentRepo.find({
      where: { tenant: { id: tenant_id } },
      relations: ['paidFromAccount', 'paidToAccount'],
      order: { postingDate: 'DESC' },
    });
  }
}
