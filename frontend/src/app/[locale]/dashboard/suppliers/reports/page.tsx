'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Table,
  Statistic,
  Progress,
  Typography,
  Breadcrumb,
  Space,
  Tag,
  Divider,
} from 'antd';
import {
  DownloadOutlined,
  TruckOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  StarOutlined,
  HomeOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface SupplierPerformanceData {
  supplierId: string;
  supplierName: string;
  totalQuotations: number;
  approvedQuotations: number;
  totalValue: number;
  averageResponseTime: number; // in days
  qualityRating: number;
  deliveryRating: number;
  serviceRating: number;
  overallRating: number;
  onTimeDelivery: number; // percentage
  status: 'active' | 'inactive';
}

interface ReportSummary {
  totalSuppliers: number;
  activeSuppliers: number;
  totalQuotations: number;
  totalValue: number;
  averageRating: number;
  onTimeDeliveryRate: number;
}

export default function SupplierReportsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('suppliers');
  const tCommon = useTranslations('common');

  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('performance');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [performanceData, setPerformanceData] = useState<SupplierPerformanceData[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    if (dates) {
      setDateRange(dates);
    } else {
      setDateRange(null);
    }
  };

  // Mock data for development
  const mockPerformanceData: SupplierPerformanceData[] = [
    {
      supplierId: '1',
      supplierName: 'Steel Corp Ltd',
      totalQuotations: 25,
      approvedQuotations: 20,
      totalValue: 150000,
      averageResponseTime: 2.5,
      qualityRating: 4.5,
      deliveryRating: 4.2,
      serviceRating: 4.3,
      overallRating: 4.3,
      onTimeDelivery: 85,
      status: 'active',
    },
    {
      supplierId: '2',
      supplierName: 'Component Solutions',
      totalQuotations: 18,
      approvedQuotations: 15,
      totalValue: 95000,
      averageResponseTime: 1.8,
      qualityRating: 4.7,
      deliveryRating: 4.6,
      serviceRating: 4.5,
      overallRating: 4.6,
      onTimeDelivery: 92,
      status: 'active',
    },
    {
      supplierId: '3',
      supplierName: 'Packaging Pro',
      totalQuotations: 12,
      approvedQuotations: 10,
      totalValue: 45000,
      averageResponseTime: 3.2,
      qualityRating: 4.1,
      deliveryRating: 3.8,
      serviceRating: 4.0,
      overallRating: 4.0,
      onTimeDelivery: 78,
      status: 'active',
    },
    {
      supplierId: '4',
      supplierName: 'Industrial Supplies Inc',
      totalQuotations: 8,
      approvedQuotations: 6,
      totalValue: 32000,
      averageResponseTime: 4.1,
      qualityRating: 3.9,
      deliveryRating: 3.5,
      serviceRating: 3.7,
      overallRating: 3.7,
      onTimeDelivery: 65,
      status: 'active',
    },
    {
      supplierId: '5',
      supplierName: 'Quality Materials Co',
      totalQuotations: 15,
      approvedQuotations: 12,
      totalValue: 78000,
      averageResponseTime: 2.1,
      qualityRating: 4.4,
      deliveryRating: 4.1,
      serviceRating: 4.2,
      overallRating: 4.2,
      onTimeDelivery: 88,
      status: 'active',
    },
  ];

  const mockSummary: ReportSummary = {
    totalSuppliers: 5,
    activeSuppliers: 5,
    totalQuotations: 78,
    totalValue: 400000,
    averageRating: 4.16,
    onTimeDeliveryRate: 81.6,
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange, supplierFilter]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPerformanceData(mockPerformanceData);
      setSummary(mockSummary);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Mock export functionality
    console.log('Exporting report...');
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#52c41a';
    if (rating >= 4.0) return '#faad14';
    if (rating >= 3.5) return '#fa8c16';
    return '#f5222d';
  };

  const getDeliveryColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'normal';
    if (percentage >= 70) return 'exception';
    return 'exception';
  };

  const performanceColumns = [
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (text: string, record: SupplierPerformanceData) => (
        <div>
          <div className="font-medium">{text}</div>
          <Tag color={record.status === 'active' ? 'success' : 'default'}>
            {record.status.toUpperCase()}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Quotations',
      key: 'quotations',
      render: (_: any, record: SupplierPerformanceData) => (
        <div>
          <div>{record.approvedQuotations}/{record.totalQuotations}</div>
          <div className="text-sm text-gray-500">
            {((record.approvedQuotations / record.totalQuotations) * 100).toFixed(1)}% approved
          </div>
        </div>
      ),
    },
    {
      title: 'Total Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Response Time',
      dataIndex: 'averageResponseTime',
      key: 'averageResponseTime',
      render: (days: number) => `${days} days`,
    },
    {
      title: 'Overall Rating',
      dataIndex: 'overallRating',
      key: 'overallRating',
      render: (rating: number) => (
        <div className="flex items-center">
          <StarOutlined style={{ color: getRatingColor(rating), marginRight: 4 }} />
          <span style={{ color: getRatingColor(rating), fontWeight: 'bold' }}>
            {rating.toFixed(1)}
          </span>
        </div>
      ),
    },
    {
      title: 'On-Time Delivery',
      dataIndex: 'onTimeDelivery',
      key: 'onTimeDelivery',
      render: (percentage: number) => (
        <Progress
          percent={percentage}
          size="small"
          status={getDeliveryColor(percentage)}
          format={(percent) => `${percent}%`}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item>
            <Link href={`/${locale}/dashboard`}>
              <HomeOutlined /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href={`/${locale}/dashboard/suppliers`}>
              <TruckOutlined /> Suppliers
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Reports</Breadcrumb.Item>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="mb-2">Supplier Reports</Title>
            <Text type="secondary">Analytics and insights about supplier performance</Text>
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: '100%' }}
            >
              <Option value="performance">Performance Overview</Option>
              <Option value="quotations">Quotation Analysis</Option>
              <Option value="financial">Financial Summary</Option>
              <Option value="delivery">Delivery Performance</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Select
              value={supplierFilter}
              onChange={setSupplierFilter}
              style={{ width: '100%' }}
              placeholder="Filter by supplier"
            >
              <Option value="all">All Suppliers</Option>
              <Option value="active">Active Only</Option>
              <Option value="top_performers">Top Performers</Option>
              <Option value="needs_attention">Needs Attention</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      {summary && (
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={8} md={4}>
            <Card>
              <Statistic
                title="Total Suppliers"
                value={summary.totalSuppliers}
                prefix={<TruckOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Card>
              <Statistic
                title="Active Suppliers"
                value={summary.activeSuppliers}
                prefix={<TruckOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Card>
              <Statistic
                title="Total Quotations"
                value={summary.totalQuotations}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Card>
              <Statistic
                title="Total Value"
                value={summary.totalValue}
                prefix={<DollarOutlined />}
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Card>
              <Statistic
                title="Avg Rating"
                value={summary.averageRating}
                precision={2}
                prefix={<StarOutlined />}
                suffix="/ 5"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Card>
              <Statistic
                title="On-Time Delivery"
                value={summary.onTimeDeliveryRate}
                precision={1}
                prefix={<ClockCircleOutlined />}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Performance Analysis */}
      <Card title="Supplier Performance Analysis" className="mb-6">
        <Table
          columns={performanceColumns}
          dataSource={performanceData}
          loading={loading}
          rowKey="supplierId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} suppliers`,
          }}
        />
      </Card>

      {/* Detailed Metrics */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Top Performing Suppliers" className="mb-6">
            <Space direction="vertical" style={{ width: '100%' }}>
              {performanceData
                .sort((a, b) => b.overallRating - a.overallRating)
                .slice(0, 5)
                .map((supplier, index) => (
                  <div key={supplier.supplierId} className="flex justify-between items-center">
                    <div>
                      <Text strong>#{index + 1} {supplier.supplierName}</Text>
                      <div className="text-sm text-gray-500">
                        Rating: {supplier.overallRating.toFixed(1)}/5
                      </div>
                    </div>
                    <Progress
                      type="circle"
                      size={50}
                      percent={supplier.overallRating * 20}
                      format={() => supplier.overallRating.toFixed(1)}
                    />
                  </div>
                ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Delivery Performance" className="mb-6">
            <Space direction="vertical" style={{ width: '100%' }}>
              {performanceData
                .sort((a, b) => b.onTimeDelivery - a.onTimeDelivery)
                .slice(0, 5)
                .map((supplier, index) => (
                  <div key={supplier.supplierId} className="flex justify-between items-center">
                    <div>
                      <Text strong>#{index + 1} {supplier.supplierName}</Text>
                      <div className="text-sm text-gray-500">
                        On-time: {supplier.onTimeDelivery}%
                      </div>
                    </div>
                    <Progress
                      percent={supplier.onTimeDelivery}
                      size="small"
                      status={getDeliveryColor(supplier.onTimeDelivery)}
                    />
                  </div>
                ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Response Time Analysis */}
      <Card title="Response Time Analysis">
        <Row gutter={16}>
          {performanceData.map((supplier) => (
            <Col xs={24} sm={12} md={8} lg={6} key={supplier.supplierId} className="mb-4">
              <Card size="small">
                <Statistic
                  title={supplier.supplierName}
                  value={supplier.averageResponseTime}
                  precision={1}
                  suffix="days"
                  valueStyle={{
                    color: supplier.averageResponseTime <= 2 ? '#3f8600' : 
                           supplier.averageResponseTime <= 3 ? '#faad14' : '#cf1322'
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}