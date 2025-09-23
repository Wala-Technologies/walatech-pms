import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AccountingService } from '../services/accounting.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { CreateJournalEntryDto } from '../dto/create-journal-entry.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUsertenant_id } from '../../../decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

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
}
