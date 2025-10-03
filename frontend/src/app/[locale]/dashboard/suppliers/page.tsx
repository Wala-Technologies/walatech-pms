'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function SuppliersPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    // Redirect to dashboard by default
    router.replace(`/${locale}/dashboard/suppliers/dashboard`);
  }, [router, locale]);

  return null;
}