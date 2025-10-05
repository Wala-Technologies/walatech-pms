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
      
      // Mock data for development
      const mockSupplier: MockSupplier = {
        id: supplierId,
        name: 'Global Manufacturing Co.',
        code: 'GM001',
        type: SupplierType.MANUFACTURER,
        status: SupplierStatus.ACTIVE,
        email: 'contact@globalmanufacturing.com',
        phone: '+1234567890',
        website: 'https://globalmanufacturing.com',
        country: 'USA',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      };

      const mockQuotations: MockQuotation[] = [
        {
          id: '1',
          quotationNumber: 'QT-001',
          date: '2024-01-20T00:00:00Z',
          totalAmount: 15000,
          status: QuotationStatus.APPROVED,
          validUntil: '2024-02-20T00:00:00Z',
          supplierId: supplierId,
          items: [
            {
              id: 'item-1',
              productName: 'Steel Beams',
              quantity: 100,
              unitPrice: 150,
              totalPrice: 15000
            }
          ],
          subtotal: 15000,
          taxAmount: 1500,
          taxRate: 0.1,
          currency: 'USD',
          notes: 'Bulk order discount applied',
          createdBy: 'user-123',
          createdAt: '2024-01-20T00:00:00Z',
          updatedAt: '2024-01-20T00:00:00Z',
        },
        {
          id: '2',
          quotationNumber: 'QT-002',
          date: '2024-01-25T00:00:00Z',
          totalAmount: 22000,
          status: QuotationStatus.SUBMITTED,
          validUntil: '2024-02-25T00:00:00Z',
          supplierId: supplierId,
          items: [
            {
              id: 'item-2',
              productName: 'Aluminum Sheets',
              quantity: 200,
              unitPrice: 110,
              totalPrice: 22000
            }
          ],
          subtotal: 22000,
          taxAmount: 2200,
          taxRate: 0.1,
          currency: 'USD',
          notes: 'Urgent delivery requested',
          createdBy: 'user-123',
          createdAt: '2024-01-25T00:00:00Z',
          updatedAt: '2024-01-25T00:00:00Z',
        },
      ];

      // Complete mock scorecards with all required properties
      const mockScorecards: MockScorecard[] = [
        {
          id: '1',
          name: 'testname',
          evaluationDate: '2024-04-01T00:00:00Z',
          evaluationPeriod: 'Q2-2024',
          evaluatedBy: 'James Dobsen',
          comments: 'No comment',
          supplierId: supplierId,
          period: 'Q1 2024',
          overallScore: 4.2,
          deliveryScore: 4.0,
          qualityScore: 4.1,
          serviceScore: 4.1,
          priceScore: 4.1,
          rating: PerformanceRating.EXCELLENT,
          criteria: {
            quality: 4.5,
            delivery: 4.0,
            price: 4.1,
            service: 4.3
          },
          weightedScore: 4.2,
          createdAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'testname',
          evaluationDate: '2024-04-01T00:00:00Z',
          evaluationPeriod: 'Q2-2024',
          evaluatedBy: 'James Dobsen',
          comments: 'No comment',
          supplierId: supplierId,
          period: 'Q4 2023',
          overallScore: 3.8,
          qualityScore: 4.1,
          serviceScore: 4.1,
           deliveryScore: 4.0,
            priceScore: 4.1,
         rating: PerformanceRating.GOOD,
          criteria: {
            quality: 4.0,
            delivery: 3.5,
            price: 3.9,
            service: 3.8
          },
          weightedScore: 3.8,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSupplier(mockSupplier);
      setQuotations(mockQuotations);
      setScorecards(mockScorecards);
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
      
      // Mock API call
      console.log('Changing supplier status to:', newStatus);
      setSupplier(prev => prev ? { ...prev, status: newStatus } : null);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success(t('messages.statusUpdateSuccess'));
    } catch (error) {
      console.error('Error updating supplier status:', error);
      message.error(t('messages.statusUpdateError'));
    } finally {
      setActionLoading(false);
    }
  }, [t]);

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      
      // Mock API call
      console.log('Deleting supplier:', supplierId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      title: t('status'),
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
          {t('back')}
        </Button>
        
        <Breadcrumb style={{ marginBottom: '16px' }}>
          <Breadcrumb.Item>
            <Link href={`/${locale}/dashboard`}>
              <HomeOutlined /> {t('dashboard')}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href={`/${locale}/dashboard/suppliers`}>
              <ShopOutlined /> {t('suppliers')}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {supplier.name}
          </Breadcrumb.Item>
        </Breadcrumb>
        
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
                  <Descriptions.Item label={t('status')}>
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