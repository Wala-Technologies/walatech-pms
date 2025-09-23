import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingController } from './controllers/accounting.controller';
import { AccountingService } from './services/accounting.service';
import { ChartOfAccountsSeederService } from './services/chart-of-accounts-seeder.service';
import { Account } from './entities/account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { GLEntry } from './entities/gl-entry.entity';
import { CostCenter } from './entities/cost-center.entity';
import { FiscalYear } from './entities/fiscal-year.entity';
import { PaymentEntry } from './entities/payment-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      JournalEntry,
      JournalEntryLine,
      GLEntry,
      CostCenter,
      FiscalYear,
      PaymentEntry,
    ]),
  ],
  controllers: [AccountingController],
  providers: [AccountingService, ChartOfAccountsSeederService],
  exports: [AccountingService, ChartOfAccountsSeederService],
})
export class AccountingModule {}
