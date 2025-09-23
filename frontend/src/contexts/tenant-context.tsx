'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api-client';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'basic' | 'premium' | 'enterprise';
  settings?: {
    companyName?: string;
    companyLogo?: string;
    timezone?: string;
    currency?: string;
    language?: string;
    branding?: {
      primaryColor?: string;
      secondaryColor?: string;
      logoUrl?: string;
    };
  };
}

export interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
  updateTenantSettings: (settings: Partial<Tenant['settings']>) => Promise<void>;
  switchTenant: (subdomain: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export interface TenantProviderProps {
  children: ReactNode;
  initialTenant?: Tenant | null;
}

export function TenantProvider({ children, initialTenant }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(initialTenant || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get tenant subdomain from cookie or URL
  const getTenantSubdomain = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Try to get from cookie first
    const cookies = document.cookie.split(';');
    const tenantCookie = cookies.find(cookie => 
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
  };

  // Fetch tenant data
  const fetchTenant = async (subdomain: string): Promise<Tenant | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || `http://localhost:3001/api`;
      const response = await fetch(`${apiUrl}/tenants/by-subdomain/${subdomain}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-subdomain': subdomain,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Tenant not found');
        }
        throw new Error('Failed to fetch tenant data');
      }
      
      const tenantData = await response.json();
      
      // Parse settings if they exist as a JSON string
      if (tenantData.settings && typeof tenantData.settings === 'string') {
        try {
          tenantData.settings = JSON.parse(tenantData.settings);
        } catch (err) {
          console.warn('Failed to parse tenant settings:', err);
          tenantData.settings = {};
        }
      }
      
      return tenantData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching tenant:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh tenant data
  const refreshTenant = async (): Promise<void> => {
    const subdomain = getTenantSubdomain();
    if (subdomain) {
      const tenantData = await fetchTenant(subdomain);
      setTenant(tenantData);
    }
  };

  // Update tenant settings
  const updateTenantSettings = async (settings: Partial<Tenant['settings']>): Promise<void> => {
    if (!tenant) {
      throw new Error('No tenant context available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Set tenant context for the API client
      apiClient.setTenantContext(tenant.subdomain);
      
      // Use the API client which handles authentication automatically
      const response = await apiClient.updateTenantSettings(settings);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update local state with the response data
      setTenant(prev => prev ? {
        ...prev,
        settings: { ...prev.settings, ...response.data }
      } : null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error updating tenant settings:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to different tenant
  const switchTenant = (subdomain: string): void => {
    // Update cookie
    document.cookie = `tenant-subdomain=${subdomain}; path=/; max-age=${60 * 60 * 24 * 30}`;
    
    // Redirect to new subdomain
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    
    if (window.location.hostname === 'localhost') {
      // For development
      window.location.href = `${protocol}//${subdomain}.localhost${port}`;
    } else {
      // For production
      const domain = window.location.hostname.split('.').slice(-2).join('.');
      window.location.href = `${protocol}//${subdomain}.${domain}${port}`;
    }
  };

  // Initialize tenant on mount
  useEffect(() => {
    if (!tenant) {
      const subdomain = getTenantSubdomain();
      if (subdomain) {
        fetchTenant(subdomain).then(setTenant);
      }
    }
  }, []);

  // Apply tenant branding and theme
  useEffect(() => {
    if (tenant?.settings) {
      // Apply branding colors (legacy support)
      if (tenant.settings.branding) {
        const { primaryColor, secondaryColor } = tenant.settings.branding;
        
        if (primaryColor) {
          document.documentElement.style.setProperty('--tenant-primary-color', primaryColor);
        }
        
        if (secondaryColor) {
          document.documentElement.style.setProperty('--tenant-secondary-color', secondaryColor);
        }
      }
      
      // Apply theme settings (new structure)
      if (tenant.settings.theme) {
        const { primaryColor, secondaryColor, sidebarStyle, headerStyle } = tenant.settings.theme;
        
        if (primaryColor) {
          document.documentElement.style.setProperty('--tenant-primary-color', primaryColor);
          document.documentElement.style.setProperty('--ant-primary-color', primaryColor);
        }
        
        if (secondaryColor) {
          document.documentElement.style.setProperty('--tenant-secondary-color', secondaryColor);
        }
        
        // Apply sidebar and header styles
        if (sidebarStyle) {
          document.documentElement.style.setProperty('--tenant-sidebar-style', sidebarStyle);
        }
        
        if (headerStyle) {
          document.documentElement.style.setProperty('--tenant-header-style', headerStyle);
        }
      }
    }
  }, [tenant?.settings?.branding, tenant?.settings?.theme]);

  const contextValue: TenantContextType = {
    tenant,
    isLoading,
    error,
    refreshTenant,
    updateTenantSettings,
    switchTenant,
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
}

// Custom hook to use tenant context
export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

// Hook to get tenant subdomain
export function useTenantSubdomain(): string | null {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      
      if (hostname.endsWith('.localhost') && parts.length >= 2) {
        setSubdomain(parts[0]);
      } else if (parts.length >= 3 && !hostname.startsWith('www.')) {
        setSubdomain(parts[0]);
      }
    }
  }, []);
  
  return subdomain;
}

// Hook to check if user is in tenant context
export function useIsTenantContext(): boolean {
  const subdomain = useTenantSubdomain();
  return subdomain !== null && subdomain !== 'www' && subdomain !== 'app';
}