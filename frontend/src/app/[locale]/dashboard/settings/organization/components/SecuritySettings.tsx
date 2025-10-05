'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Switch, 
  InputNumber, 
  Select, 
  Button, 
  Alert, 
  Divider,
  Row,
  Col,
  Table,
  Tag,
  message
} from 'antd';
import { 
  SecurityScanOutlined, 
  SafetyOutlined, 
  LockOutlined, 
  ClockCircleOutlined,
  SaveOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';

const { Option } = Select;

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };
  loginAttempts: {
    maxAttempts: number;
    lockoutDuration: number;
  };
  ipWhitelist: string[];
}

export default function SecuritySettings() {
  const t = useTranslations('organization.security');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockSettings: SecuritySettings = {
        twoFactorEnabled: true,
        sessionTimeout: 240, // 4 hours in minutes
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          expirationDays: 90
        },
        loginAttempts: {
          maxAttempts: 5,
          lockoutDuration: 30
        },
        ipWhitelist: []
      };
      
      setSettings(mockSettings);
      form.setFieldsValue(mockSettings);
    } catch (error) {
      message.error(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: SecuritySettings) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      console.log('Saving security settings:', values);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success(t('messages.saveSuccess'));
      setSettings(values);
    } catch (error) {
      message.error(t('errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={settings || {}}
      >
        {/* Save Button */}
        <div className="flex justify-end mb-6">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
          >
            {t('actions.save')}
          </Button>
        </div>

        {/* Two-Factor Authentication */}
        <Card 
          title={
            <span className="flex items-center gap-2">
              <SafetyOutlined />
              {t('sections.twoFactor')}
            </span>
          }
          className="mb-6"
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="twoFactorEnabled"
                label={t('fields.enable2FA')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Alert
                message={t('alerts.2faInfo')}
                type="info"
                showIcon
                className="mt-2"
              />
            </Col>
          </Row>
        </Card>

        {/* Session Management */}
        <Card 
          title={
            <span className="flex items-center gap-2">
              <ClockCircleOutlined />
              {t('sections.sessionManagement')}
            </span>
          }
          className="mb-6"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="sessionTimeout"
                label={t('fields.sessionTimeout')}
                help={t('help.sessionTimeout')}
              >
                <Select>
                  <Option value={15}>15 {t('time.minutes')}</Option>
                  <Option value={30}>30 {t('time.minutes')}</Option>
                  <Option value={60}>1 {t('time.hour')}</Option>
                  <Option value={120}>2 {t('time.hours')}</Option>
                  <Option value={240}>4 {t('time.hours')}</Option>
                  <Option value={480}>8 {t('time.hours')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Password Policy */}
        <Card 
          title={
            <span className="flex items-center gap-2">
              <LockOutlined />
              {t('sections.passwordPolicy')}
            </span>
          }
          className="mb-6"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name={['passwordPolicy', 'minLength']}
                label={t('fields.minLength')}
              >
                <InputNumber min={6} max={32} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name={['passwordPolicy', 'expirationDays']}
                label={t('fields.expirationDays')}
              >
                <InputNumber min={30} max={365} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name={['passwordPolicy', 'requireUppercase']}
                label={t('fields.requireUppercase')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name={['passwordPolicy', 'requireLowercase']}
                label={t('fields.requireLowercase')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name={['passwordPolicy', 'requireNumbers']}
                label={t('fields.requireNumbers')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name={['passwordPolicy', 'requireSpecialChars']}
                label={t('fields.requireSpecialChars')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Login Security */}
        <Card 
          title={
            <span className="flex items-center gap-2">
              <SecurityScanOutlined />
              {t('sections.loginSecurity')}
            </span>
          }
          className="mb-6"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name={['loginAttempts', 'maxAttempts']}
                label={t('fields.maxAttempts')}
                help={t('help.maxAttempts')}
              >
                <InputNumber min={3} max={10} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name={['loginAttempts', 'lockoutDuration']}
                label={t('fields.lockoutDuration')}
                help={t('help.lockoutDuration')}
              >
                <InputNumber min={5} max={120} addonAfter={t('time.minutes')} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

      </Form>
    </div>
  );
}