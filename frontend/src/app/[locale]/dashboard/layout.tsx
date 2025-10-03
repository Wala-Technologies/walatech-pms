'use client';

import { useState, use, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Badge, Spin, message } from 'antd';
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
import { useRouter } from 'next/navigation';
import { useTenant } from '../../../contexts/tenant-context';
import { useAuth } from '../../../hooks/useAuth';
import { apiClient } from '../../../lib/api-client';
import { apiConfig } from '../../../config/api';

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
  const { user, isSuperAdmin, loading, isInitialized } = useAuth();
  const router = useRouter();

  // Authentication guard - redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !loading && !user) {
      router.push(`/${locale}/auth/login`);
    }
  }, [isInitialized, loading, user, router, locale]);

  // Show loading spinner while checking authentication
  if (!isInitialized || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const handleUserMenuClick = async (info: { key: string }) => {
    if (info.key === 'logout') {
      try {
        await apiClient.logout();
      } catch (e) {
        // ignore errors; proceed to clean up client-side
      } finally {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('user');
            sessionStorage.clear();
          } catch {}
        }
        message.success('Logged out');
        const target = `/${locale}/auth/login`;
        try {
          router.replace(target);
        } catch {
          if (typeof window !== 'undefined') {
            window.location.href = target;
          }
        }
      }
    }
  };

  // Theme helpers from tenant settings
  const themeSettings = (tenant?.settings as any)?.theme || {};
  const branding = (tenant?.settings as any)?.branding || {};
  const siderTheme = themeSettings.sidebarStyle === 'dark' ? 'dark' : 'light';
  const headerIsDark = themeSettings.headerStyle === 'dark';
  const headerBg = headerIsDark ? (branding.primaryColor || '#1f1f1f') : '#ffffff';
  const headerText = headerIsDark ? '#ffffff' : '#1f2937';
  const logoPosition = themeSettings.logoPosition || 'left';
  const headerUseGradient = !!themeSettings.headerUseGradient;
  const headerGradFrom = themeSettings.headerGradientFrom || branding.primaryColor || '#1890ff';
  const headerGradTo = themeSettings.headerGradientTo || branding.secondaryColor || '#52c41a';
  const headerGradDir = themeSettings.headerGradientDirection || 'to-r';
  const sidebarBgCustom = themeSettings.sidebarBgColor as string | undefined;
  const sidebarTextCustom = themeSettings.sidebarTextColor as string | undefined;

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
    if (/^https?:\/\//i.test(logoUrl)) return logoUrl; // Already absolute
    // Prepend configured API base URL for any root-relative path
    if (logoUrl.startsWith('/')) {
      return `${apiConfig.baseURL}${logoUrl}`;
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
      children: isSuperAdmin ? [
        // Super Admin menu items
        {
          key: 'tenants',
          label: (
            <Link href={`/${locale}/dashboard/settings/tenants`}>
              Tenant Management
            </Link>
          ),
        },
        {
          key: 'system',
          label: (
            <Link href={`/${locale}/dashboard/settings/system`}>
              System Settings
            </Link>
          ),
        },
        {
          key: 'global-permissions',
          label: (
            <Link href={`/${locale}/dashboard/settings/permissions`}>
              Global Permissions
            </Link>
          ),
        },
      ] : [
        // Regular user menu items
        {
          key: 'organization',
          label: (
            <Link href={`/${locale}/dashboard/settings/organization`}>
              Organization Settings
            </Link>
          ),
        },
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
          key: 'permissions',
          label: (
            <Link href={`/${locale}/dashboard/settings/permissions`}>
              Permissions
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
      onClick: () => handleUserMenuClick({ key: 'logout' }),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        theme={siderTheme as 'light' | 'dark'}
        className={siderTheme === 'dark' ? 'shadow-lg bg-[#141414]' : 'bg-white shadow-lg'}
        style={{
          backgroundColor: sidebarBgCustom && sidebarBgCustom.trim() !== '' ? sidebarBgCustom : undefined,
          color: sidebarTextCustom && sidebarTextCustom.trim() !== '' ? sidebarTextCustom : undefined,
        }}
      >
        <div className={siderTheme === 'dark' ? 'p-4 border-b border-[#1f1f1f]' : 'p-4 border-b'}>
          <div className={`flex ${logoPosition === 'center' ? 'justify-center' : 'justify-start'} items-center space-x-2`}>
            {getLogoUrl() ? (
              <img
                src={getAbsoluteLogoUrl(getLogoUrl())}
                alt="Company Logo"
                className="w-8 h-8 object-contain rounded"
                onError={(e) => {
                  // Hide broken image and allow fallback initials to render
                  e.currentTarget.style.display = 'none';
                  // Optional: log for debugging
                  // console.warn('Failed to load logo:', getLogoUrl());
                }}
              />
            ) : (
              <div className={`w-8 h-8 ${headerIsDark ? 'bg-white' : 'bg-blue-600'} rounded flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">
                  {tenant?.settings?.companyName?.[0] ||
                    tenant?.name?.[0] ||
                    'W'}
                </span>
              </div>
            )}
            {!collapsed && (
              <div>
                <h1 className={`text-lg font-bold ${siderTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {tenant?.settings?.companyName || tenant?.name || 'WalaTech'}
                </h1>
                <p className={`${siderTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'} text-xs`}>Production MES</p>
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
        <Header
          style={
            headerUseGradient
              ? {
                  backgroundImage:
                    headerGradDir === 'to-b'
                      ? `linear-gradient(180deg, ${headerGradFrom}, ${headerGradTo})`
                      : headerGradDir === 'to-br'
                      ? `linear-gradient(135deg, ${headerGradFrom}, ${headerGradTo})`
                      : `linear-gradient(90deg, ${headerGradFrom}, ${headerGradTo})`,
                }
              : { backgroundColor: headerBg }
          }
          className="shadow-sm px-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={headerIsDark ? 'text-white' : 'text-gray-600'}
            />
            <div>
              <h2 className={`text-lg font-semibold ${headerIsDark ? 'text-white' : 'text-gray-900'}`}>
                Production Dashboard
              </h2>
              <p className={`text-sm ${headerIsDark ? 'text-gray-200' : 'text-gray-500'}`}>
                Welcome back, Administrator
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge count={5}>
              <Button
                type="text"
                icon={<BellOutlined />}
                className={headerIsDark ? 'text-white' : 'text-gray-600'}
              />
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
              arrow
            >
              <div className={`flex items-center space-x-2 cursor-pointer px-2 py-1 rounded ${headerIsDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}>
                <Avatar icon={<UserOutlined />} />
                <div className="text-right">
                  <p className={`text-sm font-medium ${headerIsDark ? 'text-white' : 'text-gray-900'}`}>
                    Admin User
                  </p>
                  <p className={`text-xs ${headerIsDark ? 'text-gray-200' : 'text-gray-500'}`}>System Administrator</p>
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
