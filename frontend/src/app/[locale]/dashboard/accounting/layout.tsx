'use client';

import { useState, use } from 'react';
import { Layout, Menu } from 'antd';
import {
  AccountBookOutlined,
  FileTextOutlined,
  BarChartOutlined,
  DollarOutlined,
  AuditOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const { Sider, Content } = Layout;

interface AccountingLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default function AccountingLayout({
  children,
  params,
}: AccountingLayoutProps) {
  const { locale } = use(params);
  const [collapsed, setCollapsed] = useState(false);
  const t = useTranslations('accounting');

  const menuItems = [
    {
      key: 'overview',
      icon: <AccountBookOutlined />,
      label: <Link href={`/${locale}/dashboard/accounting`}>Overview</Link>,
    },
    {
      key: 'chart-of-accounts',
      icon: <BankOutlined />,
      label: (
        <Link href={`/${locale}/dashboard/accounting/chart-of-accounts`}>
          Chart of Accounts
        </Link>
      ),
    },
    {
      key: 'journal-entries',
      icon: <FileTextOutlined />,
      label: (
        <Link href={`/${locale}/dashboard/accounting/journal-entries`}>
          Journal Entries
        </Link>
      ),
    },
    {
      key: 'general-ledger',
      icon: <AuditOutlined />,
      label: (
        <Link href={`/${locale}/dashboard/accounting/general-ledger`}>
          General Ledger
        </Link>
      ),
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
      children: [
        {
          key: 'trial-balance',
          label: (
            <Link href={`/${locale}/dashboard/accounting/reports/trial-balance`}>
              Trial Balance
            </Link>
          ),
        },
        {
          key: 'balance-sheet',
          label: (
            <Link href={`/${locale}/dashboard/accounting/reports/balance-sheet`}>
              Balance Sheet
            </Link>
          ),
        },
        {
          key: 'income-statement',
          label: (
            <Link href={`/${locale}/dashboard/accounting/reports/income-statement`}>
              Income Statement
            </Link>
          ),
        },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          {!collapsed && 'Accounting'}
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['overview']}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: '8px',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}