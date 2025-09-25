'use client';

import { Breadcrumb } from 'antd';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface ProductionLayoutProps {
  children: React.ReactNode;
}

export default function ProductionLayout({ children }: ProductionLayoutProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('production');

  const getBreadcrumbItems = () => {
    const items = [
      {
        title: (
          <Link href={`/${locale}/dashboard`}>
            {t('dashboard')}
          </Link>
        ),
      },
      {
        title: (
          <Link href={`/${locale}/dashboard/production`}>
            {t('production')}
          </Link>
        ),
      },
    ];

    if (pathname.includes('/work-orders')) {
      items.push({
        title: <span>{t('workOrders')}</span>,
      });
    } else if (pathname.includes('/tasks')) {
      items.push({
        title: <span>{t('tasks')}</span>,
      });
    } else if (pathname.includes('/bom')) {
      items.push({
        title: <span>Bill of Materials</span>,
      });
    } else if (pathname.includes('/routing')) {
      items.push({
        title: <span>Routing</span>,
      });
    } else {
      items.push({
        title: <span>{t('productionOrders')}</span>,
      });
    }

    return items;
  };

  if (!locale) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ padding: '0 0 16px 0' }}>
        <Breadcrumb items={getBreadcrumbItems()} />
      </div>
      <div style={{ background: '#fff', minHeight: 'calc(100vh - 140px)', borderRadius: '8px' }}>
        {children}
      </div>
    </div>
  );
}