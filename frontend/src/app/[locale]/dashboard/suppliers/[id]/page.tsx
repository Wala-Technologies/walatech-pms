'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Button,
  Breadcrumb,
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Space,
  Spin,
  Alert,
  Tabs,
  Table,
  Statistic,
  Progress,
  Modal,
  message,
  Dropdown,
} from 'antd';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  ShopOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  BankOutlined,
  FileTextOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import type { MenuProps } from 'antd';
import { 
  supplierApi, 
  Supplier, 
  SupplierStatus, 
  SupplierType,
  SupplierQuotation,
  SupplierScorecard,
  QuotationStatus,
  PerformanceRating
} from '../../../../../lib/supplier-api';

const { TabPane } = Tabs;

// Mock data interfaces
interface MockSupplier extends Supplier {
  name: string;
  code: string;
  type: SupplierType;
  status: SupplierStatus;
  email?: string;
  phone?: string;
  website?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Complete MockQuotation with all required properties
interface MockQuotation extends SupplierQuotation {
  id: string;
  quotationNumber: string;
  date: string;
  totalAmount: number;
  status: QuotationStatus;
  validUntil: string;
  supplierId: string;
  items: any[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  currency: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Complete MockScorecard with all required properties
interface MockScorecard extends SupplierScorecard {
  id: string;
  supplierId: string;
  period: string;
  overallScore: number;
  rating: PerformanceRating;
  criteria: any; // Use proper type if available
  weightedScore: number;
  createdAt: string;
  updatedAt: string;
}

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const supplierId = params.id as string;
  const t = useTranslations('suppliers');
  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [quotations, setQuotations] = useState<SupplierQuotation[]>([]);
  const [scorecards, setScorecards] = useState<SupplierScorecard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSupplierData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supplierResp = await supplierApi.getSupplier(supplierId);
      setSupplier(supplierResp.data || null);
      // Optional: fetch quotations and scorecards if needed when backend supports
      try {
        const quotationsResp = await supplierApi.getQuotations({ supplierId });
        setQuotations(quotationsResp.data?.quotations || []);
      } catch {}
      try {
        const scorecardsResp = await supplierApi.getScorecards({ supplierId });
        setScorecards(scorecardsResp.data?.scorecards || []);
      } catch {}
    } catch (err) {
      console.error('Error fetching supplier data:', err);
      setError(t('messages.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [supplierId, t]);

  useEffect(() => {
    fetchSupplierData();
  }, [fetchSupplierData]);

  const handleStatusChange = useCallback(async (newStatus: SupplierStatus) => {
    try {
      setActionLoading(true);
      if (newStatus === SupplierStatus.ACTIVE) {
        const resp = await supplierApi.activateSupplier(supplierId);
        setSupplier(resp.data || null);
      } else if (newStatus === SupplierStatus.DISABLED) {
        const resp = await supplierApi.deactivateSupplier(supplierId);
        setSupplier(resp.data || null);
      }
      
      message.success(t('messages.statusUpdateSuccess'));
    } catch (error) {
      console.error('Error updating supplier status:', error);
      message.error(t('messages.statusUpdateError'));
    } finally {
      setActionLoading(false);
    }
  }, [t, supplierId]);

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await supplierApi.deleteSupplier(supplierId);
      
      message.success(t('messages.deleteSuccess'));
      router.push(`/${locale}/dashboard/suppliers/list`);
    } catch (error) {
      console.error('Error deleting supplier:', error);
      message.error(t('messages.deleteError'));
    } finally {
      setActionLoading(false);
      setDeleteModalVisible(false);
    }
  };

  const getStatusColor = (status: SupplierStatus) => {
    switch (status) {
      case SupplierStatus.ACTIVE:
        return 'green';
      case SupplierStatus.DISABLED:
        return 'red';
      default:
        return 'default';
    }
  };

  const getQuotationStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.SUBMITTED:
        return 'orange';
      case QuotationStatus.APPROVED:
        return 'green';
      case QuotationStatus.REJECTED:
        return 'red';
      case QuotationStatus.EXPIRED:
        return 'gray';
      default:
        return 'default';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.0) return '#52c41a';
    if (rating >= 3.0) return '#faad14';
    if (rating >= 2.0) return '#fa8c16';
    return '#f5222d';
  };

  // Helper function to get rating display text
  const getRatingText = (rating: any) => {
    if (typeof rating === 'string') return rating;
    return String(rating);
  };

