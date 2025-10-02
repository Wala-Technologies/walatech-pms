'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Table, 
  Tag, 
  Progress, 
  Statistic, 
  Modal, 
  Form, 
  Select, 
  Alert,
  Divider,
  Space,
  Tooltip,
  message
} from 'antd';
import { 
  CreditCardOutlined, 
  DownloadOutlined, 
  ArrowUpOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';

const { Option } = Select;

interface Subscription {
  id: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  amount: number;
  currency: string;
  users: number;
  maxUsers: number;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
  description: string;
}

interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

export default function BillingManagement() {
  const t = useTranslations('organization.billing');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockSubscription: Subscription = {
        id: 'sub_123',
        plan: 'pro',
        status: 'active',
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        amount: 99,
        currency: 'USD',
        users: 12,
        maxUsers: 25
      };

      const mockInvoices: Invoice[] = [
        {
          id: 'inv_001',
          date: '2024-01-01T00:00:00Z',
          amount: 99,
          currency: 'USD',
          status: 'paid',
          downloadUrl: '#',
          description: 'Pro Plan - January 2024'
        },
        {
          id: 'inv_002',
          date: '2023-12-01T00:00:00Z',
          amount: 99,
          currency: 'USD',
          status: 'paid',
          downloadUrl: '#',
          description: 'Pro Plan - December 2023'
        }
      ];

      setSubscription(mockSubscription);
      setInvoices(mockInvoices);
    } catch (error) {
      message.error(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      // TODO: Implement actual upgrade logic with Stripe/PayPal
      console.log('Upgrading to:', selectedPlan);
      message.success(t('messages.upgradeSuccess'));
      setUpgradeModalVisible(false);
      loadBillingData();
    } catch (error) {
      message.error(t('errors.upgradeFailed'));
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // TODO: Implement actual download logic
    message.info(t('messages.downloadStarted'));
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'default';
      case 'pro': return 'blue';
      case 'enterprise': return 'purple';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      case 'cancelled': return 'red';
      case 'past_due': return 'red';
      default: return 'default';
    }
  };

  const planFeatures: PlanFeature[] = [
    { name: 'Users', free: '3', pro: '25', enterprise: 'Unlimited' },
    { name: 'Departments', free: '2', pro: '10', enterprise: 'Unlimited' },
    { name: 'Storage', free: '1GB', pro: '100GB', enterprise: '1TB' },
    { name: 'API Calls', free: '1,000/month', pro: '50,000/month', enterprise: 'Unlimited' },
    { name: 'Support', free: 'Community', pro: 'Email', enterprise: '24/7 Phone' },
    { name: 'Advanced Analytics', free: false, pro: true, enterprise: true },
    { name: 'Custom Integrations', free: false, pro: false, enterprise: true },
    { name: 'White Label', free: false, pro: false, enterprise: true }
  ];

  const invoiceColumns = [
    {
      title: t('table.date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('table.description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('table.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Invoice) => `$${amount} ${record.currency}`,
    },
    {
      title: t('table.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag 
          color={getStatusColor(status)}
          icon={status === 'paid' ? <CheckCircleOutlined /> : status === 'failed' ? <CloseCircleOutlined /> : <InfoCircleOutlined />}
        >
          {t(`status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('table.actions'),
      key: 'actions',
      render: (_, record: Invoice) => (
        <Button 
          type="link" 
          icon={<DownloadOutlined />}
          onClick={() => handleDownloadInvoice(record)}
        >
          {t('actions.download')}
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Current Subscription */}
      <Card 
        title={
          <span className="flex items-center gap-2">
            <CreditCardOutlined />
            {t('sections.currentPlan')}
          </span>
        }
        className="mb-6"
        extra={
          <Button 
            type="primary" 
            icon={<ArrowUpOutlined />}
            onClick={() => setUpgradeModalVisible(true)}
          >
            {t('actions.upgradePlan')}
          </Button>
        }
      >
        {subscription && (
          <Row gutter={24}>
            <Col xs={24} md={6}>
              <Statistic
                title={t('stats.currentPlan')}
                value={subscription.plan.toUpperCase()}
                valueStyle={{ color: '#1890ff' }}
                prefix={<Tag color={getPlanColor(subscription.plan)}>{subscription.plan}</Tag>}
              />
            </Col>
            <Col xs={24} md={6}>
              <Statistic
                title={t('stats.monthlyBill')}
                value={subscription.amount}
                prefix="$"
                suffix={subscription.currency}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} md={6}>
              <Statistic
                title={t('stats.nextBilling')}
                value={new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                prefix={<CalendarOutlined />}
              />
            </Col>
            <Col xs={24} md={6}>
              <div>
                <div className="text-gray-500 text-sm mb-1">{t('stats.userUsage')}</div>
                <Progress 
                  percent={(subscription.users / subscription.maxUsers) * 100}
                  format={() => `${subscription.users}/${subscription.maxUsers}`}
                  strokeColor="#1890ff"
                />
              </div>
            </Col>
          </Row>
        )}
      </Card>

      {/* Plan Comparison */}
      <Card 
        title={t('sections.planComparison')}
        className="mb-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">{t('table.feature')}</th>
                <th className="text-center py-3 px-4">
                  <div className="flex flex-col items-center">
                    <Tag color="default">FREE</Tag>
                    <div className="text-2xl font-bold">$0</div>
                    <div className="text-gray-500">{t('pricing.perMonth')}</div>
                  </div>
                </th>
                <th className="text-center py-3 px-4">
                  <div className="flex flex-col items-center">
                    <Tag color="blue">PRO</Tag>
                    <div className="text-2xl font-bold">$99</div>
                    <div className="text-gray-500">{t('pricing.perMonth')}</div>
                  </div>
                </th>
                <th className="text-center py-3 px-4">
                  <div className="flex flex-col items-center">
                    <Tag color="purple">ENTERPRISE</Tag>
                    <div className="text-2xl font-bold">{t('pricing.custom')}</div>
                    <div className="text-gray-500">{t('pricing.contactUs')}</div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {planFeatures.map((feature, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4 font-medium">{t(`features.${feature.name.toLowerCase().replace(' ', '')}`)}</td>
                  <td className="text-center py-3 px-4">
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? <CheckCircleOutlined className="text-green-500" /> : <CloseCircleOutlined className="text-gray-400" />
                    ) : (
                      feature.free
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {typeof feature.pro === 'boolean' ? (
                      feature.pro ? <CheckCircleOutlined className="text-green-500" /> : <CloseCircleOutlined className="text-gray-400" />
                    ) : (
                      feature.pro
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {typeof feature.enterprise === 'boolean' ? (
                      feature.enterprise ? <CheckCircleOutlined className="text-green-500" /> : <CloseCircleOutlined className="text-gray-400" />
                    ) : (
                      feature.enterprise
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Billing History */}
      <Card 
        title={
          <span className="flex items-center gap-2">
            <DollarOutlined />
            {t('sections.billingHistory')}
          </span>
        }
      >
        <Table
          columns={invoiceColumns}
          dataSource={invoices}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>

      {/* Upgrade Modal */}
      <Modal
        title={t('modals.upgradePlan')}
        open={upgradeModalVisible}
        onOk={handleUpgrade}
        onCancel={() => setUpgradeModalVisible(false)}
        width={600}
      >
        <Alert
          message={t('alerts.upgradeInfo')}
          type="info"
          showIcon
          className="mb-4"
        />
        
        <Form layout="vertical">
          <Form.Item label={t('fields.selectPlan')}>
            <Select 
              value={selectedPlan}
              onChange={setSelectedPlan}
              placeholder={t('placeholders.selectPlan')}
            >
              <Option value="pro">Pro Plan - $99/month</Option>
              <Option value="enterprise">Enterprise Plan - Contact Sales</Option>
            </Select>
          </Form.Item>
        </Form>

        <Divider />
        
        <div className="text-sm text-gray-600">
          <p>{t('terms.upgradeTerms')}</p>
        </div>
      </Modal>
    </div>
  );
}