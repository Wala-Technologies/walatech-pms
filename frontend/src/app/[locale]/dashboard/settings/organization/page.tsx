'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';

export default function OrganizationSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to tenant settings page
    router.replace('/dashboard/settings/tenants');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <Spin size="large" />
      <p>Redirecting to Organization Management...</p>
    </div>
  );
}
