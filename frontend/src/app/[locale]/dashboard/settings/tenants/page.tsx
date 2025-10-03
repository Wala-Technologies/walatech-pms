'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  message,
  Typography,
  Table,
  Modal,
  Space,
  Tag,
  Spin,
  Layout,
  Breadcrumb,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BankOutlined,
  HomeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/api-client';
import { useAuth } from '../../../../../hooks/useAuth';

const { Option } = Select;
const { Title, Text } = Typography;
const { Content } = Layout;

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'inactive' | 'suspended' | 'soft_deleted' | 'hard_deleted';
  plan?: string;
  settings?: any;
  createdAt?: string;
  updatedAt?: string;
  softDeletedAt?: string;
  hardDeleteScheduledAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  retentionPeriodDays?: number;
}

interface CreateTenantForm {
  name: string;
  subdomain: string;
  plan: string;
  status: 'active' | 'inactive';
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

export default function TenantManagement() {
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  
  console.log('Current user:', user);
  console.log('Is super admin:', isSuperAdmin);
  console.log('Auth loading:', authLoading);
  
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
  const [form] = Form.useForm();
  const [subdomainValidation, setSubdomainValidation] = useState<{
    status: 'validating' | 'success' | 'error' | '';
    message: string;
  }>({ status: '', message: '' });

  const fetchTenants = useCallback(async () => {
    console.log('fetchTenants called, isSuperAdmin:', isSuperAdmin);
    if (!isSuperAdmin) {
      console.log('User is not super admin, skipping tenant fetch');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Making API call to /tenants with includeDeleted=true');
      const res = await apiClient.get<Tenant[]>('/tenants?includeDeleted=true');
      console.log('API response:', res);
      
      if (res.error) {
        console.error('API returned error:', res.error);
        throw new Error(res.error);
      }
      
      // Backend returns Tenant[] directly, not wrapped in an object
      console.log('Setting tenants data:', res.data);
      setTenants(res.data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      message.error('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!authLoading && isSuperAdmin) {
      fetchTenants();
    } else if (!authLoading && !isSuperAdmin) {
      setLoading(false);
    }
  }, [authLoading, isSuperAdmin, fetchTenants]);

  const handleCreateTenant = async (values: CreateTenantForm) => {
    try {
      // Remove status from values as the provisioning endpoint doesn't accept it
      // The backend automatically sets status to ACTIVE for new tenants
      const { status, ...provisionData } = values;
      
      // Use tenant provisioning endpoint for complete setup with admin user
      const res = await apiClient.post('/tenant-provisioning/provision', provisionData);
      if (res.error) throw new Error(res.error);
      
      message.success('Tenant and admin user created successfully');
      setIsModalVisible(false);
      setSubdomainValidation({ status: '', message: '' });
      form.resetFields();
      fetchTenants();
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Subdomain is already taken') || 
          error.message?.includes('Subdomain already exists') ||
          (error.response?.status === 409 && error.response?.data?.message?.includes('Subdomain'))) {
        
        const subdomain = values.subdomain;
        const suggestions = generateSubdomainSuggestions(subdomain);
        
        Modal.error({
          title: 'Subdomain Already Taken',
          content: (
            <div>
              <p>The subdomain "<strong>{subdomain}</strong>" is already in use.</p>
              <p>Here are some available alternatives:</p>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                {suggestions.map((suggestion, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>
                    <code style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '2px 6px', 
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      form.setFieldsValue({ subdomain: suggestion });
                      Modal.destroyAll();
                    }}
                    >
                      {suggestion}
                    </code>
                    <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                      (click to use)
                    </span>
                  </li>
                ))}
              </ul>
              <p style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                You can also modify the subdomain manually in the form.
              </p>
            </div>
          ),
          width: 500,
        });
      } else if (error.message?.includes('Admin email already exists') ||
                 (error.response?.status === 409 && error.response?.data?.message?.includes('email'))) {
        message.error('An admin user with this email already exists. Please use a different email address.');
      } else if (error.message?.includes('Invalid subdomain format') ||
                 error.message?.includes('Subdomain must be')) {
        message.error('Invalid subdomain format. Use only lowercase letters, numbers, and hyphens (3-63 characters).');
      } else if (error.message?.includes('Subdomain is reserved')) {
        message.error('This subdomain is reserved. Please choose a different one.');
      } else {
        message.error('Failed to create tenant and admin user. Please try again.');
      }
    }
  };

