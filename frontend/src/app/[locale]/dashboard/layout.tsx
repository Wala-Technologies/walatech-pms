'use client';

import { useState, use } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Badge } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  FileTextOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useTenant } from '../../../contexts/tenant-context';

const { Header, Sider, Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { locale } = use(params);
  const [collapsed, setCollapsed] = useState(false);
  const t = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const { tenant } = useTenant();

  // Get logo URL from multiple possible locations
  const getLogoUrl = () => {
    if (!tenant?.settings) return undefined;

    // Check multiple possible locations for the logo
    const logoSources = [
      tenant.settings.companyLogo,
      tenant.settings.branding?.logoUrl,
    ];

    return logoSources.find((url) => url && url.trim() !== '');
  };

  // Helper function to convert relative logo URLs to absolute URLs
  const getAbsoluteLogoUrl = (logoUrl: string | undefined) => {
    if (!logoUrl) return undefined;
    if (logoUrl.startsWith('http')) {
      return logoUrl; // Already absolute
    }
    // For relative URLs starting with /api, prepend the backend server URL
    if (logoUrl.startsWith('/api')) {
      return `http://localhost:3001${logoUrl}`;
    }
    return logoUrl;
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link href={`/${locale}/dashboard`}>Dashboard</Link>,
    },
    {
      key: 'production',
      icon: <LineChartOutlined />,
      label: 'Production',
      children: [
        {
          key: 'work-orders',
          label: (
            <Link href={`/${locale}/dashboard/production/work-orders`}>
              Work Orders
            </Link>
          ),
        },
        {
          key: 'bom',
          label: (
            <Link href={`/${locale}/dashboard/production/bom`}>
              Bill of Materials
            </Link>
          ),
        },
        {
          key: 'routing',
          label: (
            <Link href={`/${locale}/dashboard/production/routing`}>
              Routing
            </Link>
          ),
        },
      ],
    },
    {
      key: 'inventory',
      icon: <ShoppingCartOutlined />,
      label: 'Inventory',
      children: [
        {
          key: 'items',
          label: (
            <Link href={`/${locale}/dashboard/inventory/items`}>Items</Link>
          ),
        },
        {
          key: 'stock',
          label: (
            <Link href={`/${locale}/dashboard/inventory/stock`}>
              Stock Levels
            </Link>
          ),
        },
        {
          key: 'warehouses',
          label: (
            <Link href={`/${locale}/dashboard/inventory/warehouses`}>
              Warehouses
            </Link>
          ),
        },
      ],
    },
    {
      key: 'quality',
      icon: <SafetyOutlined />,
      label: 'Quality Control',
      children: [
        {
          key: 'inspections',
          label: (
            <Link href={`/${locale}/dashboard/quality/inspections`}>
              Inspections
            </Link>
          ),
        },
        {
          key: 'procedures',
          label: (
            <Link href={`/${locale}/dashboard/quality/procedures`}>
              Procedures
            </Link>
          ),
        },
      ],
    },
    {
      key: 'maintenance',
      icon: <ToolOutlined />,
      label: 'Maintenance',
      children: [
        {
          key: 'schedules',
          label: (
            <Link href={`/${locale}/dashboard/maintenance/schedules`}>
              Schedules
            </Link>
          ),
        },
        {
          key: 'assets',
          label: (
            <Link href={`/${locale}/dashboard/maintenance/assets`}>Assets</Link>
          ),
        },
      ],
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
      children: [
        {
          key: 'production-reports',
          label: (
            <Link href={`/${locale}/dashboard/reports/production`}>
              Production
            </Link>
          ),
        },
        {
          key: 'inventory-reports',
          label: (
            <Link href={`/${locale}/dashboard/reports/inventory`}>
              Inventory
            </Link>
          ),
        },
        {
          key: 'quality-reports',
          label: (
            <Link href={`/${locale}/dashboard/reports/quality`}>Quality</Link>
          ),
        },
      ],
    },
    {
      key: 'hr',
      icon: <TeamOutlined />,
      label: 'Human Resources',
      children: [
        {
          key: 'employees',
          label: (
            <Link href={`/${locale}/dashboard/hr/employees`}>Employees</Link>
          ),
        },
        {
          key: 'attendance',
          label: (
            <Link href={`/${locale}/dashboard/hr/attendance`}>Attendance</Link>
          ),
        },
        {
          key: 'payroll',
          label: <Link href={`/${locale}/dashboard/hr/payroll`}>Payroll</Link>,
        },
      ],
    },
    {
      key: 'documents',
      icon: <FileTextOutlined />,
      label: 'Documents',
      children: [
        {
          key: 'document-procedures',
          label: (
            <Link href={`/${locale}/dashboard/documents/procedures`}>
              Procedures
            </Link>
          ),
        },
        {
          key: 'specifications',
          label: (
            <Link href={`/${locale}/dashboard/documents/specifications`}>
              Specifications
            </Link>
          ),
        },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      children: [
        {
          key: 'users',
          label: (
            <Link href={`/${locale}/dashboard/settings/users`}>
              User Management
            </Link>
          ),
        },
        {
          key: 'roles',
          label: (
            <Link href={`/${locale}/dashboard/settings/roles`}>
              Role Management
            </Link>
          ),
        },
        {
          key: 'system',
          label: (
            <Link href={`/${locale}/dashboard/settings/system`}>System</Link>
          ),
        },
        {
          key: 'permissions',
          label: (
            <Link href={`/${locale}/dashboard/settings/permissions`}>
              Permissions
            </Link>
          ),
        },
        {
          key: 'tenants',
          label: (
            <Link href={`/${locale}/dashboard/settings/tenants`}>
              Organization Management
            </Link>
          ),
        },
        {
          key: 'organization',
          label: (
            <Link href={`/${locale}/dashboard/settings/organization`}>
              Organization Settings
            </Link>
          ),
        },
      ],
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        className="bg-white shadow-lg"
      >
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            {getLogoUrl() ? (
              <img
                src={getAbsoluteLogoUrl(getLogoUrl())}
                alt="Company Logo"
                className="w-8 h-8 object-contain rounded"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {tenant?.settings?.companyName?.[0] ||
                    tenant?.name?.[0] ||
                    'W'}
                </span>
              </div>
            )}
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {tenant?.settings?.companyName || tenant?.name || 'WalaTech'}
                </h1>
                <p className="text-xs text-gray-500">Production MES</p>
              </div>
            )}
          </div>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          defaultOpenKeys={['production']}
          items={menuItems}
          className="border-none"
        />
      </Sider>

      <Layout>
        <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-600"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Production Dashboard
              </h2>
              <p className="text-sm text-gray-500">
                Welcome back, Administrator
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge count={5}>
              <Button
                type="text"
                icon={<BellOutlined />}
                className="text-gray-600"
              />
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                <Avatar icon={<UserOutlined />} />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500">System Administrator</p>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="bg-gray-50">{children}</Content>
      </Layout>
    </Layout>
  );
}
