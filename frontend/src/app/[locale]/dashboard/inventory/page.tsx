'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function InventoryPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    // Redirect to items page by default
    router.replace(`/${locale}/dashboard/inventory/items`);
  }, [router, locale]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px',
      fontSize: '16px',
      color: '#666'
    }}>
      Redirecting to inventory items...
    </div>
  );
}