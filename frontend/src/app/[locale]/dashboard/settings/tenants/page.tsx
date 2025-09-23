'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Divider,
  Typography,
  Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../../../../../lib/api-client';
import { useTenant } from '../../../../../contexts/tenant-context';

const { Option } = Select;
const { Title, Text } = Typography;

interface TenantSettingsShape {
  companyName?: string;
  companyLogo?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  branding?: Record<string, string>;
  [key: string]: unknown;
}

interface UITenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'inactive' | 'suspended';
  plan?: string;
  settings?: TenantSettingsShape;
  createdAt?: string;
  updatedAt?: string;
}

export default function TenantsPage() {
  const { tenant: currentTenant } = useTenant();
  const isSuperAdmin = currentTenant?.subdomain === 'walatech';

  const [tenants, setTenants] = useState<UITenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<UITenant | null>(null);
  const [form] = Form.useForm();

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      if (isSuperAdmin) {
        const res = await apiClient.get<UITenant[]>('/tenants');
        if (res.error) throw new Error(res.error);
        setTenants(res.data || []);
      } else {
        // Non-super admin: fetch only user's tenant(s) via user-specific endpoint
        const res = await apiClient.get<UITenant[]>('/tenants/user/tenants');
        if (res.error) throw new Error(res.error);
        // Ensure no accidental multi-tenant leakage
        const filtered = (res.data || []).filter(
          (t) => t.subdomain === currentTenant?.subdomain
        );
        setTenants(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch tenants', err);
      message.error((err as Error).message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, currentTenant?.subdomain]);

  useEffect(() => {
    if (currentTenant) {
      fetchTenants();
    }
  }, [currentTenant, fetchTenants]);

  const openCreateModal = () => {
    setEditingTenant(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = useCallback(
    (record: UITenant) => {
      setEditingTenant(record);
      form.setFieldsValue({
        name: record.name,
        subdomain: record.subdomain,
        plan: record.plan,
        status: record.status,
      });
      setModalVisible(true);
    },
    [form]
  );

  const handleDelete = useCallback(
    async (record: UITenant) => {
      try {
        const res = await apiClient.delete(`/tenants/${record.id}`);
        if (res.error) throw new Error(res.error);
        message.success('Tenant deleted');
        fetchTenants();
      } catch (err) {
        message.error((err as Error).message || 'Delete failed');
      }
    },
    [fetchTenants]
  );

  const submitForm = async () => {
    try {
      const values = await form.validateFields();
      if (editingTenant) {
        const res = await apiClient.patch(
          `/tenants/${editingTenant.id}`,
          values
        );
        if (res.error) throw new Error(res.error);
        message.success('Tenant updated');
      } else {
        const res = await apiClient.post('/tenants', values);
        if (res.error) throw new Error(res.error);
        message.success('Tenant created');
      }
      setModalVisible(false);
      setEditingTenant(null);
      form.resetFields();
      fetchTenants();
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      } else {
        message.error('Operation failed');
      }
    }
  };

  const columns: ColumnsType<UITenant> = useMemo(() => {
    const base: ColumnsType<UITenant> = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Subdomain',
        dataIndex: 'subdomain',
        key: 'subdomain',
        render: (value: UITenant['subdomain']) => <code>{value}</code>,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (value: UITenant['status']) => {
          const status = value || 'inactive';
          const color =
            status === 'active'
              ? 'green'
              : status === 'suspended'
              ? 'red'
              : 'orange';
          return <Tag color={color}>{status.toUpperCase()}</Tag>;
        },
      },
      {
        title: 'Plan',
        dataIndex: 'plan',
        key: 'plan',
        render: (value: UITenant['plan']) => (value ? value : '-'),
      },
    ];
    if (isSuperAdmin) {
      base.push({
        title: 'Actions',
        key: 'actions',
        render: (_value: unknown, record: UITenant) => (
          <Space size="small">
            <Button size="small" onClick={() => openEditModal(record)}>
              Edit
            </Button>
            <Popconfirm
              title="Delete tenant?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDelete(record)}
            >
              <Button size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      });
    }
    return base;
  }, [isSuperAdmin, openEditModal, handleDelete]);

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Organizations</Title>
      <Text type="secondary">
        {isSuperAdmin
          ? 'Manage all tenant organizations.'
          : 'You can view your organization details.'}
      </Text>
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        {isSuperAdmin && (
          <Button type="primary" onClick={openCreateModal}>
            New Organization
          </Button>
        )}
      </div>
      <Table<UITenant>
        rowKey="id"
        dataSource={tenants}
        columns={columns}
        loading={loading}
        pagination={false}
        size="middle"
      />

      <Modal
        open={modalVisible}
        title={editingTenant ? 'Edit Organization' : 'Create Organization'}
        onCancel={() => {
          setModalVisible(false);
          setEditingTenant(null);
          form.resetFields();
        }}
        onOk={submitForm}
        okText={editingTenant ? 'Update' : 'Create'}
        destroyOnClose
      >
        <Form layout="vertical" form={form} preserve={false}>
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: 'Please enter organization name' },
            ]}
          >
            <Input placeholder="Enter organization name" />
          </Form.Item>
          <Form.Item
            name="subdomain"
            label="Subdomain"
            rules={[
              { required: true, message: 'Please enter subdomain' },
              {
                pattern: /^[a-z0-9-]+$/,
                message: 'Lowercase letters, numbers, hyphens only',
              },
            ]}
          >
            <Input
              placeholder="example"
              addonAfter=".yourdomain.com"
              disabled={!!editingTenant}
            />
          </Form.Item>
          <Form.Item name="plan" label="Plan">
            <Select placeholder="Select plan" allowClear>
              <Option value="basic">Basic</Option>
              <Option value="premium">Premium</Option>
              <Option value="enterprise">Enterprise</Option>
            </Select>
          </Form.Item>
          {editingTenant && (
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="suspended">Suspended</Option>
              </Select>
            </Form.Item>
          )}
          {!editingTenant && (
            <Divider style={{ margin: '12px 0' }}>
              Administrator (auto-provisioning currently disabled)
            </Divider>
          )}
        </Form>
      </Modal>
    </div>
  );
}
