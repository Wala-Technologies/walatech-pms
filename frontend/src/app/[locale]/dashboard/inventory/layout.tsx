'use client';

import React from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const { Sider, Content } = Layout;

interface InventoryLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default function InventoryLayout({ children, params }: InventoryLayoutProps) {
  const t = useTranslations('inventory');
  const pathname = usePathname();
  const router = useRouter();
  const [locale, setLocale] = React.useState<string>('');

  React.useEffect(() => {
    params.then(({ locale }) => {
      setLocale(locale);
    });
  }, [params]);

  const getSelectedKey = () => {
    if (pathname.includes('/stock')) return 'stock';
    if (pathname.includes('/warehouses')) return 'warehouses';
    if (pathname.includes('/items') || pathname.endsWith('/inventory')) return 'items';
    return 'items';
  };

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

  const menuItems = [
    {
      key: 'items',
      icon: <AppstoreOutlined />,
      label: (
        <Link href={`/${locale}/dashboard/inventory/items`}>
          Items
        </Link>
      ),
    },
    {
      key: 'stock',
      icon: <BarChartOutlined />,
      label: (
        <Link href={`/${locale}/dashboard/inventory/stock`}>
          Stock Levels
        </Link>
      ),
    },
    {
      key: 'warehouses',
      icon: <HomeOutlined />,
      label: (
        <Link href={`/${locale}/dashboard/inventory/warehouses`}>
          Warehouses
        </Link>
      ),
    },
  ];

  if (!locale) {
    return <div>Loading...</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sider
        width={250}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 64, // Account for main header height
          zIndex: 100,
        }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: 0, color: '#1890ff' }}>
            Inventory Management
          </h3>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ border: 'none', height: 'calc(100vh - 120px)', overflow: 'auto' }}
        />
      </Sider>
      
      <Layout style={{ marginLeft: 250 }}>
        <Content style={{ padding: '0 24px', minHeight: 'calc(100vh - 64px)' }}>
          <div style={{ padding: '16px 0' }}>
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>
          <div style={{ background: '#fff', minHeight: 'calc(100vh - 140px)' }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}