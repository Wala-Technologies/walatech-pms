'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout, Menu, Card, Breadcrumb, Button, Alert, Spin } from 'antd';
import { 
  SettingOutlined, 
  TeamOutlined, 
  UserOutlined, 
  CreditCardOutlined, 
  SecurityScanOutlined, 
  ApiOutlined,
  DatabaseOutlined,
  HomeOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { apiClient } from '../../../../../lib/api-client';
import { useTenant } from '../../../../../contexts/tenant-context';

// Import tab components
import GeneralSettings from './components/GeneralSettings';
import DepartmentManagement from './components/DepartmentManagement';
import UserRoleManagement from './components/UserRoleManagement';
import BillingManagement from './components/BillingManagement';
import SecuritySettings from './components/SecuritySettings';
import IntegrationsManagement from './components/IntegrationsManagement';
import SystemSettings from './components/SystemSettings';

const { Sider, Content } = Layout;

type TabKey = 'general' | 'departments' | 'users-roles' | 'billing' | 'security' | 'integrations' | 'system';

interface ManagedTenantRef {
  id?: string;
  name?: string;
  subdomain?: string;
}

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<Record<string, unknown>>;
  description: string;
}

export default function OrganizationManagement() {
  const t = useTranslations('organization');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant: currentTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [collapsed, setCollapsed] = useState(false);
  const [managedTenant, setManagedTenant] = useState<ManagedTenantRef | null>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState(false);
  const [tenantError, setTenantError] = useState<string | null>(null);

  // Check if we're managing a different tenant
  const targetTenantSubdomain = searchParams.get('tenant');
  const isManagingDifferentTenant = targetTenantSubdomain && targetTenantSubdomain !== currentTenant?.subdomain;

  // Tab configuration
  const tabs: TabConfig[] = useMemo(() => [
    {
      key: 'general',
      label: t('tabs.general'),
      icon: <SettingOutlined />,
      component: GeneralSettings,
      description: t('tabs.generalDesc')
    },
    {
      key: 'departments',
      label: t('tabs.departments'),
      icon: <BankOutlined />,
      component: DepartmentManagement,
      description: t('tabs.departmentsDesc')
    },
    {
      key: 'users-roles',
      label: t('tabs.usersRoles'),
      icon: <UserOutlined />,
      component: UserRoleManagement,
      description: t('tabs.usersRolesDesc')
    },
    {
      key: 'billing',
      label: t('tabs.billing'),
      icon: <CreditCardOutlined />,
      component: BillingManagement,
      description: t('tabs.billingDesc')
    },
    {
      key: 'security',
      label: t('tabs.security'),
      icon: <SecurityScanOutlined />,
      component: SecuritySettings,
      description: t('tabs.securityDesc')
    },
    {
      key: 'integrations',
      label: t('tabs.integrations'),
      icon: <ApiOutlined />,
      component: IntegrationsManagement,
      description: t('tabs.integrationsDesc')
    },
    {
      key: 'system',
      label: t('tabs.system'),
      icon: <DatabaseOutlined />,
      component: SystemSettings,
      description: t('tabs.systemDesc')
    }
  ], [t]);

  // Handle URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab') as TabKey;
    if (tab && tabs.find(t => t.key === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams, tabs]);

  // Fetch target tenant information if managing a different tenant
  useEffect(() => {
    if (isManagingDifferentTenant && targetTenantSubdomain) {
      setIsLoadingTenant(true);
      setTenantError(null);
      
      // Fetch tenant information directly by subdomain
      apiClient.get(`/api/tenants/by-subdomain/${targetTenantSubdomain}`)
        .then(response => {
          const tenant = response.data;
          if (tenant && tenant.status === 'active') {
            setManagedTenant(tenant);
          } else {
            setTenantError('Tenant is not valid or active');
          }
        })
        .catch(error => {
          console.error('Error fetching tenant:', error);
          setTenantError('Failed to load tenant information');
        })
        .finally(() => {
          setIsLoadingTenant(false);
        });
    } else {
      setManagedTenant(null);
      setTenantError(null);
    }
  }, [isManagingDifferentTenant, targetTenantSubdomain]);

  // Handle tab change
  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', key);
    router.push(url.pathname + url.search, { scroll: false });
  };

  // Get current tab configuration
  const currentTab = tabs.find(tab => tab.key === activeTab) || tabs[0];
  const CurrentComponent = currentTab.component;

  const componentProps: { managedTenant?: ManagedTenantRef | null } = {};
  if (['general', 'departments', 'users-roles'].includes(activeTab)) {
    componentProps.managedTenant = isManagingDifferentTenant ? managedTenant : null;
  }

  // Show loading state while fetching tenant
  if (isLoadingTenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
        <span className="ml-3">Loading tenant information...</span>
      </div>
    );
  }

  // Show error state if tenant fetch failed
  if (tenantError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Alert
          message="Error Loading Tenant"
          description={tenantError}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => router.back()}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b px-6 py-4">
        <Breadcrumb
          items={[
            {
              title: (
                <span className="flex items-center gap-2">
                  <HomeOutlined />
                  {t('breadcrumb.dashboard')}
                </span>
              ),
            },
            {
              title: t('breadcrumb.settings'),
            },
            {
              title: t('breadcrumb.organization'),
            },
            {
              title: currentTab.label,
            },
          ]}
        />
      </div>

      {/* Tenant Management Banner */}
      {isManagingDifferentTenant && managedTenant && (
        <div className="bg-blue-50 border-b px-6 py-3">
          <Alert
            message={
              <span>
                <BankOutlined className="mr-2" />
                Managing Organization: <strong>{managedTenant.name}</strong> ({managedTenant.subdomain})
              </span>
            }
            description="You are currently managing settings for a different organization as a super administrator."
            type="info"
            showIcon={false}
            action={
              <Button size="small" onClick={() => router.push('/dashboard/settings/organization')}>
                Return to My Organization
              </Button>
            }
          />
        </div>
      )}

      <Layout className="min-h-screen">
        {/* Sidebar Navigation */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={280}
          className="bg-white border-r"
          breakpoint="lg"
          collapsedWidth={80}
        >
          <div className="p-4 border-b">
            <h2 className={`font-semibold text-gray-800 transition-all duration-200 ${
              collapsed ? 'text-center text-sm' : 'text-lg'
            }`}>
              {collapsed ? t('title.short') : t('title.full')}
            </h2>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            className="border-none"
            items={tabs.map(tab => ({
              key: tab.key,
              icon: tab.icon,
              label: tab.label,
              onClick: () => handleTabChange(tab.key),
              className: 'mb-1 mx-2 rounded-lg'
            }))}
          />

          {/* Quick Actions */}
          {!collapsed && (
            <div className="absolute bottom-4 left-4 right-4">
              <Card size="small" className="bg-blue-50 border-blue-200">
                <div className="text-center">
                  <TeamOutlined className="text-blue-500 text-xl mb-2" />
                  <p className="text-xs text-gray-600 mb-2">
                    {t('quickActions.needHelp')}
                  </p>
                  <Button size="small" type="link" className="p-0 h-auto">
                    {t('quickActions.viewDocs')}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </Sider>

        {/* Main Content */}
        <Layout>
          <Content className="p-6">
            {/* Tab Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  {currentTab.icon}
                  {currentTab.label}
                </h1>
              </div>
              <p className="text-gray-600">{currentTab.description}</p>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm">
              {['general', 'departments', 'users-roles'].includes(activeTab) ? (
                <CurrentComponent {...componentProps} />
              ) : (
                <CurrentComponent />
              )}
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