  // Helper function to generate subdomain suggestions
  const generateSubdomainSuggestions = (baseSubdomain: string): string[] => {
    const suggestions: string[] = [];
    const cleanBase = baseSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    // Try with numbers
    for (let i = 1; i <= 5; i++) {
      suggestions.push(`${cleanBase}${i}`);
    }

    // Try with common suffixes
    const suffixes = ['corp', 'inc', 'co', 'org', 'tech'];
    suffixes.forEach(suffix => {
      suggestions.push(`${cleanBase}-${suffix}`);
    });

    return suggestions.slice(0, 5); // Return top 5 suggestions
  };

  // Custom debounce function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Subdomain validation function
  const validateSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainValidation({ status: '', message: '' });
      return;
    }

    // Check format first
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      setSubdomainValidation({
        status: 'error',
        message: 'Invalid format. Use only lowercase letters, numbers, and hyphens.'
      });
      return;
    }

    // Check reserved subdomains
    const reservedSubdomains = [
      'www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'shop',
      'support', 'help', 'docs', 'status', 'cdn', 'assets', 'static'
    ];

    if (reservedSubdomains.includes(subdomain)) {
      setSubdomainValidation({
        status: 'error',
        message: 'This subdomain is reserved. Please choose a different one.'
      });
      return;
    }

    setSubdomainValidation({ status: 'validating', message: 'Checking availability...' });

    try {
      const response = await apiClient.validateTenant(subdomain);
      if (response.error) {
        setSubdomainValidation({
          status: 'error',
          message: 'Error checking availability. Please try again.'
        });
        return;
      }

      if (response.data?.valid) {
        setSubdomainValidation({
          status: 'error',
          message: 'This subdomain is already taken. Please choose a different one.'
        });
      } else {
        setSubdomainValidation({
          status: 'success',
          message: 'Subdomain is available!'
        });
      }
    } catch (error) {
      setSubdomainValidation({
        status: 'error',
        message: 'Error checking availability. Please try again.'
      });
    }
  };

  // Debounced validation
  const debouncedValidateSubdomain = useCallback(
    debounce(validateSubdomainAvailability, 500),
    []
  );

  // Handle subdomain input change
  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    form.setFieldsValue({ subdomain: value });
    
    if (!editingTenant) {
      debouncedValidateSubdomain(value);
    }
  };

  const handleUpdateTenant = async (tenantId: string, values: Partial<Tenant>) => {
    try {
      const res = await apiClient.patch(`/tenants/${tenantId}`, values);
      if (res.error) throw new Error(res.error);
      
      message.success('Tenant updated successfully');
      setIsModalVisible(false);
      setEditingTenant(null);
      form.resetFields();
      fetchTenants();
    } catch (error) {
      message.error('Failed to update tenant');
      console.error('Error updating tenant:', error);
    }
  };

  const handleReactivateTenant = async (tenantId: string, tenant: Tenant) => {
    Modal.confirm({
      title: (
        <div style={{ color: '#2e7d32' }}>
          🔄 Reactivate Tenant
        </div>
      ),
      content: (
        <div>
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#e8f5e8', border: '1px solid #c3e6c3', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#2e7d32' }}>
              ✅ Restoring tenant from soft deletion
            </p>
          </div>
          
          <p><strong>Tenant:</strong> {tenant.name}</p>
          <p><strong>Subdomain:</strong> {tenant.subdomain}</p>
          <p><strong>Current Status:</strong> <Tag color="volcano">SOFT DELETED</Tag></p>
          
          {tenant.softDeletedAt && (
            <p><strong>Deleted On:</strong> {new Date(tenant.softDeletedAt).toLocaleDateString()}</p>
          )}
          
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ color: '#2e7d32' }}>What happens when reactivated:</h4>
            <ul style={{ color: '#2e7d32' }}>
              <li>✅ Tenant status will be restored to "Active"</li>
              <li>🔓 All users can log in again</li>
              <li>💾 All data and settings will be fully accessible</li>
              <li>🌐 Web interface will be immediately available</li>
              <li>📧 Users may receive reactivation notifications</li>
            </ul>
          </div>
          
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>
              ℹ️ Note: This will cancel any scheduled hard deletion
            </p>
          </div>
        </div>
      ),
      okText: '🔄 Yes, Reactivate Tenant',
      cancelText: 'Cancel',
      okButtonProps: {
        style: { backgroundColor: '#4caf50', borderColor: '#4caf50' }
      },
      onOk: async () => {
        try {
          const res = await apiClient.post(`/tenants/${tenantId}/reactivate`, {
            reason: 'Reactivated via admin interface'
          });
          if (res.error) throw new Error(res.error);
          
          message.success('✅ Tenant reactivated successfully - All services are now available');
          fetchTenants();
        } catch (error) {
          message.error('❌ Failed to reactivate tenant');
          console.error('Error reactivating tenant:', error);
        }
      },
    });
  };

  const handleDeleteTenant = async (tenantId: string, tenant: Tenant) => {
    // Generate context-aware warnings based on tenant status
    const getStatusWarning = () => {
      switch (tenant.status) {
        case 'active':
          return '⚠️ This tenant is currently ACTIVE with users and data. Deletion will immediately disable all access.';
        case 'suspended':
          return 'ℹ️ This tenant is currently suspended. Deletion will make it permanently inaccessible.';
        case 'inactive':
          return 'ℹ️ This tenant is currently inactive. Deletion will remove it from the system.';
        default:
          return 'ℹ️ This tenant will be removed from the system.';
      }
    };

    // Show deletion options modal with enhanced warnings
    Modal.confirm({
      title: (
        <div style={{ color: '#d32f2f' }}>
          🗑️ Delete Tenant - Choose Deletion Type
        </div>
      ),
      content: (
        <div>
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>{getStatusWarning()}</p>
          </div>
          
          <p><strong>Tenant:</strong> {tenant.name}</p>
          <p><strong>Subdomain:</strong> {tenant.subdomain}</p>
          <p><strong>Current Status:</strong> <Tag color={getStatusColor(tenant.status)}>{tenant.status.toUpperCase()}</Tag></p>
          
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ marginBottom: '8px' }}>Choose deletion type:</h4>
            
            <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#e8f5e8', border: '1px solid #c3e6c3', borderRadius: '4px' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#2e7d32' }}>🔄 Soft Delete (Recommended)</p>
              <ul style={{ margin: '4px 0 0 16px', color: '#2e7d32' }}>
                <li>Tenant becomes inaccessible but data is preserved</li>
                <li>Can be restored within 90 days</li>
                <li>Automatic hard deletion after retention period</li>
                <li>All users will be immediately logged out</li>
              </ul>
            </div>
            
            <div style={{ padding: '8px', backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '4px' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#c62828' }}>💀 Hard Delete (Permanent)</p>
              <ul style={{ margin: '4px 0 0 16px', color: '#c62828' }}>
                <li><strong>IRREVERSIBLE</strong> - All data will be permanently lost</li>
                <li>All user accounts, files, and settings deleted</li>
                <li>Cannot be recovered or restored</li>
                <li>Use only when absolutely certain</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      okText: '🔄 Soft Delete (Safe)',
      cancelText: 'Cancel',
      okButtonProps: { 
        style: { backgroundColor: '#4caf50', borderColor: '#4caf50' }
      },
      onOk: async () => {
        // Show soft delete confirmation
        Modal.confirm({
          title: '🔄 Confirm Soft Delete',
          content: (
            <div>
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#e8f5e8', border: '1px solid #c3e6c3', borderRadius: '4px' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#2e7d32' }}>✅ Safe Choice - Data will be preserved</p>
              </div>
              
              <p>Soft deleting: <strong>{tenant.name}</strong> ({tenant.subdomain})</p>
              
              <div style={{ marginTop: '12px' }}>
                <h4>What happens next:</h4>
                <ul>
                  <li>✋ All users will be immediately logged out</li>
                  <li>🔒 Tenant becomes inaccessible via web interface</li>
                  <li>💾 All data remains safely stored</li>
                  <li>📅 Scheduled for hard deletion on: <strong>{new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong></li>
                  <li>🔄 Can be reactivated anytime within 90 days</li>
                </ul>
              </div>
            </div>
          ),
          okText: 'Yes, Soft Delete',
          cancelText: 'Cancel',
          onOk: async () => {
            try {
              const res = await apiClient.post(`/tenants/${tenantId}/soft-delete`, {
                reason: 'Deleted via admin interface',
                retentionDays: 90
              });
              if (res.error) throw new Error(res.error);
              
              message.success('✅ Tenant soft deleted successfully - Can be restored within 90 days');
              fetchTenants();
            } catch (error) {
              message.error('❌ Failed to soft delete tenant');
              console.error('Error soft deleting tenant:', error);
            }
          },
        });
      },
      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <Button
            danger
            style={{ backgroundColor: '#d32f2f', borderColor: '#d32f2f' }}
            onClick={async () => {
              Modal.destroyAll();
              // Show hard delete warning and confirmation
              Modal.confirm({
                title: (
                  <div style={{ color: '#d32f2f' }}>
                    💀 DANGER: Permanent Deletion Warning
                  </div>
                ),
                content: (
                  <div>
                    <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#ffebee', border: '2px solid #f44336', borderRadius: '4px' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#d32f2f', fontSize: '16px' }}>
                        ⚠️ CRITICAL WARNING: This action is IRREVERSIBLE!
                      </p>
                    </div>
                    
                    <p>You are about to <strong style={{ color: '#d32f2f' }}>permanently delete</strong>:</p>
                    <div style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px', margin: '8px 0' }}>
                      <p style={{ margin: 0 }}><strong>Tenant:</strong> {tenant.name}</p>
                      <p style={{ margin: 0 }}><strong>Subdomain:</strong> {tenant.subdomain}</p>
                      <p style={{ margin: 0 }}><strong>Status:</strong> <Tag color={getStatusColor(tenant.status)}>{tenant.status.toUpperCase()}</Tag></p>
                    </div>
                    
                    <div style={{ marginTop: '16px' }}>
                      <h4 style={{ color: '#d32f2f' }}>What will be permanently lost:</h4>
                      <ul style={{ color: '#d32f2f' }}>
                        <li><strong>All user accounts and profiles</strong></li>
                        <li><strong>All business data (customers, orders, inventory, etc.)</strong></li>
                        <li><strong>All uploaded files and documents</strong></li>
                        <li><strong>All system configurations and settings</strong></li>
                        <li><strong>All audit logs and history</strong></li>
                      </ul>
                    </div>
                    
                    <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>
                        💡 Consider using "Soft Delete" instead - it's safer and reversible!
                      </p>
                    </div>
                  </div>
                ),
                okText: '💀 Yes, Permanently Delete Everything',
                okType: 'danger',
                cancelText: '🛡️ Cancel (Recommended)',
                okButtonProps: {
                  style: { backgroundColor: '#d32f2f', borderColor: '#d32f2f' }
                },
                cancelButtonProps: {
                  style: { backgroundColor: '#4caf50', borderColor: '#4caf50', color: 'white' }
                },
                onOk: async () => {
                  try {
                    const res = await apiClient.post(`/tenants/${tenantId}/hard-delete`, {
                      reason: 'Permanently deleted via admin interface'
                    });
                    if (res.error) throw new Error(res.error);
                    
                    message.success('💀 Tenant permanently deleted - All data has been removed');
                    fetchTenants();
                  } catch (error) {
                    message.error('❌ Failed to permanently delete tenant');
                    console.error('Error hard deleting tenant:', error);
                  }
                },
              });
            }}
          >
            💀 Hard Delete (Permanent)
          </Button>
          <OkBtn />
        </>
      ),
    });
  };

  const showEditModal = (tenant?: Tenant) => {
    if (tenant) {
      setEditingTenant(tenant);
      form.setFieldsValue({
        name: tenant.name,
        subdomain: tenant.subdomain,
        plan: tenant.plan || 'basic',
        status: tenant.status,
      });
    } else {
      setEditingTenant(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const showViewModal = (tenant: Tenant) => {
    setViewingTenant(tenant);
    setIsViewModalVisible(true);
  };

  const handleManageSettings = (tenant: Tenant) => {
    // Navigate to organization settings for this specific tenant
    // We'll use a query parameter to specify which tenant to manage
    router.push(`/dashboard/settings/organization?tenant=${tenant.subdomain}`);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingTenant) {
        handleUpdateTenant(editingTenant.id, values);
      } else {
        handleCreateTenant(values);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'suspended': return 'red';
      case 'soft_deleted': return 'volcano';
      case 'hard_deleted': return 'magenta';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Tenant, b: Tenant) => a.name.localeCompare(b.name),
    },
    {
      title: 'Subdomain',
      dataIndex: 'subdomain',
      key: 'subdomain',
      render: (subdomain: string) => (
        <Text code>{subdomain}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Suspended', value: 'suspended' },
        { text: 'Soft Deleted', value: 'soft_deleted' },
        { text: 'Hard Deleted', value: 'hard_deleted' },
      ],
      defaultFilteredValue: ['active'],
      onFilter: (value: any, record: Tenant) => record.status === value,
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan: string) => plan || 'Basic',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
      sorter: (a: Tenant, b: Tenant) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Tenant) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showViewModal(record)}
          >
            View
          </Button>
          {record.status !== 'soft_deleted' && record.status !== 'hard_deleted' && (
            <>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => showEditModal(record)}
              >
                Edit
              </Button>
              <Button
                type="link"
                icon={<SettingOutlined />}
                onClick={() => handleManageSettings(record)}
              >
                Manage Settings
              </Button>
            </>
          )}
          {record.status === 'soft_deleted' && (
            <Button
              type="link"
              style={{ color: '#52c41a' }}
              onClick={() => handleReactivateTenant(record.id, record)}
            >
              Reactivate
            </Button>
          )}
          {record.status !== 'soft_deleted' && record.status !== 'hard_deleted' && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteTenant(record.id, record)}
            >
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '24px' }}>
          <Breadcrumb 
            style={{ marginBottom: '24px' }}
            items={[
              {
                title: <HomeOutlined />
              },
              {
                title: 'Settings'
              },
              {
                title: 'Tenant Management'
              }
            ]}
          />
          
          <Alert
            message="Access Denied"
            description="You need super administrator privileges to access tenant management."
            type="error"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Breadcrumb 
          style={{ marginBottom: '24px' }}
          items={[
            {
              title: <HomeOutlined />
            },
            {
              title: 'Settings'
            },
            {
              title: 'Tenant Management'
            }
          ]}
        />

        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            <BankOutlined style={{ marginRight: '8px' }} />
            Tenant Management
          </Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => showEditModal()}
          >
            Add New Tenant
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={tenants}
            rowKey="id"
            loading={loading}
            pagination={{
              total: tenants.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tenants`,
            }}
          />
        </Card>

        <Modal
          title={editingTenant ? 'Edit Tenant' : 'Create New Tenant'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingTenant(null);
            setSubdomainValidation({ status: '', message: '' });
            form.resetFields();
          }}
          okText={editingTenant ? 'Update' : 'Create'}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              plan: 'basic',
              status: 'active',
            }}
          >
            <Form.Item
              name="name"
              label="Tenant Name"
              rules={[{ required: true, message: 'Please enter tenant name' }]}
            >
              <Input placeholder="Enter tenant name" />
            </Form.Item>

            <Form.Item
              name="subdomain"
              label="Subdomain"
              validateStatus={subdomainValidation.status === 'error' ? 'error' : 
                            subdomainValidation.status === 'success' ? 'success' : 
                            subdomainValidation.status === 'validating' ? 'validating' : ''}
              help={subdomainValidation.message}
              rules={[
                { required: true, message: 'Please enter subdomain' },
                { pattern: /^[a-z0-9-]+$/, message: 'Subdomain can only contain lowercase letters, numbers, and hyphens' },
                {
                  validator: async (_, value) => {
                    if (!editingTenant && value && subdomainValidation.status === 'error') {
                      throw new Error(subdomainValidation.message);
                    }
                  }
                }
              ]}
            >
              <Input 
                placeholder="Enter subdomain" 
                disabled={!!editingTenant}
                addonAfter=".yourdomain.com"
                onChange={handleSubdomainChange}
                suffix={subdomainValidation.status === 'validating' ? <Spin size="small" /> : null}
              />
            </Form.Item>

            <Form.Item
              name="plan"
              label="Plan"
              rules={[{ required: true, message: 'Please select a plan' }]}
            >
              <Select placeholder="Select plan">
                <Option value="basic">Basic</Option>
                <Option value="professional">Professional</Option>
                <Option value="enterprise">Enterprise</Option>
              </Select>
            </Form.Item>

            {editingTenant && (
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="suspended">Suspended</Option>
                </Select>
              </Form.Item>
            )}

            {!editingTenant && (
              <>
                <div style={{ marginTop: '24px', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, color: '#1890ff' }}>Admin User Details</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                    Create an admin user for this tenant
                  </p>
                </div>

                <Form.Item
                  name="adminFirstName"
                  label="Admin First Name"
                  rules={[{ required: true, message: 'Please enter admin first name' }]}
                >
                  <Input placeholder="Enter admin first name" />
                </Form.Item>

                <Form.Item
                  name="adminLastName"
                  label="Admin Last Name"
                  rules={[{ required: true, message: 'Please enter admin last name' }]}
                >
                  <Input placeholder="Enter admin last name" />
                </Form.Item>

                <Form.Item
                  name="adminEmail"
                  label="Admin Email"
                  rules={[
                    { required: true, message: 'Please enter admin email' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                >
                  <Input placeholder="Enter admin email address" />
                </Form.Item>

                <Form.Item
                  name="adminPassword"
                  label="Admin Password"
                  rules={[
                    { required: true, message: 'Please enter admin password' },
                    { min: 8, message: 'Password must be at least 8 characters long' }
                  ]}
                >
                  <Input.Password placeholder="Enter admin password (min 8 characters)" />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>

        {/* View Tenant Modal */}
        <Modal
          title="View Tenant Details"
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsViewModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={600}
        >
          {viewingTenant && (
            <div style={{ padding: '16px 0' }}>
              <div style={{ marginBottom: '16px' }}>
                <strong>Name:</strong> {viewingTenant.name}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Subdomain:</strong> {viewingTenant.subdomain}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Plan:</strong> {viewingTenant.plan || 'Basic'}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Status:</strong>{' '}
                <Tag color={getStatusColor(viewingTenant.status)}>
                  {viewingTenant.status.toUpperCase()}
                </Tag>
              </div>
              <div style={{ marginBottom: '16px' }}>
                 <strong>Created:</strong> {viewingTenant.createdAt ? new Date(viewingTenant.createdAt).toLocaleDateString() : 'N/A'}
               </div>
               <div>
                 <strong>Updated:</strong> {viewingTenant.updatedAt ? new Date(viewingTenant.updatedAt).toLocaleDateString() : 'N/A'}
               </div>
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  );
}
