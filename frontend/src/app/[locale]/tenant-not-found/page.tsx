'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function TenantNotFoundPage() {
  const [subdomain, setSubdomain] = useState<string>('');
  const router = useRouter();
  const t = useTranslations('tenant');

  useEffect(() => {
    // Extract subdomain from current URL
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

  const goToMainSite = () => {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    
    if (window.location.hostname.includes('localhost')) {
      // For development
      window.location.href = `${protocol}//localhost${port}`;
    } else {
      // For production
      const domain = window.location.hostname.split('.').slice(-2).join('.');
      window.location.href = `${protocol}//${domain}${port}`;
    }
  };

  const requestAccess = () => {
    // Redirect to contact or request access page
    router.push('/contact?reason=tenant-access&subdomain=' + subdomain);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            {t('tenantNotFound')}
          </h1>
          
          {subdomain && (
            <p className="mt-2 text-lg text-gray-600">
              {t('tenantNotFoundSubdomain', { subdomain })}
            </p>
          )}
          
          <p className="mt-4 text-sm text-gray-500">
            {t('tenantNotFoundDescription')}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 text-center">
                {t('whatCanYouDo')}
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">1</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('checkSubdomainSpelling')}
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">2</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('contactTenantAdmin')}
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">3</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('createNewTenantOption')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-3">
              <button
                onClick={goToMainSite}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('goToMainSite')}
              </button>
              
              <button
                onClick={requestAccess}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('requestAccess')}
              </button>
              
              <div className="text-center">
                <Link
                  href="/create-tenant"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  {t('createNewTenant')}
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            {t('needHelp')}{' '}
            <Link href="/support" className="text-blue-600 hover:text-blue-500">
              {t('contactSupport')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}