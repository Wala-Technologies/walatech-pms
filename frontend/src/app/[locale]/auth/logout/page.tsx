'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { apiClient } from '../../../../lib/api-client';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        await apiClient.logout();
      } catch {
        // ignore
      } finally {
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            sessionStorage.clear();
          }
        } catch {}
        // fallback to en if cannot detect locale from path
        const path = typeof window !== 'undefined' ? window.location.pathname : '/en';
        const parts = path.split('/').filter(Boolean);
        const locale = parts[0] || 'en';
        router.replace(`/${locale}/auth/login`);
      }
    };
    run();
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <Spin size="large" />
    </div>
  );
}
