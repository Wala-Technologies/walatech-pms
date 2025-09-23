import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../entities/account.entity';
import { JournalEntry } from '../entities/journal-entry.entity';
import { JournalEntryLine } from '../entities/journal-entry-line.entity';
import { CreateAccountDto } from '../dto/create-account.dto';
import { CreateJournalEntryDto } from '../dto/create-journal-entry.dto';

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    @InjectRepository(JournalEntry) private jeRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private jelRepo: Repository<JournalEntryLine>,
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
}
