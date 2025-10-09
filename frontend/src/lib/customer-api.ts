import { apiClient, ApiResponse } from './api-client';

// Types for customer entities aligned with backend expectations
export interface Customer {
  id: string;
  customer_name: string;
  customer_code?: string;
  customer_type: 'Individual' | 'Company' | string;
  email?: string;
  mobile_no?: string;
  phone?: string;
  website?: string;
  tax_id?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_country?: string;
  billing_pincode?: string;
  shipping_address_line1?: string;
  shipping_address_line2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_pincode?: string;
  credit_limit?: number;
  payment_terms?: string;
  is_frozen?: boolean;
  disabled?: boolean;
  notes?: string;
  creation?: string;
  modified?: string;
  department_id?: string;
  tenant_id?: string;
}

export interface CustomerCreateDto {
  customer_name: string;
  customer_code?: string;
  customer_type: string;
  email?: string;
  mobile_no?: string;
  phone?: string;
  website?: string;
  tax_id?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_country?: string;
  billing_pincode?: string;
  shipping_address_line1?: string;
  shipping_address_line2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_pincode?: string;
  credit_limit?: number;
  payment_terms?: string;
  is_frozen?: boolean;
  disabled?: boolean;
  notes?: string;
  department_id?: string;
}

export interface CustomerUpdateDto extends Partial<CustomerCreateDto> {}

export interface CustomersResponse {
  customers: Customer[];
  total: number;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  customer_type?: string;
  country?: string;
  disabled?: boolean;
  is_frozen?: boolean;
}

export interface CustomerStats {
  total: number;
  active: number;
  disabled: number;
  frozen: number;
  byType?: Record<string, number>;
  byCountry?: Record<string, number>;
}

class CustomerApiService {
  // CRUD endpoints
  async getCustomers(params?: CustomerQueryParams): Promise<ApiResponse<CustomersResponse>> {
    return apiClient.get('/customers', params as any);
  }

  async getCustomer(id: string): Promise<ApiResponse<Customer>> {
    return apiClient.get(`/customers/${id}`);
  }

  async createCustomer(data: CustomerCreateDto): Promise<ApiResponse<Customer>> {
    return apiClient.post('/customers', data);
  }

  async updateCustomer(id: string, data: CustomerUpdateDto): Promise<ApiResponse<Customer>> {
    return apiClient.patch(`/customers/${id}`, data);
  }

  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/customers/${id}`);
  }

  // Stats and search
  async getCustomerStats(): Promise<ApiResponse<CustomerStats>> {
    return apiClient.get('/customers/stats');
  }

  async searchCustomers(query: string, limit?: number): Promise<ApiResponse<Customer[]>> {
    const params: Record<string, any> = { q: query };
    if (limit) params.limit = limit;
    return apiClient.get('/customers/search', params);
  }

  async getCustomersByType(type: string): Promise<ApiResponse<Customer[]>> {
    return apiClient.get('/customers/by-type', { type });
  }

  async getCustomersByCountry(country: string): Promise<ApiResponse<Customer[]>> {
    return apiClient.get('/customers/by-country', { country });
  }
}

export const customerApi = new CustomerApiService();
export default customerApi;