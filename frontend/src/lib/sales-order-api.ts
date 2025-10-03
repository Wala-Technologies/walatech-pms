import { apiClient, ApiResponse } from './api-client';

export interface SalesOrderItem {
  id?: string;
  item_code: string;
  item_name: string;
  description?: string;
  qty: number;
  rate: number;
  amount?: number;
  base_rate?: number;
  base_amount?: number;
  delivery_date: string;
  warehouse?: string;
  uom?: string;
  stock_uom?: string;
  conversion_factor?: number;
  delivered_qty?: number;
  billed_qty?: number;
  returned_qty?: number;
  discount_percentage?: number;
  discount_amount?: number;
  net_rate?: number;
  net_amount?: number;
  item_group?: string;
  brand?: string;
  image?: string;
  item_tax_template?: string;
  weight_per_unit?: number;
  weight_uom?: string;
  total_weight?: number;
  is_free_item?: boolean;
  is_stock_item?: boolean;
  supplier?: string;
  supplier_delivers_to_customer?: boolean;
}

export interface SalesOrder {
  id: string;
  name: string;
  customer_id: string;
  customer_name: string;
  transaction_date: string;
  delivery_date: string;
  order_type: 'Sales' | 'Maintenance' | 'Shopping Cart';
  status: 'Draft' | 'On Hold' | 'To Deliver and Bill' | 'To Bill' | 'To Deliver' | 'Completed' | 'Cancelled' | 'Closed';
  currency: string;
  conversion_rate: number;
  selling_price_list?: string;
  total_qty: number;
  base_total: number;
  base_net_total: number;
  total_taxes_and_charges: number;
  base_grand_total: number;
  grand_total: number;
  advance_paid: number;
  customer_po_no?: string;
  customer_po_date?: string;
  terms?: string;
  remarks?: string;
  territory?: string;
  sales_person?: string;
  commission_rate: number;
  total_commission: number;
  docstatus: number;
  is_return: boolean;
  skip_delivery_note: boolean;
  company_address?: string;
  customer_address?: string;
  shipping_address?: string;
  contact_person?: string;
  contact_email?: string;
  contact_mobile?: string;
  items: SalesOrderItem[];
  creation: string;
  modified: string;
  owner?: string;
  modified_by?: string;
}

export interface CreateSalesOrderData {
  customer_id: string;
  transaction_date: string;
  delivery_date: string;
  order_type?: 'Sales' | 'Maintenance' | 'Shopping Cart';
  currency?: string;
  conversion_rate?: number;
  selling_price_list?: string;
  customer_po_no?: string;
  customer_po_date?: string;
  terms?: string;
  remarks?: string;
  territory?: string;
  sales_person?: string;
  commission_rate?: number;
  company_address?: string;
  customer_address?: string;
  shipping_address?: string;
  contact_person?: string;
  contact_email?: string;
  contact_mobile?: string;
  items: Omit<SalesOrderItem, 'id' | 'amount' | 'base_rate' | 'base_amount' | 'net_rate' | 'net_amount'>[];
}

export interface UpdateSalesOrderData extends Partial<Omit<CreateSalesOrderData, 'customer_id'>> {}

export interface SalesOrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  order_type?: string;
  customer_id?: string;
  sales_person?: string;
  territory?: string;
  from_date?: string;
  to_date?: string;
  from_delivery_date?: string;
  to_delivery_date?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export interface SalesOrderListResponse {
  data: SalesOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface SalesOrderStats {
  total: number;
  draft: number;
  submitted: number;
  completed: number;
  cancelled: number;
  byStatus: { [key: string]: number };
  byOrderType: { [key: string]: number };
  totalValue: number;
  averageOrderValue: number;
}

class SalesOrderApi {
  // Get all sales orders with filtering and pagination
  async getSalesOrders(params?: SalesOrderQueryParams): Promise<ApiResponse<SalesOrderListResponse>> {
    return apiClient.get('/sales-orders', params);
  }

  // Get a single sales order by ID
  async getSalesOrder(id: string): Promise<ApiResponse<SalesOrder>> {
    return apiClient.get(`/sales-orders/${id}`);
  }

  // Create a new sales order
  async createSalesOrder(data: CreateSalesOrderData): Promise<ApiResponse<SalesOrder>> {
    return apiClient.post('/sales-orders', data);
  }

  // Update an existing sales order
  async updateSalesOrder(id: string, data: UpdateSalesOrderData): Promise<ApiResponse<SalesOrder>> {
    return apiClient.patch(`/sales-orders/${id}`, data);
  }

  // Delete a sales order
  async deleteSalesOrder(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/sales-orders/${id}`);
  }

  // Submit a sales order (change status from Draft to submitted)
  async submitSalesOrder(id: string): Promise<ApiResponse<SalesOrder>> {
    return apiClient.post(`/sales-orders/${id}/submit`);
  }

  // Cancel a sales order
  async cancelSalesOrder(id: string): Promise<ApiResponse<SalesOrder>> {
    return apiClient.post(`/sales-orders/${id}/cancel`);
  }

  // Close a sales order
  async closeSalesOrder(id: string): Promise<ApiResponse<SalesOrder>> {
    return apiClient.post(`/sales-orders/${id}/close`);
  }

  // Put a sales order on hold
  async holdSalesOrder(id: string): Promise<ApiResponse<SalesOrder>> {
    return apiClient.post(`/sales-orders/${id}/hold`);
  }

  // Resume a sales order from hold
  async resumeSalesOrder(id: string): Promise<ApiResponse<SalesOrder>> {
    return apiClient.post(`/sales-orders/${id}/resume`);
  }

  // Get sales order statistics
  async getSalesOrderStats(): Promise<ApiResponse<SalesOrderStats>> {
    return apiClient.get('/sales-orders/stats');
  }

  // Export sales orders to CSV/Excel
  async exportSalesOrders(params?: SalesOrderQueryParams): Promise<ApiResponse<Blob>> {
    return apiClient.get('/sales-orders/export', params);
  }
}

export const salesOrderApi = new SalesOrderApi();
export default salesOrderApi;