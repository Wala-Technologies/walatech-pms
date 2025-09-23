'use client';

import React from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import {
  UnorderedListOutlined,
  ToolOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const { Sider, Content } = Layout;

interface ProductionLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default function ProductionLayout({ children, params }: ProductionLayoutProps) {
  const t = useTranslations('production');
  const pathname = usePathname();
  const router = useRouter();
  const [locale, setLocale] = React.useState<string>('');

  React.useEffect(() => {
    params.then(({ locale }) => {
      setLocale(locale);
    });
  }, [params]);

  const getSelectedKey = () => {
    if (pathname.includes('/tasks')) return 'tasks';
    if (pathname.includes('/work-orders')) return 'work-orders';
    if (pathname.endsWith('/production')) return 'production-orders';
    return 'production-orders';
  };

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
    } else {
      items.push({
        title: <span>{t('productionOrders')}</span>,
      });
    }

    return items;
  };

  const menuItems = [
    {
      key: 'production-orders',
      icon: <UnorderedListOutlined />,
      label: (
        <Link href={`/${locale}/dashboard/production`}>
          {t('productionOrders')}
        </Link>
      ),
    },
    {
      key: 'work-orders',
      icon: <ToolOutlined />,
      label: (
        <Link href={`/${locale}/dashboard/production/work-orders`}>
          {t('workOrders')}
        </Link>
      ),
    },
    {
      key: 'tasks',
      icon: <CheckSquareOutlined />,
      label: (
        <Link href={`/${locale}/dashboard/production/tasks`}>
          {t('tasks')}
        </Link>
      ),
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: (
        <Link href={`/${locale}/dashboard/production/analytics`}>
          {t('analytics')}
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
            {t('productionManagement')}
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