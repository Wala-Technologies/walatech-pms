import { apiClient, ApiResponse } from './api-client';

// Types for accounting entities
export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  parentId?: string;
  isActive: boolean;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryLine {
  id?: string;
  accountId: string;
  account?: Account;
  description: string;
  debitAmount: number;
  creditAmount: number;
}

export interface JournalEntry {
  id?: string;
  entryNumber: string;
  date: string;
  description: string;
  reference?: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GLEntry {
  id: string;
  accountId: string;
  account: Account;
  journalEntryId: string;
  journalEntry: JournalEntry;
  postingDate: string;
  description: string;
  reference: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
}

export interface TrialBalanceEntry {
  accountId: string;
  account: Account;
  debitBalance: number;
  creditBalance: number;
}

export interface AccountBalance {
  accountId: string;
  account: Account;
  balance: number;
  asOfDate: string;
}

// Query parameters for filtering
export interface GLQueryParams {
  accountId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AccountQueryParams {
  type?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface JournalEntryQueryParams {
  startDate?: string;
  endDate?: string;
  isPosted?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Accounting API service class
class AccountingApiService {
  // Chart of Accounts endpoints
  async getAccounts(params?: AccountQueryParams): Promise<ApiResponse<Account[]>> {
    return apiClient.get('/accounting/accounts', params);
  }

  async getAccount(id: string): Promise<ApiResponse<Account>> {
    return apiClient.get(`/accounting/accounts/${id}`);
  }

  async createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Account>> {
    return apiClient.post('/accounting/accounts', account);
  }

  async updateAccount(id: string, account: Partial<Account>): Promise<ApiResponse<Account>> {
    return apiClient.put(`/accounting/accounts/${id}`, account);
  }

  async deleteAccount(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/accounting/accounts/${id}`);
  }

  async getAccountBalance(accountId: string, asOfDate?: string): Promise<ApiResponse<AccountBalance>> {
    const params = asOfDate ? { asOfDate } : undefined;
    return apiClient.get(`/accounting/accounts/${accountId}/balance`, params);
  }

  // Journal Entries endpoints
  async getJournalEntries(params?: JournalEntryQueryParams): Promise<ApiResponse<JournalEntry[]>> {
    return apiClient.get('/accounting/journal-entries', params);
  }

  async getJournalEntry(id: string): Promise<ApiResponse<JournalEntry>> {
    return apiClient.get(`/accounting/journal-entries/${id}`);
  }

  async createJournalEntry(entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<JournalEntry>> {
    return apiClient.post('/accounting/journal-entries', entry);
  }

  async updateJournalEntry(id: string, entry: Partial<JournalEntry>): Promise<ApiResponse<JournalEntry>> {
    return apiClient.put(`/accounting/journal-entries/${id}`, entry);
  }

  async deleteJournalEntry(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/accounting/journal-entries/${id}`);
  }

  async postJournalEntry(id: string): Promise<ApiResponse<JournalEntry>> {
    return apiClient.post(`/accounting/journal-entries/${id}/post`);
  }

  async unpostJournalEntry(id: string): Promise<ApiResponse<JournalEntry>> {
    return apiClient.post(`/accounting/journal-entries/${id}/unpost`);
  }

  // General Ledger endpoints
  async getGLEntries(params?: GLQueryParams): Promise<ApiResponse<GLEntry[]>> {
    return apiClient.get('/accounting/general-ledger', params);
  }

  async getAccountLedger(accountId: string, params?: Omit<GLQueryParams, 'accountId'>): Promise<ApiResponse<GLEntry[]>> {
    return apiClient.get(`/accounting/accounts/${accountId}/ledger`, params);
  }

  // Reports endpoints
  async getTrialBalance(asOfDate?: string): Promise<ApiResponse<TrialBalanceEntry[]>> {
    const params = asOfDate ? { asOfDate } : undefined;
    return apiClient.get('/accounting/reports/trial-balance', params);
  }

  async getBalanceSheet(asOfDate?: string): Promise<ApiResponse<any>> {
    const params = asOfDate ? { asOfDate } : undefined;
    return apiClient.get('/accounting/reports/balance-sheet', params);
  }

  async getIncomeStatement(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const params = startDate && endDate ? { startDate, endDate } : undefined;
    return apiClient.get('/accounting/reports/income-statement', params);
  }

  async getCashFlowStatement(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const params = startDate && endDate ? { startDate, endDate } : undefined;
    return apiClient.get('/accounting/reports/cash-flow', params);
  }

  // Dashboard/Summary endpoints
  async getAccountingSummary(): Promise<ApiResponse<{
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    journalEntriesCount: number;
    accountsCount: number;
  }>> {
    return apiClient.get('/accounting/summary');
  }

  async getRecentActivity(limit?: number): Promise<ApiResponse<{
    recentJournalEntries: JournalEntry[];
    recentGLEntries: GLEntry[];
  }>> {
    const params = limit ? { limit } : undefined;
    return apiClient.get('/accounting/recent-activity', params);
  }

  // Validation endpoints
  async validateJournalEntry(entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>> {
    return apiClient.post('/accounting/journal-entries/validate', entry);
  }

  async validateAccountCode(code: string, excludeId?: string): Promise<ApiResponse<{
    isAvailable: boolean;
    suggestions?: string[];
  }>> {
    const params = excludeId ? { excludeId } : undefined;
    return apiClient.get(`/accounting/accounts/validate-code/${code}`, params);
  }

  // Bulk operations
  async bulkCreateAccounts(accounts: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ApiResponse<Account[]>> {
    return apiClient.post('/accounting/accounts/bulk', { accounts });
  }

  async bulkPostJournalEntries(entryIds: string[]): Promise<ApiResponse<JournalEntry[]>> {
    return apiClient.post('/accounting/journal-entries/bulk-post', { entryIds });
  }

  // Export endpoints
  async exportTrialBalance(asOfDate?: string, format: 'csv' | 'xlsx' | 'pdf' = 'xlsx'): Promise<ApiResponse<{ downloadUrl: string }>> {
    const params = { format, ...(asOfDate && { asOfDate }) };
    return apiClient.get('/accounting/reports/trial-balance/export', params);
  }

  async exportGLEntries(params?: GLQueryParams & { format?: 'csv' | 'xlsx' | 'pdf' }): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.get('/accounting/general-ledger/export', params);
  }

  async exportJournalEntries(params?: JournalEntryQueryParams & { format?: 'csv' | 'xlsx' | 'pdf' }): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.get('/accounting/journal-entries/export', params);
  }
}

// Create and export singleton instance
export const accountingApi = new AccountingApiService();

// Export the class for potential custom instances
export { AccountingApiService };

// Helper function for handling accounting API responses
export function handleAccountingApiResponse<T>(
  response: ApiResponse<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
): boolean {
  if (response.error) {
    if (onError) {
      onError(response.error);
    }
    return false;
  }

  if (response.data && onSuccess) {
    onSuccess(response.data);
  }

  return true;
}