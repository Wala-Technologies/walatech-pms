'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Switch, 
  Table, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message,
  Row,
  Col,
  Divider,
  Alert
} from 'antd';
import { 
  ApiOutlined, 
  SettingOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';

const { Option } = Select;
const { TextArea } = Input;

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  description: string;
  apiKey?: string;
  webhookUrl?: string;
  lastSync?: string;
  config: Record<string, any>;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  status: 'active' | 'revoked';
}

export default function IntegrationsManagement() {
  const t = useTranslations('organization.integrations');
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [form] = Form.useForm();
  const [apiKeyForm] = Form.useForm();

  useEffect(() => {
    loadIntegrations();
    loadApiKeys();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockIntegrations: Integration[] = [
        {
          id: '1',
          name: 'Stripe Payment Gateway',
          type: 'payment',
          status: 'active',
          description: 'Process payments and manage subscriptions',
          apiKey: 'sk_test_***',
          lastSync: '2024-01-15T10:30:00Z',
          config: { webhookSecret: 'whsec_***' }
        },
        {
          id: '2',
          name: 'SendGrid Email Service',
          type: 'email',
          status: 'active',
          description: 'Send transactional emails and notifications',
          apiKey: 'SG.***',
          lastSync: '2024-01-15T09:15:00Z',
          config: { fromEmail: 'noreply@company.com' }
        },
        {
          id: '3',
          name: 'Slack Notifications',
          type: 'notification',
          status: 'inactive',
          description: 'Send alerts and notifications to Slack channels',
          webhookUrl: 'https://hooks.slack.com/***',
          config: { channel: '#alerts' }
        }
      ];
      
      setIntegrations(mockIntegrations);
    } catch (error) {
      message.error(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadApiKeys = async () => {
    try {
      // Mock data - replace with actual API call
      const mockApiKeys: ApiKey[] = [
        {
          id: '1',
          name: 'Mobile App API',
          key: 'wala_***',
          permissions: ['inventory:read', 'customers:read', 'orders:manage'],
          createdAt: '2024-01-10T08:00:00Z',
          lastUsed: '2024-01-15T14:30:00Z',
          status: 'active'
        },
        {
          id: '2',
          name: 'Analytics Dashboard',
          key: 'wala_***',
          permissions: ['dashboard:read', 'reports:read'],
          createdAt: '2024-01-05T10:00:00Z',
          lastUsed: '2024-01-14T16:45:00Z',
          status: 'active'
        }
      ];
      
      setApiKeys(mockApiKeys);
    } catch (error) {
      message.error(t('errors.loadApiKeysFailed'));
    }
  };

  const handleToggleIntegration = async (integration: Integration) => {
    try {
      const newStatus = integration.status === 'active' ? 'inactive' : 'active';
      // TODO: Replace with actual API call
      console.log(`Toggling integration ${integration.id} to ${newStatus}`);
      
      setIntegrations(prev => 
        prev.map(item => 
          item.id === integration.id 
            ? { ...item, status: newStatus }
            : item
        )
      );
      
      message.success(t('messages.integrationToggled'));
    } catch (error) {
      message.error(t('errors.toggleFailed'));
    }
  };

  const handleSaveIntegration = async (values: any) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      console.log('Saving integration:', values);
      
      if (editingIntegration) {
        setIntegrations(prev => 
          prev.map(item => 
            item.id === editingIntegration.id 
              ? { ...item, ...values }
              : item
          )
        );
        message.success(t('messages.integrationUpdated'));
      } else {
        const newIntegration: Integration = {
          id: Date.now().toString(),
          ...values,
          status: 'inactive'
        };
        setIntegrations(prev => [...prev, newIntegration]);
        message.success(t('messages.integrationAdded'));
      }
      
      setModalVisible(false);
      setEditingIntegration(null);
      form.resetFields();
    } catch (error) {
      message.error(t('errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (values: any) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      console.log('Creating API key:', values);
      
      const newApiKey: ApiKey = {
        id: Date.now().toString(),
        ...values,
        key: `wala_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      setApiKeys(prev => [...prev, newApiKey]);
      setApiKeyModalVisible(false);
      apiKeyForm.resetFields();
      message.success(t('messages.apiKeyCreated'));
    } catch (error) {
      message.error(t('errors.createApiKeyFailed'));
    } finally {
      setLoading(false);
    }
  };

  const integrationColumns = [
    {
      title: t('table.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('table.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'payment' ? 'green' : type === 'email' ? 'blue' : 'orange'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('table.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag 
          color={status === 'active' ? 'green' : status === 'error' ? 'red' : 'default'}
          icon={status === 'active' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
        >
          {t(`status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('table.lastSync'),
      dataIndex: 'lastSync',
      key: 'lastSync',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: t('table.actions'),
      key: 'actions',
      render: (record: Integration) => (
        <div className="flex gap-2">
          <Switch
            checked={record.status === 'active'}
            onChange={() => handleToggleIntegration(record)}
            size="small"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingIntegration(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: t('confirm.deleteIntegration'),
                onOk: () => {
                  setIntegrations(prev => prev.filter(item => item.id !== record.id));
                  message.success(t('messages.integrationDeleted'));
                }
              });
            }}
          />
        </div>
      ),
    },
  ];

  const apiKeyColumns = [
    {
      title: t('apiKeys.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('apiKeys.key'),
      dataIndex: 'key',
      key: 'key',
      render: (key: string) => `${key.substring(0, 10)}...`,
    },
    {
      title: t('apiKeys.permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <div className="flex flex-wrap gap-1">
          {permissions.slice(0, 2).map(permission => (
            <Tag key={permission}>{permission}</Tag>
          ))}
          {permissions.length > 2 && (
            <Tag>+{permissions.length - 2}</Tag>
          )}
        </div>
      ),
    },
    {
      title: t('apiKeys.lastUsed'),
      dataIndex: 'lastUsed',
      key: 'lastUsed',
      render: (date: string) => date ? new Date(date).toLocaleString() : t('apiKeys.neverUsed'),
    },
    {
      title: t('apiKeys.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {t(`apiKeys.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('table.actions'),
      key: 'actions',
      render: (record: ApiKey) => (
        <Button
          type="text"
          danger
          size="small"
          onClick={() => {
            Modal.confirm({
              title: t('confirm.revokeApiKey'),
              onOk: () => {
                setApiKeys(prev => 
                  prev.map(item => 
                    item.id === record.id 
                      ? { ...item, status: 'revoked' as const }
                      : item
                  )
                );
                message.success(t('messages.apiKeyRevoked'));
              }
            });
          }}
        >
          {t('actions.revoke')}
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Third-party Integrations */}
      <Card 
        title={
          <span className="flex items-center gap-2">
            <ApiOutlined />
            {t('sections.integrations')}
          </span>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingIntegration(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            {t('actions.addIntegration')}
          </Button>
        }
        className="mb-6"
      >
        <Table
          columns={integrationColumns}
          dataSource={integrations}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* API Keys Management */}
      <Card 
        title={
          <span className="flex items-center gap-2">
            <KeyOutlined />
            {t('sections.apiKeys')}
          </span>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setApiKeyModalVisible(true)}
          >
            {t('actions.createApiKey')}
          </Button>
        }
      >
        <Alert
          message={t('alerts.apiKeyInfo')}
          type="info"
          showIcon
          className="mb-4"
        />
        <Table
          columns={apiKeyColumns}
          dataSource={apiKeys}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Integration Modal */}
      <Modal
        title={editingIntegration ? t('modals.editIntegration') : t('modals.addIntegration')}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingIntegration(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveIntegration}
        >
          <Form.Item
            name="name"
            label={t('fields.name')}
            rules={[{ required: true, message: t('validation.nameRequired') }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="type"
            label={t('fields.type')}
            rules={[{ required: true, message: t('validation.typeRequired') }]}
          >
            <Select>
              <Option value="payment">{t('types.payment')}</Option>
              <Option value="email">{t('types.email')}</Option>
              <Option value="notification">{t('types.notification')}</Option>
              <Option value="analytics">{t('types.analytics')}</Option>
              <Option value="storage">{t('types.storage')}</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label={t('fields.description')}
          >
            <TextArea rows={3} />
          </Form.Item>
          
          <Form.Item
            name="apiKey"
            label={t('fields.apiKey')}
          >
            <Input.Password />
          </Form.Item>
          
          <Form.Item
            name="webhookUrl"
            label={t('fields.webhookUrl')}
          >
            <Input />
          </Form.Item>
          
          <div className="flex justify-end gap-2">
            <Button onClick={() => setModalVisible(false)}>
              {t('actions.cancel')}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('actions.save')}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* API Key Modal */}
      <Modal
        title={t('modals.createApiKey')}
        open={apiKeyModalVisible}
        onCancel={() => {
          setApiKeyModalVisible(false);
          apiKeyForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={apiKeyForm}
          layout="vertical"
          onFinish={handleCreateApiKey}
        >
          <Form.Item
            name="name"
            label={t('apiKeys.name')}
            rules={[{ required: true, message: t('validation.nameRequired') }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="permissions"
            label={t('apiKeys.permissions')}
            rules={[{ required: true, message: t('validation.permissionsRequired') }]}
          >
            <Select mode="multiple" placeholder={t('placeholders.selectPermissions')}>
              <Option value="dashboard:read">Dashboard Read</Option>
              <Option value="inventory:read">Inventory Read</Option>
              <Option value="inventory:manage">Inventory Manage</Option>
              <Option value="customers:read">Customers Read</Option>
              <Option value="customers:manage">Customers Manage</Option>
              <Option value="orders:read">Orders Read</Option>
              <Option value="orders:manage">Orders Manage</Option>
              <Option value="reports:read">Reports Read</Option>
            </Select>
          </Form.Item>
          
          <div className="flex justify-end gap-2">
            <Button onClick={() => setApiKeyModalVisible(false)}>
              {t('actions.cancel')}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('actions.create')}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}