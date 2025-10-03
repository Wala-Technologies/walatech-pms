import { apiClient, ApiResponse } from './api-client';

// Enums
export enum SupplierStatus {
  ACTIVE = 'Active',
  DISABLED = 'Disabled',
  ON_HOLD = 'On Hold'
}

export enum SupplierType {
  COMPANY = 'Company',
  INDIVIDUAL = 'Individual'
}

export enum QuotationStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  EXPIRED = 'Expired'
}

export enum HoldType {
  ALL = 'All',
  INVOICES = 'Invoices',
  PAYMENTS = 'Payments',
  RFQS = 'RFQs',
  PURCHASE_ORDERS = 'Purchase Orders'
}

export enum PerformanceRating {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  AVERAGE = 'Average',
  POOR = 'Poor'
}

// Core supplier entity interfaces
export interface SupplierGroup {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  parent?: SupplierGroup;
  children?: SupplierGroup[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  type: SupplierType;
  groupId?: string;
  group?: SupplierGroup;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  currency?: string;
  creditLimit?: number;
  paymentTerms?: string;
  taxId?: string;
  gstNumber?: string;
  panNumber?: string;
  bankAccount?: string;
  contactPerson?: string;
  website?: string;
  notes?: string;
  status: SupplierStatus;
  holdType?: HoldType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  id?: string;
  itemCode: string;
  itemName: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
  unit?: string;
}

export interface SupplierQuotation {
  id: string;
  supplierId: string;
  supplier?: Supplier;
  quotationNumber: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: QuotationStatus;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScorecardCriteria {
  id?: string;
  name: string;
  weight: number;
  score: number;
  maxScore: number;
}

export interface SupplierScorecard {
  id: string;
  supplierId: string;
  supplier?: Supplier;
  period: string;
  criteria: ScorecardCriteria[];
  overallScore: number;
  weightedScore: number;
  rating: PerformanceRating;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Query parameter interfaces
export interface SupplierQueryParams {
  search?: string;
  groupId?: string;
  type?: SupplierType;
  status?: SupplierStatus;
  country?: string;
  currency?: string;
  holdType?: HoldType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface SupplierGroupQueryParams {
  search?: string;
  parentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface QuotationQueryParams {
  supplierId?: string;
  status?: QuotationStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ScorecardQueryParams {
  supplierId?: string;
  period?: string;
  rating?: PerformanceRating;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Create/Update DTOs
export interface CreateSupplierDto {
  name: string;
  code: string;
  type: SupplierType;
  groupId?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  currency?: string;
  creditLimit?: number;
  paymentTerms?: string;
  taxId?: string;
  gstNumber?: string;
  panNumber?: string;
  bankAccount?: string;
  contactPerson?: string;
  website?: string;
  notes?: string;
  status?: SupplierStatus;
  isActive?: boolean;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {}

export interface CreateSupplierGroupDto {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface UpdateSupplierGroupDto extends Partial<CreateSupplierGroupDto> {}

export interface CreateQuotationDto {
  supplierId: string;
  quotationNumber: string;
  date: string;
  validUntil: string;
  items: Omit<QuotationItem, 'id'>[];
  notes?: string;
  status?: QuotationStatus;
}

export interface UpdateQuotationDto extends Partial<CreateQuotationDto> {}

export interface CreateScorecardDto {
  supplierId: string;
  period: string;
  criteria: Omit<ScorecardCriteria, 'id'>[];
  notes?: string;
}

export interface UpdateScorecardDto extends Partial<CreateScorecardDto> {}

// Response interfaces for paginated results
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SuppliersResponse {
  suppliers: Supplier[];
  total: number;
}

export interface SupplierGroupsResponse {
  groups: SupplierGroup[];
  total: number;
}

export interface QuotationsResponse {
  quotations: SupplierQuotation[];
  total: number;
}

export interface ScorecardsResponse {
  scorecards: SupplierScorecard[];
  total: number;
}

export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  suppliersOnHold: number;
  totalGroups: number;
  recentQuotations: number;
  averageRating: number;
}

// Supplier API service class
class SupplierApiService {
  // Supplier endpoints
  async getSuppliers(params?: SupplierQueryParams): Promise<ApiResponse<SuppliersResponse>> {
    return apiClient.get('/suppliers', params);
  }

  async getSupplier(id: string): Promise<ApiResponse<Supplier>> {
    return apiClient.get(`/suppliers/${id}`);
  }

  async createSupplier(data: CreateSupplierDto): Promise<ApiResponse<Supplier>> {
    return apiClient.post('/suppliers', data);
  }

  async updateSupplier(id: string, data: UpdateSupplierDto): Promise<ApiResponse<Supplier>> {
    return apiClient.patch(`/suppliers/${id}`, data);
  }

  async deleteSupplier(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/suppliers/${id}`);
  }

  async activateSupplier(id: string): Promise<ApiResponse<Supplier>> {
    return apiClient.patch(`/suppliers/${id}/activate`);
  }

  async deactivateSupplier(id: string): Promise<ApiResponse<Supplier>> {
    return apiClient.patch(`/suppliers/${id}/deactivate`);
  }

  async putSupplierOnHold(id: string, holdType: HoldType): Promise<ApiResponse<Supplier>> {
    return apiClient.patch(`/suppliers/${id}/hold`, { holdType });
  }

  async removeSupplierFromHold(id: string): Promise<ApiResponse<Supplier>> {
    return apiClient.patch(`/suppliers/${id}/unhold`);
  }

  // Supplier Group endpoints
  async getSupplierGroups(params?: SupplierGroupQueryParams): Promise<ApiResponse<SupplierGroupsResponse>> {
    return apiClient.get('/suppliers/groups', params);
  }

  async getSupplierGroup(id: string): Promise<ApiResponse<SupplierGroup>> {
    return apiClient.get(`/suppliers/groups/${id}`);
  }

  async createSupplierGroup(data: CreateSupplierGroupDto): Promise<ApiResponse<SupplierGroup>> {
    return apiClient.post('/suppliers/groups', data);
  }

  async updateSupplierGroup(id: string, data: UpdateSupplierGroupDto): Promise<ApiResponse<SupplierGroup>> {
    return apiClient.patch(`/suppliers/groups/${id}`, data);
  }

  async deleteSupplierGroup(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/suppliers/groups/${id}`);
  }

  // Quotation endpoints
  async getQuotations(params?: QuotationQueryParams): Promise<ApiResponse<QuotationsResponse>> {
    return apiClient.get('/suppliers/quotations', params);
  }

  async getQuotation(id: string): Promise<ApiResponse<SupplierQuotation>> {
    return apiClient.get(`/suppliers/quotations/${id}`);
  }

  async createQuotation(data: CreateQuotationDto): Promise<ApiResponse<SupplierQuotation>> {
    return apiClient.post('/suppliers/quotations', data);
  }

  async updateQuotation(id: string, data: UpdateQuotationDto): Promise<ApiResponse<SupplierQuotation>> {
    return apiClient.patch(`/suppliers/quotations/${id}`, data);
  }

  async deleteQuotation(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/suppliers/quotations/${id}`);
  }

  async approveQuotation(id: string): Promise<ApiResponse<SupplierQuotation>> {
    return apiClient.patch(`/suppliers/quotations/${id}/approve`);
  }

  async rejectQuotation(id: string, reason?: string): Promise<ApiResponse<SupplierQuotation>> {
    return apiClient.patch(`/suppliers/quotations/${id}/reject`, { reason });
  }

  // Scorecard endpoints
  async getScorecards(params?: ScorecardQueryParams): Promise<ApiResponse<ScorecardsResponse>> {
    return apiClient.get('/suppliers/scorecards', params);
  }

  async getScorecard(id: string): Promise<ApiResponse<SupplierScorecard>> {
    return apiClient.get(`/suppliers/scorecards/${id}`);
  }

  async createScorecard(data: CreateScorecardDto): Promise<ApiResponse<SupplierScorecard>> {
    return apiClient.post('/suppliers/scorecards', data);
  }

  async updateScorecard(id: string, data: UpdateScorecardDto): Promise<ApiResponse<SupplierScorecard>> {
    return apiClient.patch(`/suppliers/scorecards/${id}`, data);
  }

  async deleteScorecard(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/suppliers/scorecards/${id}`);
  }

  // Statistics and reporting
  async getSupplierStats(): Promise<ApiResponse<SupplierStats>> {
    return apiClient.get('/suppliers/stats');
  }

  async getTopSuppliers(limit = 10): Promise<ApiResponse<Supplier[]>> {
    return apiClient.get('/suppliers/top', { limit });
  }

  async getSupplierPerformanceTrend(supplierId: string, period = '12m'): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/suppliers/${supplierId}/performance-trend`, { period });
  }

  // Search and filtering
  async searchSuppliers(query: string): Promise<ApiResponse<SuppliersResponse>> {
    return apiClient.get('/suppliers/search', { q: query });
  }

  async getSuppliersByGroup(groupId: string): Promise<ApiResponse<SuppliersResponse>> {
    return apiClient.get(`/suppliers/by-group/${groupId}`);
  }

  // Export functionality
  async exportSuppliers(params?: SupplierQueryParams): Promise<ApiResponse<Blob>> {
    return apiClient.get('/suppliers/export', params);
  }

  async exportQuotations(params?: QuotationQueryParams): Promise<ApiResponse<Blob>> {
    return apiClient.get('/suppliers/quotations/export', params);
  }
}

// Export singleton instance
export const supplierApi = new SupplierApiService();
export default supplierApi;