import { Tenant } from '../contexts/tenant-context';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiClientConfig {
  baseUrl?: string;
  tenantSubdomain?: string;
  token?: string;
}

class ApiClient {
  private baseUrl: string;
  private tenantSubdomain?: string;
  private token?: string;

  constructor(config: ApiClientConfig = {}) {
    this.tenantSubdomain = config.tenantSubdomain;
    this.token = config.token;
    this.baseUrl = this.buildBaseUrl(config.baseUrl);
    // TODO: Replace broad 'any' usages with specific interfaces incrementally.
    // Temporary eslint disable for unavoidable generics during refactor.
    /* eslint-disable @typescript-eslint/no-explicit-any */
  }

  // Set tenant context (for backward compatibility, but not used for URL building)
  setTenantContext(subdomain: string): void {
    this.tenantSubdomain = subdomain;
    // Note: Tenant context is handled via JWT token, not URL modification
  }

  private buildBaseUrl(customBaseUrl?: string): string {
    if (customBaseUrl) {
      return customBaseUrl;
    }

    // Always use the base API URL - tenant context is handled via JWT token
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    return raw.replace(/\/$/, ''); // ensure no trailing slash
  }

  // Set authentication token
  setToken(token: string): void {
    this.token = token;
  }

  // Get tenant subdomain from cookie or URL
  private getTenantSubdomain(): string | null {
    if (this.tenantSubdomain) {
      return this.tenantSubdomain;
    }

    if (typeof window === 'undefined') return null;

    // Try to get from cookie first
    const cookies = document.cookie.split(';');
    const tenantCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('tenant-subdomain=')
    );

    if (tenantCookie) {
      return tenantCookie.split('=')[1];
    }

    // Fallback to extracting from hostname
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    if (hostname.endsWith('.localhost') && parts.length >= 2) {
      return parts[0];
    }

    if (parts.length >= 3 && !hostname.startsWith('www.')) {
      return parts[0];
    }

    return null;
  }

  // Get authentication token from localStorage or cookie
  private getAuthToken(): string | null {
    if (this.token) {
      return this.token;
    }

    if (typeof window === 'undefined') return null;

    // Try localStorage first - check both 'token' and 'auth_token' keys
    const token =
      localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      return token;
    }

    // Try cookie as fallback
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(
      (cookie) =>
        cookie.trim().startsWith('auth_token=') ||
        cookie.trim().startsWith('token=')
    );

    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }

    return null;
  }

  // Build headers with tenant and auth context
  private buildHeaders(
    customHeaders: Record<string, string> = {},
    skipContentType = false,
    overrideTenantSubdomain?: string
  ): Record<string, string> {
    const headers: Record<string, string> = {
      ...customHeaders,
    };

    // Only set Content-Type if not skipped (for FormData requests)
    if (!skipContentType) {
      headers['Content-Type'] = 'application/json';
    }

    // Add tenant context (use override if provided)
    const tenantSubdomain = overrideTenantSubdomain || this.getTenantSubdomain();
    if (tenantSubdomain) {
      headers['x-tenant-subdomain'] = tenantSubdomain;
    }

    // Add authentication
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method
  // Generic request (typed later per call site)
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.requestWithContentType<T>(endpoint, options, false);
  }

  // Generic request method with content type control
  private async requestWithContentType<T = any>(
    endpoint: string,
    options: RequestInit = {},
    skipContentType = false,
    overrideTenantSubdomain?: string
  ): Promise<ApiResponse<T>> {
    try {
      // Normalize endpoint & ensure /api prefix only once
      let ep = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const baseHasApi = /\/api$/.test(this.baseUrl);
      if (!ep.startsWith('/api/')) {
        ep = baseHasApi ? ep : `/api${ep}`;
      }
      const url = `${this.baseUrl}${ep}`;

      const response = await fetch(url, {
        ...options,
        headers: this.buildHeaders(
          options.headers as Record<string, string>,
          skipContentType,
          overrideTenantSubdomain
        ),
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        return {
          error:
            (data && (data.message || data.error)) ||
            `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // HTTP methods
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return this.request<T>(url, { method: 'GET' });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const requestOptions: RequestInit = {
      method: 'POST',
      ...options,
    };

    const isFormData = data instanceof FormData;

    // Handle FormData differently - don't stringify it
    if (isFormData) {
      requestOptions.body = data;
    } else if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    return this.requestWithContentType<T>(endpoint, requestOptions, isFormData);
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Tenant-specific API methods
  async getTenantBySubdomain(subdomain: string): Promise<ApiResponse<Tenant>> {
    return this.get<Tenant>(`/tenants/by-subdomain/${subdomain}`);
  }

  async validateTenant(
    subdomain: string
  ): Promise<ApiResponse<{ valid: boolean }>> {
    return this.get<{ valid: boolean }>(`/tenants/validate/${subdomain}`);
  }

  async getTenantSettings(): Promise<ApiResponse<any>> {
    return this.get('/tenant-settings');
  }

  async updateTenantSettings(settings: any): Promise<ApiResponse<any>> {
    return this.put('/tenant-settings', { settings });
  }

  async resetTenantSettings(): Promise<ApiResponse<any>> {
    return this.post('/tenant-settings/reset');
  }

  // Authentication methods
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: any; access_token: string }>> {
    return this.post('/auth/login', { email, password });
  }

  async register(
    userData: any
  ): Promise<ApiResponse<{ user: any; access_token: string }>> {
    return this.post('/auth/register', userData);
  }

  // Methods for super admin tenant switching
  async getWithTenant<T = any>(
    endpoint: string,
    tenantSubdomain: string
  ): Promise<ApiResponse<T>> {
    return this.requestWithContentType<T>(
      endpoint,
      { method: 'GET' },
      false,
      tenantSubdomain
    );
  }

  async postWithTenant<T = any>(
    endpoint: string,
    data: any,
    tenantSubdomain: string
  ): Promise<ApiResponse<T>> {
    return this.requestWithContentType<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      false,
      tenantSubdomain
    );
  }

  async putWithTenant<T = any>(
    endpoint: string,
    data: any,
    tenantSubdomain: string
  ): Promise<ApiResponse<T>> {
    return this.requestWithContentType<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      false,
      tenantSubdomain
    );
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.post('/auth/logout');

    // Clear stored token regardless of response
    this.token = undefined;

    // Clear local storage and cookies
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      document.cookie =
        'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.get('/auth/profile');
  }

  // Tenant provisioning
  async provisionTenant(data: {
    name: string;
    subdomain: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    plan?: string;
  }): Promise<ApiResponse<any>> {
    return this.post('/tenant-provisioning/provision', data);
  }
}

// Create default instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };

// Utility function to handle API responses
export function handleApiResponse<T>(
  response: ApiResponse<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
): boolean {
  if (response.error) {
    if (onError) {
      onError(response.error);
    } else {
      console.error('API Error:', response.error);
    }
    return false;
  }

  if (response.data && onSuccess) {
    onSuccess(response.data);
  }

  return true;
}
