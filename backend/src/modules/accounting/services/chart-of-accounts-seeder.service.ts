import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountRootType } from '../entities/account.entity';

interface AccountSeed {
  code: string;
  name: string;
  rootType: AccountRootType;
  isGroup: boolean;
  parentCode?: string;
  currency?: string;
  description?: string;
}

@Injectable()
export class ChartOfAccountsSeederService {
  constructor(
    @InjectRepository(Account) private accountRepo: Repository<Account>,
  ) {}

  async seedStandardChartOfAccounts(tenantId: string, company: string) {
    const standardAccounts: AccountSeed[] = [
      // Assets
      { code: '1000', name: 'Assets', rootType: 'Asset', isGroup: true },
      { code: '1100', name: 'Current Assets', rootType: 'Asset', isGroup: true, parentCode: '1000' },
      { code: '1110', name: 'Cash and Bank', rootType: 'Asset', isGroup: true, parentCode: '1100' },
      { code: '1111', name: 'Cash in Hand', rootType: 'Asset', isGroup: false, parentCode: '1110', currency: 'USD' },
      { code: '1112', name: 'Bank Account - Main', rootType: 'Asset', isGroup: false, parentCode: '1110', currency: 'USD' },
      { code: '1120', name: 'Accounts Receivable', rootType: 'Asset', isGroup: true, parentCode: '1100' },
      { code: '1121', name: 'Debtors', rootType: 'Asset', isGroup: false, parentCode: '1120', currency: 'USD' },
      { code: '1130', name: 'Inventory', rootType: 'Asset', isGroup: true, parentCode: '1100' },
      { code: '1131', name: 'Stock in Hand', rootType: 'Asset', isGroup: false, parentCode: '1130', currency: 'USD' },
      { code: '1140', name: 'Prepaid Expenses', rootType: 'Asset', isGroup: false, parentCode: '1100', currency: 'USD' },

      { code: '1200', name: 'Fixed Assets', rootType: 'Asset', isGroup: true, parentCode: '1000' },
      { code: '1210', name: 'Property, Plant & Equipment', rootType: 'Asset', isGroup: true, parentCode: '1200' },
      { code: '1211', name: 'Buildings', rootType: 'Asset', isGroup: false, parentCode: '1210', currency: 'USD' },
      { code: '1212', name: 'Machinery', rootType: 'Asset', isGroup: false, parentCode: '1210', currency: 'USD' },
      { code: '1213', name: 'Furniture & Fixtures', rootType: 'Asset', isGroup: false, parentCode: '1210', currency: 'USD' },
      { code: '1214', name: 'Computer Equipment', rootType: 'Asset', isGroup: false, parentCode: '1210', currency: 'USD' },
      { code: '1220', name: 'Accumulated Depreciation', rootType: 'Asset', isGroup: true, parentCode: '1200' },
      { code: '1221', name: 'Accumulated Depreciation - Buildings', rootType: 'Asset', isGroup: false, parentCode: '1220', currency: 'USD' },
      { code: '1222', name: 'Accumulated Depreciation - Machinery', rootType: 'Asset', isGroup: false, parentCode: '1220', currency: 'USD' },

      // Liabilities
      { code: '2000', name: 'Liabilities', rootType: 'Liability', isGroup: true },
      { code: '2100', name: 'Current Liabilities', rootType: 'Liability', isGroup: true, parentCode: '2000' },
      { code: '2110', name: 'Accounts Payable', rootType: 'Liability', isGroup: true, parentCode: '2100' },
      { code: '2111', name: 'Creditors', rootType: 'Liability', isGroup: false, parentCode: '2110', currency: 'USD' },
      { code: '2120', name: 'Accrued Expenses', rootType: 'Liability', isGroup: false, parentCode: '2100', currency: 'USD' },
      { code: '2130', name: 'Short-term Loans', rootType: 'Liability', isGroup: false, parentCode: '2100', currency: 'USD' },
      { code: '2140', name: 'Tax Payable', rootType: 'Liability', isGroup: true, parentCode: '2100' },
      { code: '2141', name: 'VAT Payable', rootType: 'Liability', isGroup: false, parentCode: '2140', currency: 'USD' },
      { code: '2142', name: 'Income Tax Payable', rootType: 'Liability', isGroup: false, parentCode: '2140', currency: 'USD' },

      { code: '2200', name: 'Long-term Liabilities', rootType: 'Liability', isGroup: true, parentCode: '2000' },
      { code: '2210', name: 'Long-term Loans', rootType: 'Liability', isGroup: false, parentCode: '2200', currency: 'USD' },
      { code: '2220', name: 'Mortgage Payable', rootType: 'Liability', isGroup: false, parentCode: '2200', currency: 'USD' },

      // Equity
      { code: '3000', name: 'Equity', rootType: 'Equity', isGroup: true },
      { code: '3100', name: 'Share Capital', rootType: 'Equity', isGroup: false, parentCode: '3000', currency: 'USD' },
      { code: '3200', name: 'Retained Earnings', rootType: 'Equity', isGroup: false, parentCode: '3000', currency: 'USD' },
      { code: '3300', name: 'Current Year Earnings', rootType: 'Equity', isGroup: false, parentCode: '3000', currency: 'USD' },

      // Income
      { code: '4000', name: 'Income', rootType: 'Income', isGroup: true },
      { code: '4100', name: 'Sales Revenue', rootType: 'Income', isGroup: true, parentCode: '4000' },
      { code: '4110', name: 'Product Sales', rootType: 'Income', isGroup: false, parentCode: '4100', currency: 'USD' },
      { code: '4120', name: 'Service Revenue', rootType: 'Income', isGroup: false, parentCode: '4100', currency: 'USD' },
      { code: '4200', name: 'Other Income', rootType: 'Income', isGroup: true, parentCode: '4000' },
      { code: '4210', name: 'Interest Income', rootType: 'Income', isGroup: false, parentCode: '4200', currency: 'USD' },
      { code: '4220', name: 'Rental Income', rootType: 'Income', isGroup: false, parentCode: '4200', currency: 'USD' },

      // Expenses
      { code: '5000', name: 'Expenses', rootType: 'Expense', isGroup: true },
      { code: '5100', name: 'Cost of Goods Sold', rootType: 'Expense', isGroup: true, parentCode: '5000' },
      { code: '5110', name: 'Material Costs', rootType: 'Expense', isGroup: false, parentCode: '5100', currency: 'USD' },
      { code: '5120', name: 'Labor Costs', rootType: 'Expense', isGroup: false, parentCode: '5100', currency: 'USD' },
      { code: '5130', name: 'Manufacturing Overhead', rootType: 'Expense', isGroup: false, parentCode: '5100', currency: 'USD' },

      { code: '5200', name: 'Operating Expenses', rootType: 'Expense', isGroup: true, parentCode: '5000' },
      { code: '5210', name: 'Salaries and Wages', rootType: 'Expense', isGroup: false, parentCode: '5200', currency: 'USD' },
      { code: '5220', name: 'Rent Expense', rootType: 'Expense', isGroup: false, parentCode: '5200', currency: 'USD' },
      { code: '5230', name: 'Utilities Expense', rootType: 'Expense', isGroup: false, parentCode: '5200', currency: 'USD' },
      { code: '5240', name: 'Office Supplies', rootType: 'Expense', isGroup: false, parentCode: '5200', currency: 'USD' },
      { code: '5250', name: 'Marketing Expense', rootType: 'Expense', isGroup: false, parentCode: '5200', currency: 'USD' },
      { code: '5260', name: 'Travel Expense', rootType: 'Expense', isGroup: false, parentCode: '5200', currency: 'USD' },
      { code: '5270', name: 'Professional Fees', rootType: 'Expense', isGroup: false, parentCode: '5200', currency: 'USD' },
      { code: '5280', name: 'Insurance Expense', rootType: 'Expense', isGroup: false, parentCode: '5200', currency: 'USD' },
      { code: '5290', name: 'Depreciation Expense', rootType: 'Expense', isGroup: false, parentCode: '5200', currency: 'USD' },

      { code: '5300', name: 'Financial Expenses', rootType: 'Expense', isGroup: true, parentCode: '5000' },
      { code: '5310', name: 'Interest Expense', rootType: 'Expense', isGroup: false, parentCode: '5300', currency: 'USD' },
      { code: '5320', name: 'Bank Charges', rootType: 'Expense', isGroup: false, parentCode: '5300', currency: 'USD' },
    ];

    // Create accounts with proper parent relationships
    const accountMap = new Map<string, Account>();

    // First pass: Create all accounts without parent relationships
    for (const accountSeed of standardAccounts) {
      const existingAccount = await this.accountRepo.findOne({
        where: { code: accountSeed.code, tenant: { id: tenantId } },
      });

      if (!existingAccount) {
        const account = this.accountRepo.create({
          code: accountSeed.code,
          name: accountSeed.name,
          rootType: accountSeed.rootType,
          isGroup: accountSeed.isGroup,
          currency: accountSeed.currency,
          description: accountSeed.description,
          tenant: { id: tenantId } as any,
        });

        const savedAccount = await this.accountRepo.save(account);
        accountMap.set(accountSeed.code, savedAccount);
      } else {
        accountMap.set(accountSeed.code, existingAccount);
      }
    }

    // Second pass: Update parent relationships
    for (const accountSeed of standardAccounts) {
      if (accountSeed.parentCode) {
        const account = accountMap.get(accountSeed.code);
        const parentAccount = accountMap.get(accountSeed.parentCode);

        if (account && parentAccount) {
          account.parentAccountId = parentAccount.id;
          await this.accountRepo.save(account);
        }
      }
    }

    return accountMap;
  }

  async seedDefaultCostCenters(tenantId: string, company: string) {
    // This would be implemented similarly for cost centers
    // For now, returning empty array
    return [];
  }

  async seedDefaultFiscalYear(tenantId: string) {
    // This would create a default fiscal year
    // For now, returning null
    return null;
  }
}