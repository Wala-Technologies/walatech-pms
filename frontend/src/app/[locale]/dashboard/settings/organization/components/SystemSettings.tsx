'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Switch, 
  Select, 
  Button, 
  Progress, 
  Alert, 
  Table, 
  Tag, 
  Modal, 
  Input,
  Row,
  Col,
  Statistic,
  message
} from 'antd';
import { 
  DatabaseOutlined, 
  CloudDownloadOutlined, 
  SettingOutlined, 
  HistoryOutlined,
  SaveOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';

const { Option } = Select;

interface SystemSettings {
  autoBackup: boolean;
  backupFrequency: string;
  backupRetention: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  dataRetention: {
    logs: number;
    analytics: number;
    deletedRecords: number;
  };
  notifications: {
    systemAlerts: boolean;
    backupAlerts: boolean;
    maintenanceAlerts: boolean;
  };
}

interface BackupRecord {
  id: string;
  type: 'manual' | 'automatic';
  size: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'in_progress';
  downloadUrl?: string;
}

export default function SystemSettings() {
  const t = useTranslations('organization.system');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [backupProgress, setBackupProgress] = useState(0);

  useEffect(() => {
    loadSystemSettings();
    loadBackupHistory();
  }, []);

  const loadSystemSettings = async () => {
    try {
      setLoading(true);
      // Get tenant settings from API
      const response = await fetch('/api/tenant-settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      
      const tenantSettings = await response.json();
      
      // Map tenant settings to system settings format
      const systemSettings: SystemSettings = {
        autoBackup: tenantSettings.features?.enableBackup ?? true,
        backupFrequency: tenantSettings.backup?.frequency ?? 'daily',
        backupRetention: tenantSettings.backup?.retention ?? 30,
        maintenanceMode: tenantSettings.maintenance?.enabled ?? false,
        maintenanceMessage: tenantSettings.maintenance?.message ?? 'System maintenance in progress. Please try again later.',
        dataRetention: {
          logs: tenantSettings.dataRetention?.logs ?? 90,
          analytics: tenantSettings.dataRetention?.analytics ?? 365,
          deletedRecords: tenantSettings.dataRetention?.deletedRecords ?? 30
        },
        notifications: {
          systemAlerts: tenantSettings.notifications?.emailNotifications ?? true,
          backupAlerts: tenantSettings.notifications?.backupAlerts ?? true,
          maintenanceAlerts: tenantSettings.notifications?.maintenanceAlerts ?? false
        }
      };
      
      setSettings(systemSettings);
      form.setFieldsValue(systemSettings);
    } catch (error) {
      console.error('Error loading system settings:', error);
      message.error(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadBackupHistory = async () => {
    try {
      // Mock data - replace with actual API call
      const mockBackups: BackupRecord[] = [
        {
          id: '1',
          type: 'automatic',
          size: '2.4 GB',
          createdAt: '2024-01-15T02:00:00Z',
          status: 'completed',
          downloadUrl: '/api/backups/1/download'
        },
        {
          id: '2',
          type: 'manual',
          size: '2.3 GB',
          createdAt: '2024-01-14T10:30:00Z',
          status: 'completed',
          downloadUrl: '/api/backups/2/download'
        },
        {
          id: '3',
          type: 'automatic',
          size: '2.2 GB',
          createdAt: '2024-01-14T02:00:00Z',
          status: 'completed',
          downloadUrl: '/api/backups/3/download'
        },
        {
          id: '4',
          type: 'automatic',
          size: '-',
          createdAt: '2024-01-13T02:00:00Z',
          status: 'failed'
        }
      ];
      
      setBackups(mockBackups);
    } catch (error) {
      message.error(t('errors.loadBackupsFailed'));
    }
  };

  const handleSave = async (values: SystemSettings) => {
    try {
      setLoading(true);
      
      // Map system settings to tenant settings format
      const tenantSettingsUpdate = {
        settings: {
          features: {
            enableBackup: values.autoBackup
          },
          backup: {
            frequency: values.backupFrequency,
            retention: values.backupRetention
          },
          maintenance: {
            enabled: values.maintenanceMode,
            message: values.maintenanceMessage
          },
          dataRetention: {
            logs: values.dataRetention.logs,
            analytics: values.dataRetention.analytics,
            deletedRecords: values.dataRetention.deletedRecords
          },
          notifications: {
            emailNotifications: values.notifications.systemAlerts,
            backupAlerts: values.notifications.backupAlerts,
            maintenanceAlerts: values.notifications.maintenanceAlerts
          }
        }
      };
      
      const response = await fetch('/api/tenant-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tenantSettingsUpdate)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      const updatedSettings = await response.json();
      console.log('System settings saved successfully:', updatedSettings);
      
      message.success(t('messages.saveSuccess'));
      setSettings(values);
    } catch (error) {
      console.error('Error saving system settings:', error);
      message.error(t('errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleManualBackup = async () => {
    try {
      setBackupLoading(true);
      setBackupProgress(0);
      
      // Simulate backup progress
      const interval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBackup: BackupRecord = {
        id: Date.now().toString(),
        type: 'manual',
        size: '2.5 GB',
        createdAt: new Date().toISOString(),
        status: 'completed',
        downloadUrl: `/api/backups/${Date.now()}/download`
      };
      
      setBackups(prev => [newBackup, ...prev]);
      message.success(t('messages.backupSuccess'));
    } catch (error) {
      message.error(t('errors.backupFailed'));
    } finally {
      setBackupLoading(false);
      setBackupProgress(0);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      // TODO: Replace with actual API call
      console.log('Deleting backup:', backupId);
      
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
      message.success(t('messages.backupDeleted'));
    } catch (error) {
      message.error(t('errors.deleteFailed'));
    }
  };

  const backupColumns = [
    {
      title: t('backup.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'manual' ? 'blue' : 'green'}>
          {t(`backup.${type}`)}
        </Tag>
      ),
    },
    {
      title: t('backup.size'),
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: t('backup.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: t('backup.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag 
          color={status === 'completed' ? 'green' : status === 'failed' ? 'red' : 'orange'}
          icon={status === 'completed' ? <CheckCircleOutlined /> : status === 'failed' ? <ExclamationCircleOutlined /> : undefined}
        >
          {t(`backup.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('table.actions'),
      key: 'actions',
      render: (record: BackupRecord) => (
        <div className="flex gap-2">
          {record.status === 'completed' && record.downloadUrl && (
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => {
                // TODO: Implement download
                message.info(t('messages.downloadStarted'));
              }}
            >
              {t('actions.download')}
            </Button>
          )}
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: t('confirm.deleteBackup'),
                onOk: () => handleDeleteBackup(record.id)
              });
            }}
          >
            {t('actions.delete')}
          </Button>
        </div>
      ),
    },
  ];

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

        {/* Backup Settings */}
        <Card 
          title={
            <span className="flex items-center gap-2">
              <DatabaseOutlined />
              {t('sections.backup')}
            </span>
          }
          className="mb-6"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="autoBackup"
                label={t('fields.autoBackup')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="backupFrequency"
                label={t('fields.backupFrequency')}
              >
                <Select>
                  <Option value="hourly">{t('frequency.hourly')}</Option>
                  <Option value="daily">{t('frequency.daily')}</Option>
                  <Option value="weekly">{t('frequency.weekly')}</Option>
                  <Option value="monthly">{t('frequency.monthly')}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="backupRetention"
                label={t('fields.backupRetention')}
                help={t('help.backupRetention')}
              >
                <Select>
                  <Option value={7}>7 {t('time.days')}</Option>
                  <Option value={14}>14 {t('time.days')}</Option>
                  <Option value={30}>30 {t('time.days')}</Option>
                  <Option value={90}>90 {t('time.days')}</Option>
                  <Option value={365}>1 {t('time.year')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{t('backup.manual')}</span>
              <Button 
                type="primary" 
                icon={<CloudDownloadOutlined />}
                loading={backupLoading}
                onClick={handleManualBackup}
              >
                {t('actions.createBackup')}
              </Button>
            </div>
            {backupLoading && (
              <Progress percent={backupProgress} status="active" />
            )}
          </div>
        </Card>

        {/* Data Retention */}
        <Card 
          title={
            <span className="flex items-center gap-2">
              <HistoryOutlined />
              {t('sections.dataRetention')}
            </span>
          }
          className="mb-6"
        >
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name={['dataRetention', 'logs']}
                label={t('fields.logsRetention')}
              >
                <Select>
                  <Option value={30}>30 {t('time.days')}</Option>
                  <Option value={60}>60 {t('time.days')}</Option>
                  <Option value={90}>90 {t('time.days')}</Option>
                  <Option value={180}>180 {t('time.days')}</Option>
                  <Option value={365}>1 {t('time.year')}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name={['dataRetention', 'analytics']}
                label={t('fields.analyticsRetention')}
              >
                <Select>
                  <Option value={90}>90 {t('time.days')}</Option>
                  <Option value={180}>180 {t('time.days')}</Option>
                  <Option value={365}>1 {t('time.year')}</Option>
                  <Option value={730}>2 {t('time.years')}</Option>
                  <Option value={-1}>{t('retention.forever')}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name={['dataRetention', 'deletedRecords']}
                label={t('fields.deletedRecordsRetention')}
              >
                <Select>
                  <Option value={7}>7 {t('time.days')}</Option>
                  <Option value={14}>14 {t('time.days')}</Option>
                  <Option value={30}>30 {t('time.days')}</Option>
                  <Option value={90}>90 {t('time.days')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Maintenance Mode */}
        <Card 
          title={
            <span className="flex items-center gap-2">
              <SettingOutlined />
              {t('sections.maintenance')}
            </span>
          }
          className="mb-6"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="maintenanceMode"
                label={t('fields.maintenanceMode')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="maintenanceMessage"
                label={t('fields.maintenanceMessage')}
                help={t('help.maintenanceMessage')}
              >
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
          
          <Alert
            message={t('alerts.maintenanceWarning')}
            type="warning"
            showIcon
          />
        </Card>

        {/* System Notifications */}
        <Card 
          title={t('sections.notifications')}
          className="mb-6"
        >
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name={['notifications', 'systemAlerts']}
                label={t('fields.systemAlerts')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name={['notifications', 'backupAlerts']}
                label={t('fields.backupAlerts')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name={['notifications', 'maintenanceAlerts']}
                label={t('fields.maintenanceAlerts')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

      </Form>

      {/* Backup History */}
      <Card 
        title={t('sections.backupHistory')}
      >
        <Table
          columns={backupColumns}
          dataSource={backups}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}