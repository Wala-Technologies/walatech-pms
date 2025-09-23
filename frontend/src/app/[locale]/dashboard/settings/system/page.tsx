'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Space,
  message,
  Row,
  Col,
  Typography,
  Divider,
  InputNumber,
} from 'antd';
import {
  SaveOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../../../../lib/api-client';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface SystemSettings {
  general: {
    systemName: string;
    systemVersion: string;
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    retentionDays: number;
    backupLocation: string;
  };
  performance: {
    cacheEnabled: boolean;
    sessionTimeout: number;
    maxFileSize: number;
    compressionEnabled: boolean;
  };
}

export default function SystemSettingsPage() {
  const t = useTranslations('settings');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      setLoading(true);
      // For now, use default settings since the endpoint doesn't exist yet
      const defaultSettings: SystemSettings = {
        general: {
          systemName: 'WalaTech PMS',
          systemVersion: '1.0.0',
          maintenanceMode: false,
          debugMode: false,
        },
        email: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: '',
          smtpPassword: '',
          smtpSecure: true,
          fromEmail: 'noreply@walatech.com',
          fromName: 'WalaTech PMS',
        },
        backup: {
          autoBackup: true,
          backupFrequency: 'daily',
          retentionDays: 30,
          backupLocation: '/backups',
        },
        performance: {
          cacheEnabled: true,
          sessionTimeout: 480,
          maxFileSize: 10,
          compressionEnabled: true,
        },
      };
      
      setSettings(defaultSettings);
      form.setFieldsValue({
        ...defaultSettings.general,
        ...defaultSettings.email,
        ...defaultSettings.backup,
        ...defaultSettings.performance,
      });
    } catch (error) {
      message.error('Failed to fetch system settings');
      console.error('Error fetching system settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (values: any) => {
    try {
      setSaving(true);
      
      const updatedSettings: SystemSettings = {
        general: {
          systemName: values.systemName,
          systemVersion: values.systemVersion,
          maintenanceMode: values.maintenanceMode,
          debugMode: values.debugMode,
        },
        email: {
          smtpHost: values.smtpHost,
          smtpPort: values.smtpPort,
          smtpUser: values.smtpUser,
          smtpPassword: values.smtpPassword,
          smtpSecure: values.smtpSecure,
          fromEmail: values.fromEmail,
          fromName: values.fromName,
        },
        backup: {
          autoBackup: values.autoBackup,
          backupFrequency: values.backupFrequency,
          retentionDays: values.retentionDays,
          backupLocation: values.backupLocation,
        },
        performance: {
          cacheEnabled: values.cacheEnabled,
          sessionTimeout: values.sessionTimeout,
          maxFileSize: values.maxFileSize,
          compressionEnabled: values.compressionEnabled,
        },
      };

      // TODO: Implement actual API call when backend endpoint is ready
      // await apiClient.put('/system-settings', { settings: updatedSettings });
      
      setSettings(updatedSettings);
      message.success('System settings updated successfully');
    } catch (error: any) {
      console.error('Save settings error:', error);
      message.error('Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2} className="flex items-center gap-2">
          <SettingOutlined />
          System Settings
        </Title>
        <Text type="secondary">
          Configure system-wide settings and preferences
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveSettings}
        loading={loading}
      >
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="General Settings" className="mb-6">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="System Name"
                    name="systemName"
                    rules={[{ required: true, message: 'Please enter system name' }]}
                  >
                    <Input placeholder="Enter system name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="System Version"
                    name="systemVersion"
                    rules={[{ required: true, message: 'Please enter system version' }]}
                  >
                    <Input placeholder="Enter system version" disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Maintenance Mode"
                    name="maintenanceMode"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Debug Mode"
                    name="debugMode"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Email Configuration" className="mb-6">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="SMTP Host"
                    name="smtpHost"
                    rules={[{ required: true, message: 'Please enter SMTP host' }]}
                  >
                    <Input placeholder="smtp.gmail.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="SMTP Port"
                    name="smtpPort"
                    rules={[{ required: true, message: 'Please enter SMTP port' }]}
                  >
                    <InputNumber placeholder="587" min={1} max={65535} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="SMTP Username"
                    name="smtpUser"
                  >
                    <Input placeholder="Enter SMTP username" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="SMTP Password"
                    name="smtpPassword"
                  >
                    <Input.Password placeholder="Enter SMTP password" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="From Email"
                    name="fromEmail"
                    rules={[{ type: 'email', message: 'Please enter valid email' }]}
                  >
                    <Input placeholder="noreply@walatech.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="From Name"
                    name="fromName"
                  >
                    <Input placeholder="WalaTech PMS" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Use SSL/TLS"
                    name="smtpSecure"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Backup Settings" className="mb-6">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Auto Backup"
                    name="autoBackup"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Backup Frequency"
                    name="backupFrequency"
                  >
                    <Select placeholder="Select frequency">
                      <Option value="hourly">Hourly</Option>
                      <Option value="daily">Daily</Option>
                      <Option value="weekly">Weekly</Option>
                      <Option value="monthly">Monthly</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Retention Days"
                    name="retentionDays"
                  >
                    <InputNumber placeholder="30" min={1} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Backup Location"
                    name="backupLocation"
                  >
                    <Input placeholder="/backups" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Performance Settings" className="mb-6">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Enable Caching"
                    name="cacheEnabled"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Session Timeout (minutes)"
                    name="sessionTimeout"
                  >
                    <InputNumber placeholder="480" min={5} max={1440} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Max File Size (MB)"
                    name="maxFileSize"
                  >
                    <InputNumber placeholder="10" min={1} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Enable Compression"
                    name="compressionEnabled"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Divider />
        
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={saving}
            size="large"
          >
            Save Settings
          </Button>
          <Button
            onClick={() => form.resetFields()}
            size="large"
          >
            Reset
          </Button>
        </Space>
      </Form>
    </div>
  );
}