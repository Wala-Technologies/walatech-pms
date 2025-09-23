'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Typography,
  Divider,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  SettingOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useTenant } from '../../../../../contexts/tenant-context';
import { apiClient } from '../../../../../lib/api-client';

const { Title, Text } = Typography;
const { Option } = Select;

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'basic' | 'professional' | 'enterprise';
  userCount?: number;
  createdAt: string;
  settings?: {
    maxUsers: number;
    features: string[];
  };
}

interface CreateTenantForm {
  name: string;
  subdomain: string;
  plan: 'basic' | 'premium' | 'enterprise';
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}
export default function TenantsPage() {
  const t = useTranslations('tenant');
  const tCommon = useTranslations('common');
  const { tenant: currentTenant } = useTenant();
  const router = useRouter();
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/tenants/admin/all');
      setTenants(response.data || []);
    } catch (error) {
      message.error('Failed to fetch organizations');
      console.error('Error fetching tenants:', error);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (values: CreateTenantForm) => {
    try {
      console.log('Sending tenant data:', values);
      const response = await apiClient.post('/tenant-provisioning/provision', values);
      console.log('Tenant creation response:', response);
      if (response.error) {
        console.error('API Error:', response.error);
        message.error(response.error);
        return;
      }
      message.success('Organization created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchTenants();
    } catch (error: any) {
      console.error('Tenant creation error:', error);
      message.error(error.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleUpdateTenant = async (id: string, values: Partial<Tenant>) => {
    try {
      await apiClient.patch(`/tenants/${id}`, values);
      message.success('Organization updated successfully');
      setModalVisible(false);
      setEditingTenant(null);
      form.resetFields();
      fetchTenants();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update organization');
    }
  };

  const handleDeleteTenant = async (id: string) => {
    try {
      await apiClient.delete(`/tenants/${id}`);
      message.success('Organization deleted successfully');
      fetchTenants();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete organization');
    }
  };

  const openCreateModal = () => {
    setEditingTenant(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    form.setFieldsValue({
      name: tenant.name,
      subdomain: tenant.subdomain,
      plan: tenant.plan,
      status: tenant.status
    });
    setModalVisible(true);
  };

  const navigateToSettings = (tenant: Tenant) => {
    // Store the selected tenant in localStorage for the settings page
    localStorage.setItem('selectedTenantForSettings', JSON.stringify(tenant));
    router.push('/en/dashboard/settings/organization');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'suspended': return 'red';
      default: return 'default';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'blue';
      case 'professional': return 'purple';
      case 'enterprise': return 'gold';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Organization Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Tenant) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Text type="secondary">{record.subdomain}.yourdomain.com</Text>
        </div>
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
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan: string) => (
        <Tag color={getPlanColor(plan)}>
          {plan.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => count || 0,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Tenant) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => window.open(`http://${record.subdomain}.localhost:3000`, '_blank')}
            title="Visit Organization"
          />
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => navigateToSettings(record)}
            title="Organization Settings"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            title="Edit Organization"
          />
          <Popconfirm
            title="Are you sure you want to delete this organization?"
            onConfirm={() => handleDeleteTenant(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Delete Organization"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <GlobalOutlined style={{ marginRight: '8px' }} />
          Organization Management
        </Title>
        <Text type="secondary">
          Manage organizations, their settings, and access permissions
        </Text>
      </div>

      {currentTenant && (
        <Alert
          message={`Current Organization: ${currentTenant.name}`}
          description={`You are currently managing ${currentTenant.name} (${currentTenant.subdomain})`}
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Organizations"
              value={tenants?.length || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Organizations"
              value={tenants?.filter(t => t.status === 'active')?.length || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={tenants?.reduce((sum, t) => sum + (t.userCount || 0), 0) || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Enterprise Plans"
              value={tenants?.filter(t => t.plan === 'enterprise')?.length || 0}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4}>Organizations</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Create Organization
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tenants || []}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} organizations`,
          }}
        />
      </Card>

      <Modal
        title={editingTenant ? 'Edit Organization' : 'Create New Organization'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTenant(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (editingTenant) {
              handleUpdateTenant(editingTenant.id, values);
            } else {
              handleCreateTenant(values);
            }
          }}
        >
          <Form.Item
            name="name"
            label="Organization Name"
            rules={[{ required: true, message: 'Please enter organization name' }]}
          >
            <Input placeholder="Enter organization name" />
          </Form.Item>

          <Form.Item
            name="subdomain"
            label="Subdomain"
            rules={[
              { required: true, message: 'Please enter subdomain' },
              { pattern: /^[a-z0-9-]+$/, message: 'Subdomain can only contain lowercase letters, numbers, and hyphens' }
            ]}
          >
            <Input
              placeholder="Enter subdomain"
              addonAfter=".yourdomain.com"
              disabled={!!editingTenant}
            />
          </Form.Item>

          <Form.Item
            name="plan"
            label="Plan"
            rules={[{ required: true, message: 'Please select a plan' }]}
          >
            <Select placeholder="Select plan">
              <Option value="basic">Basic</Option>
              <Option value="premium">Premium</Option>
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
              <Divider>Administrator Details</Divider>
              <Form.Item
              name="adminEmail"
              label="Admin Email"
              rules={[
                { required: true, message: 'Please input admin email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input placeholder="admin@company.com" />
            </Form.Item>

            <Form.Item
              name="adminFirstName"
              label="Admin First Name"
              rules={[
                { required: true, message: 'Please input admin first name!' },
                { min: 1, message: 'First name must be at least 1 character!' },
                { max: 50, message: 'First name must be at most 50 characters!' }
              ]}
            >
              <Input placeholder="John" />
            </Form.Item>

            <Form.Item
              name="adminLastName"
              label="Admin Last Name"
              rules={[
                { required: true, message: 'Please input admin last name!' },
                { min: 1, message: 'Last name must be at least 1 character!' },
                { max: 50, message: 'Last name must be at most 50 characters!' }
              ]}
            >
              <Input placeholder="Doe" />
            </Form.Item>

            <Form.Item
              name="adminPassword"
              label="Admin Password"
              rules={[
                { required: true, message: 'Please input admin password!' },
                { min: 8, message: 'Password must be at least 8 characters!' }
              ]}
            >
              <Input.Password placeholder="Enter admin password" />
            </Form.Item>
            </>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingTenant(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTenant ? 'Update' : 'Create'} Organization
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}