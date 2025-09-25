'use client';

import { Breadcrumb } from 'antd';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';

interface InventoryLayoutProps {
  children: React.ReactNode;
}

export default function InventoryLayout({ children }: InventoryLayoutProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  const getBreadcrumbItems = () => {
    const items = [
      {
        title: (
          <Link href={`/${locale}/dashboard`}>
            Dashboard
          </Link>
        ),
      },
      {
        title: (
          <Link href={`/${locale}/dashboard/inventory`}>
            Inventory
          </Link>
        ),
      },
    ];

    if (pathname.includes('/stock')) {
      items.push({
        title: <span>Stock Levels</span>,
      });
    } else if (pathname.includes('/warehouses')) {
      items.push({
        title: <span>Warehouses</span>,
      });
    } else {
      items.push({
        title: <span>Items</span>,
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