  const actionMenuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: t('edit'),
      icon: <EditOutlined />,
      onClick: () => router.push(`/${locale}/dashboard/suppliers/${supplierId}/edit`),
    },
    {
      type: 'divider',
    },
    {
      key: 'activate',
      label: t('activate'),
      icon: <CheckCircleOutlined />,
      disabled: supplier?.status === SupplierStatus.ACTIVE,
      onClick: () => handleStatusChange(SupplierStatus.ACTIVE),
    },
    {
      key: 'disable',
      label: t('disable'),
      icon: <StopOutlined />,
      disabled: supplier?.status === SupplierStatus.DISABLED,
      onClick: () => handleStatusChange(SupplierStatus.DISABLED),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: t('delete'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => setDeleteModalVisible(true),
    },
  ];

  const quotationColumns = [
    {
      title: t('quotationNumber'),
      dataIndex: 'quotationNumber',
      key: 'quotationNumber',
    },
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('totalAmount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: t('statusLabel'),
      dataIndex: 'status',
      key: 'status',
      render: (status: QuotationStatus) => (
        <Tag color={getQuotationStatusColor(status)}>
          {t(`status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('validUntil'),
      dataIndex: 'validUntil',
      key: 'validUntil',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const scorecardColumns = [
    {
      title: t('period'),
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: t('overallScore'),
      dataIndex: 'overallScore',
      key: 'overallScore',
      render: (score: number) => (
        <Space>
          <Progress
            type="circle"
            size={40}
            percent={score * 20}
            strokeColor={getRatingColor(score)}
            format={() => score.toFixed(1)}
          />
        </Space>
      ),
    },
    {
      title: t('rating'),
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: any) => getRatingText(rating),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message={t('error')}
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchSupplierData}>
              {t('retry')}
            </Button>
          }
        />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message={t('notFound')}
          description={t('supplierNotFound')}
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => router.push(`/${locale}/dashboard/suppliers/list`)}>
              {t('backToList')}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: '16px' }}
        >
          <Link href={`/${locale}/dashboard`}>
            <HomeOutlined /> {t('dashboard')}
          </Link>
        </Button>

        <Breadcrumb
          items={[
            {
              href: `/${locale}/dashboard`,
              title: (
                <>
                  <HomeOutlined /> {t('dashboard')}
                </>
              ),
            },
            {
              href: `/${locale}/dashboard/suppliers`,
              title: (
                <>
                  <ShopOutlined /> {t('suppliers')}
                </>
              ),
            },
            {
              title: supplier.name,
            },
          ]}
          style={{ marginBottom: '16px' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
              {supplier.name}
            </h1>
            <Space style={{ marginTop: '8px' }}>
              <Tag color={getStatusColor(supplier.status)}>
                {t(`status.${supplier.status}`)}
              </Tag>
              <Tag>{t(`supplierTypes.${supplier.type}`)}</Tag>
              <span style={{ color: '#666' }}>{supplier.code}</span>
            </Space>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/${locale}/dashboard/suppliers/${supplierId}/edit`)}
            >
              {t('edit')}
            </Button>
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button icon={<MoreOutlined />} loading={actionLoading} />
            </Dropdown>
          </Space>
        </div>

      {/* Content */}
      <Tabs defaultActiveKey="overview">
        <TabPane tab={t('overview')} key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title={t('basicInformation')} style={{ marginBottom: 16 }}>
                <Descriptions column={2}>
                  <Descriptions.Item label={t('supplierName')}>
                    {supplier.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('supplierCode')}>
                    {supplier.code}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('supplierType')}>
                    {t(`supplierTypes.${supplier.type}`)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('statusLabel')}>
                    <Tag color={getStatusColor(supplier.status)}>
                      {t(`status.${supplier.status}`)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={t('country')}>
                    {supplier.country}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('createdAt')}>
                    {new Date(supplier.createdAt).toLocaleDateString()}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title={t('contactInformation')}>
                <Descriptions column={1}>
                  {supplier.email && (
                    <Descriptions.Item label={t('email')}>
                      <Space>
                        <MailOutlined />
                        <a href={`mailto:${supplier.email}`}>{supplier.email}</a>
                      </Space>
                    </Descriptions.Item>
                  )}
                  {supplier.phone && (
                    <Descriptions.Item label={t('phone')}>
                      <Space>
                        <PhoneOutlined />
                        <a href={`tel:${supplier.phone}`}>{supplier.phone}</a>
                      </Space>
                    </Descriptions.Item>
                  )}
                  {supplier.website && (
                    <Descriptions.Item label={t('website')}>
                      <Space>
                        <GlobalOutlined />
                        <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                          {supplier.website}
                        </a>
                      </Space>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card title={t('statistics')} style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Statistic
                      title={t('totalQuotations')}
                      value={quotations.length}
                      prefix={<FileTextOutlined />}
                    />
                  </Col>
                  <Col span={24}>
                    <Statistic
                      title={t('averageRating')}
                      value={scorecards.length > 0 ? scorecards[0].overallScore : 0}
                      precision={1}
                      suffix="/ 5.0"
                      prefix={<TrophyOutlined />}
                      valueStyle={{ color: getRatingColor(scorecards.length > 0 ? scorecards[0].overallScore : 0) }}
                    />
                  </Col>
                </Row>
              </Card>

              <Card title={t('quickActions')}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    block
                    icon={<FileTextOutlined />}
                    onClick={() => router.push(`/${locale}/dashboard/suppliers/quotations/new?supplierId=${supplierId}`)}
                  >
                    {t('createQuotation')}
                  </Button>
                  <Button
                    block
                    icon={<TrophyOutlined />}
                    onClick={() => router.push(`/${locale}/dashboard/suppliers/scorecards/new?supplierId=${supplierId}`)}
                  >
                    {t('addScorecard')}
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={t('quotations')} key="quotations">
          <Card>
            <Table
              columns={quotationColumns}
              dataSource={quotations}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab={t('scorecards')} key="scorecards">
          <Card>
            <Table
              columns={scorecardColumns}
              dataSource={scorecards}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Modal
        title={t('confirmDelete')}
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        confirmLoading={actionLoading}
        okText={t('delete')}
        cancelText={t('cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('deleteConfirmMessage', { name: supplier.name })}</p>
        <Alert
          message={t('deleteWarning')}
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Modal>
    </div>
  );
}