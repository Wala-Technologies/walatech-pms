'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Tag, Space, Typography, Alert, Progress } from 'antd';
import {
  ShopOutlined,
  UserAddOutlined,
  FileTextOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  supplierApi, 
  Supplier, 
  SupplierQuotation, 
  SupplierScorecard,
  SupplierStatus,
  SupplierType,
  QuotationStatus,
  PerformanceRating 
} from '../../../../../lib/supplier-api';

const { Title, Text } = Typography;

interface DashboardStats {
  totalSuppliers: number;
  activeSuppliers: number;
  disabledSuppliers: number;
  pendingQuotations: number;
  totalQuotations: number;
  averageRating: number;
  topPerformers: number;
}

export default function SupplierDashboard() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('suppliers');
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSuppliers: 0,
    activeSuppliers: 0,
    disabledSuppliers: 0,
    pendingQuotations: 0,
    totalQuotations: 0,
    averageRating: 0,
    topPerformers: 0,
  });
  const [recentQuotations, setRecentQuotations] = useState<SupplierQuotation[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<Supplier[]>([]);
  const [recentScorecards, setRecentScorecards] = useState<SupplierScorecard[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for development
      const mockStats: DashboardStats = {
        totalSuppliers: 25,
        activeSuppliers: 22,
        disabledSuppliers: 3,
        pendingQuotations: 8,
        totalQuotations: 45,
        averageRating: 4.2,
        topPerformers: 12,
      };

      const mockQuotations: SupplierQuotation[] = [
        {
          id: '1',
          quotationNumber: 'QUO-2024-001',
          supplierId: '1',
          supplier: {
            id: '1',
            name: 'Global Manufacturing Co.',
            code: 'GM001',
            type: 'Company' as any,
            status: 'Active' as any,
            isActive: true,
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
          },
          date: '2024-01-15T10:30:00Z',
          validUntil: '2024-02-15T10:30:00Z',
          status: QuotationStatus.SUBMITTED,
          totalAmount: 15000,
          subtotal: 15000,
          taxAmount: 0,
          currency: 'USD',
          items: [],
          notes: 'Urgent requirement for Q1 production',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-22T09:30:00Z',
        },
      ];

      const mockSuppliers: Supplier[] = [
        {
          id: '1',
          name: 'Global Manufacturing Co.',
          code: 'GM001',
          type: SupplierType.MANUFACTURER,
          status: SupplierStatus.ACTIVE,
          email: 'contact@globalmanufacturing.com',
          phone: '+1234567890',
          country: 'USA',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          name: 'Tech Solutions Ltd.',
          code: 'TS001',
          type: SupplierType.DISTRIBUTOR,
          status: SupplierStatus.ACTIVE,
          email: 'info@techsolutions.com',
          phone: '+44123456789',
          country: 'UK',
          isActive: true,
          createdAt: '2024-01-20T14:15:00Z',
          updatedAt: '2024-01-20T14:15:00Z',
        },
      ];

      const mockScorecards: SupplierScorecard[] = [
        {
          id: '1',
          supplierId: '1',
          name: 'Global Manufacturing Co.',
          evaluationDate: '2024-01-25T00:00:00Z',
          evaluationPeriod: 'Q4 2023',
          period: 'Q4 2023',
          overallScore: 4.5,
          weightedScore: 90,
          rating: PerformanceRating.EXCELLENT,
          qualityScore: 4.8,
          deliveryScore: 4.2,
          serviceScore: 4.5,
          priceScore: 4.0,
          criteria: [],
          comments: 'Excellent performance in quality and service',
          evaluatedBy: 'John Manager',
          createdAt: '2024-01-25T10:30:00Z',
          updatedAt: '2024-01-25T10:30:00Z',
        },
      ];

      setStats(mockStats);
      setRecentQuotations(mockQuotations);
      setTopSuppliers(mockSuppliers);
      setRecentScorecards(mockScorecards);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
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
      case QuotationStatus.PENDING:
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

  const quotationColumns = [
    {
      title: t('quotationNumber'),
      dataIndex: 'quotationNumber',
      key: 'quotationNumber',
    },
    {
      title: t('supplierName'),
      dataIndex: 'supplierName',
      key: 'supplierName',
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

  const supplierColumns = [
    {
      title: t('supplierName'),
      dataIndex: 'supplierName',
      key: 'supplierName',
    },
    {
      title: t('supplierCode'),
      dataIndex: 'supplierCode',
      key: 'supplierCode',
    },
    {
      title: t('supplierType'),
      dataIndex: 'supplierType',
      key: 'supplierType',
      render: (type: string) => t(`supplierTypes.${type}`),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: SupplierStatus) => (
        <Tag color={getStatusColor(status)}>
          {t(`status.${status}`)}
        </Tag>
      ),
    },
  ];

  const scorecardColumns = [
    {
      title: t('supplierName'),
      dataIndex: 'supplierName',
      key: 'supplierName',
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
      title: t('evaluationDate'),
      dataIndex: 'evaluationDate',
      key: 'evaluationDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={fetchDashboardData}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>{t('dashboard.title')}</Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('dashboard.totalSuppliers')}
              value={stats.totalSuppliers}
              prefix={<ShopOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('dashboard.activeSuppliers')}
              value={stats.activeSuppliers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('dashboard.pendingQuotations')}
              value={stats.pendingQuotations}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('dashboard.averageRating')}
              value={stats.averageRating}
              precision={1}
              prefix={<TrophyOutlined />}
              suffix="/ 5.0"
              valueStyle={{ color: getRatingColor(stats.averageRating) }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title={t('dashboard.totalQuotations')}
              value={stats.totalQuotations}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title={t('dashboard.topPerformers')}
              value={stats.topPerformers}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title={t('dashboard.disabledSuppliers')}
              value={stats.disabledSuppliers}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={t('dashboard.recentQuotations')}
            extra={
              <Link href={`/${locale}/dashboard/suppliers/quotations`}>
                <Button type="link">{t('viewAll')}</Button>
              </Link>
            }
          >
            <Table
              columns={quotationColumns}
              dataSource={recentQuotations}
              pagination={false}
              loading={loading}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={t('dashboard.topSuppliers')}
            extra={
              <Link href={`/${locale}/dashboard/suppliers`}>
                <Button type="link">{t('viewAll')}</Button>
              </Link>
            }
          >
            <Table
              columns={supplierColumns}
              dataSource={topSuppliers}
              pagination={false}
              loading={loading}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24}>
          <Card
            title={t('dashboard.recentScorecards')}
            extra={
              <Link href={`/${locale}/dashboard/suppliers/scorecards`}>
                <Button type="link">{t('viewAll')}</Button>
              </Link>
            }
          >
            <Table
              columns={scorecardColumns}
              dataSource={recentScorecards}
              pagination={false}
              loading={loading}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title={t('dashboard.quickActions')} style={{ marginTop: '16px' }}>
        <Space wrap>
          <Link href={`/${locale}/dashboard/suppliers/new`}>
            <Button type="primary" icon={<UserAddOutlined />}>
              {t('addSupplier')}
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/suppliers/groups`}>
            <Button icon={<TeamOutlined />}>
              {t('manageGroups')}
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/suppliers/quotations/new`}>
            <Button icon={<FileTextOutlined />}>
              {t('createQuotation')}
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/suppliers/scorecards`}>
            <Button icon={<BarChartOutlined />}>
              {t('viewScorecards')}
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/suppliers/reports`}>
            <Button icon={<TrophyOutlined />}>
              {t('viewReports')}
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
}