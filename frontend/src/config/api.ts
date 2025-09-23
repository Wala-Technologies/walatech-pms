// API Configuration for microservices architecture

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000');

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      refresh: '/api/auth/refresh',
      logout: '/api/auth/logout',
    },
    production: {
      orders: '/api/production-orders',
      statistics: '/api/production-orders/statistics',
      workOrders: '/api/work-orders',
      workOrderStats: '/api/work-orders/statistics',
      tasks: '/api/work-order-tasks',
      taskStats: '/api/work-order-tasks/statistics',
      analytics: {
        metrics: '/api/production/analytics/metrics',
        trends: '/api/production/analytics/trends',
        topPerformers: '/api/production/analytics/top-performers',
        productPerformance: '/api/production/analytics/product-performance',
      },
    },
    inventory: {
      items: '/api/inventory/items',
      categories: '/api/inventory/categories',
      transactions: '/api/inventory/transactions',
      statistics: '/api/inventory/statistics',
    },
    users: {
      list: '/api/users',
      roles: '/api/users/roles',
      permissions: '/api/users/permissions',
    },
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  const url = new URL(endpoint, apiConfig.baseURL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });
  }
  
  return url.toString();
};

// Helper function for authenticated requests
export const getAuthHeaders = (): Record<string, string> => {
  // Use a more hydration-safe approach
  let token: string | null = null;
  try {
    // Only access localStorage in client-side environment
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token');
    }
  } catch (error) {
    // Handle cases where localStorage is not available
    console.warn('localStorage not available:', error);
  }
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// API client wrapper
export const apiClient = {
  get: async (endpoint: string, params?: Record<string, string>) => {
    const url = buildApiUrl(endpoint, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response;
  },
  
  post: async (endpoint: string, data?: unknown) => {
    const url = buildApiUrl(endpoint);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return response;
  },
  
  put: async (endpoint: string, data?: unknown) => {
    const url = buildApiUrl(endpoint);
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return response;
  },
  
  patch: async (endpoint: string, data?: unknown) => {
    const url = buildApiUrl(endpoint);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return response;
  },
  
  delete: async (endpoint: string) => {
    const url = buildApiUrl(endpoint);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response;
  },
};