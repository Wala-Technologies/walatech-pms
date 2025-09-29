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
  AccountBookOutlined,
  ContactsOutlined,
  ShoppingOutlined,
  TruckOutlined,
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
      key: 'customers',
      icon: <ContactsOutlined />,
      label: 'Customers',
      children: [
        {
          key: 'customers-list',
          label: (
            <Link href={`/${locale}/dashboard/customers`}>
              Customers
            </Link>
          ),
        },
        {
          key: 'customer-groups',
          label: (
            <Link href={`/${locale}/dashboard/customers/groups`}>
              Groups
            </Link>
          ),
        },
        {
          key: 'customer-territories',
          label: (
            <Link href={`/${locale}/dashboard/customers/territories`}>
              Territories
            </Link>
          ),
        },
        {
          key: 'customer-segments',
          label: (
            <Link href={`/${locale}/dashboard/customers/segments`}>
              Market Segments
            </Link>
          ),
        },
        {
          key: 'customer-hierarchy',
          label: (
            <Link href={`/${locale}/dashboard/customers/hierarchy`}>
              Hierarchy
            </Link>
          ),
        },
        {
          key: 'customer-reports',
          label: (
            <Link href={`/${locale}/dashboard/customers/reports`}>
              Reports
            </Link>
          ),
        },
      ],
    },
    {
      key: 'suppliers',
      icon: <TruckOutlined />,
      label: 'Suppliers',
      children: [
        {
          key: 'suppliers-dashboard',
          label: (
            <Link href={`/${locale}/dashboard/suppliers/dashboard`}>
              Dashboard
            </Link>
          ),
        },
        {
          key: 'suppliers-list',
          label: (
            <Link href={`/${locale}/dashboard/suppliers/list`}>
              Suppliers
            </Link>
          ),
        },
        {
          key: 'supplier-groups',
          label: (
            <Link href={`/${locale}/dashboard/suppliers/groups`}>
              Groups
            </Link>
          ),
        },
        {
          key: 'supplier-quotations',
          label: (
            <Link href={`/${locale}/dashboard/suppliers/quotations`}>
              Quotations
            </Link>
          ),
        },
        {
          key: 'supplier-reports',
          label: (
            <Link href={`/${locale}/dashboard/suppliers/reports`}>
              Reports
            </Link>
          ),
        },
      ],
    },
    {
      key: 'sales-orders',
      icon: <ShoppingOutlined />,
      label: 'Sales Orders',
      children: [
        {
          key: 'sales-orders-list',
          label: (
            <Link href={`/${locale}/dashboard/sales-orders`}>
              Sales Orders
            </Link>
          ),
        },
        {
          key: 'sales-orders-reports',
          label: (
            <Link href={`/${locale}/dashboard/sales-orders/reports`}>
              Reports
            </Link>
          ),
        },
      ],
    },
    {
      key: 'production',
      icon: <LineChartOutlined />,
      label: 'Production',
      children: [
        {
          key: 'production-overview',
          label: (
            <Link href={`/${locale}/dashboard/production`}>
              Production Overview
            </Link>
          ),
        },
        {
          key: 'work-orders',
          label: (
            <Link href={`/${locale}/dashboard/production/work-orders`}>
              Work Orders
            </Link>
          ),
        },
        {
          key: 'tasks',
          label: (
            <Link href={`/${locale}/dashboard/production/tasks`}>
              Tasks
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
          key: 'inventory-overview',
          label: (
            <Link href={`/${locale}/dashboard/inventory`}>
              Inventory Overview
            </Link>
          ),
        },
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
          key: 'hr-overview',
          label: (
            <Link href={`/${locale}/dashboard/hr`}>HR Overview</Link>
          ),
        },
        {
          key: 'employees',
          label: (
            <Link href={`/${locale}/dashboard/hr/employees`}>Employees</Link>
          ),
        },
        {
          key: 'departments',
          label: (
            <Link href={`/${locale}/dashboard/hr/departments`}>Departments</Link>
          ),
        },
        {
          key: 'designations',
          label: (
            <Link href={`/${locale}/dashboard/hr/designations`}>Designations</Link>
          ),
        },
        {
          key: 'leave-management',
          label: (
            <Link href={`/${locale}/dashboard/hr/leave`}>Leave Management</Link>
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
      key: 'accounting',
      icon: <AccountBookOutlined />,
      label: 'Accounting',
      children: [
        {
          key: 'accounting-overview',
          label: (
            <Link href={`/${locale}/dashboard/accounting`}>Overview</Link>
          ),
        },
        {
          key: 'chart-of-accounts',
          label: (
            <Link href={`/${locale}/dashboard/accounting/chart-of-accounts`}>
              Chart of Accounts
            </Link>
          ),
        },
        {
          key: 'journal-entries',
          label: (
            <Link href={`/${locale}/dashboard/accounting/journal-entries`}>
              Journal Entries
            </Link>
          ),
        },
        {
          key: 'general-ledger',
          label: (
            <Link href={`/${locale}/dashboard/accounting/general-ledger`}>
              General Ledger
            </Link>
          ),
        },
        {
          key: 'accounting-reports',
          label: (
            <Link href={`/${locale}/dashboard/accounting/reports`}>
              Reports
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
