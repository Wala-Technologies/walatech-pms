'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, handleApiResponse } from '../../../lib/api-client';
import { Tenant } from '../../../contexts/tenant-context';

interface UserTenant {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  plan: string;
  role: string;
}

export default function SelectTenantPage() {
  const [tenants, setTenants] = useState<UserTenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('tenant');

  useEffect(() => {
    fetchUserTenants();
  }, []);

  const fetchUserTenants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get<UserTenant[]>('/api/users/tenants');
      
      handleApiResponse(
        response,
        (data) => setTenants(data),
        (error) => setError(error)
      );
    } catch (err) {
      setError('Failed to load tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const selectTenant = (subdomain: string) => {
    // Set tenant cookie
    document.cookie = `tenant-subdomain=${subdomain}; path=/; max-age=${60 * 60 * 24 * 30}`;
    
    // Redirect to tenant subdomain
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    
    if (window.location.hostname === 'localhost') {
      // For development
      window.location.href = `${protocol}//${subdomain}.localhost${port}/dashboard`;
    } else {
      // For production
      const domain = window.location.hostname.split('.').slice(-2).join('.');
      window.location.href = `${protocol}//${subdomain}.${domain}${port}/dashboard`;
    }
  };

  const createNewTenant = () => {
    router.push('/create-tenant');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('selectTenant')}
          </h1>
          <p className="text-gray-600 mb-8">
            {t('selectTenantDescription')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {tenants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">{t('noTenants')}</p>
              <button
                onClick={createNewTenant}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('createTenant')}
              </button>
            </div>
          ) : (
            <>
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => selectTenant(tenant.subdomain)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {tenant.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {tenant.subdomain}.{window.location.hostname.includes('localhost') ? 'localhost' : window.location.hostname.split('.').slice(-2).join('.')}
                      </p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tenant.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tenant.status}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tenant.plan}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {tenant.role}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 text-center">
                <button
                  onClick={createNewTenant}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {t('createNewTenant')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}