'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  tenant_id: string;
  isSuperAdmin: boolean;
  role_profile_name: string;
  enabled: boolean;
  last_login?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export function useAuth() {
  // Initialize with loading: false to prevent hydration mismatch
  // We'll set loading to true only after the component mounts
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
    isInitialized: false,
  });

  const fetchCurrentUser = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiClient.getCurrentUser();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setAuthState({
        user: response.data?.user || null,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user',
        isInitialized: true,
      });
    }
  };

  useEffect(() => {
    // Only fetch user data on client-side after component mounts
    if (typeof window !== 'undefined') {
      fetchCurrentUser();
    }
  }, []);

  const refetch = () => {
    fetchCurrentUser();
  };

  return {
    ...authState,
    refetch,
    isSuperAdmin: authState.user?.isSuperAdmin || false,
    // Show loading state only after initialization starts
    loading: authState.isInitialized ? authState.loading : false,
  };
}