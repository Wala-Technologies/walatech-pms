'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Button,
  Table,
  Progress,
  Space,
  Breadcrumb,
  Divider,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  DownloadOutlined,
  HomeOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface CustomerReport {
  id: string;
  customer_name: string;
  customer_type: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  average_order_value: number;
  status: string;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  customersByType: { type: string; count: number; percentage: number }[];
  customersByCountry: { country: string; count: number; percentage: number }[];
  topCustomers: CustomerReport[];
}

export default function CustomerReportsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState<any>(null);

  // Mock data for development
  const mockStats: CustomerStats = {
    totalCustomers: 150,
    activeCustomers: 120,
    newCustomers: 25,
    totalRevenue: 2500000,
    averageOrderValue: 1250,
    customersByType: [
      { type: 'Company', count: 90, percentage: 60 },
      { type: 'Individual', count: 60, percentage: 40 },
    ],
    customersByCountry: [
      { country: 'USA', count: 75, percentage: 50 },
      { country: 'Canada', count: 30, percentage: 20 },
      { country: 'UK', count: 25, percentage: 16.7 },
      { country: 'Germany', count: 20, percentage: 13.3 },
    ],
    topCustomers: [
      {
        id: '1',
        customer_name: 'Acme Corporation',
        customer_type: 'Company',
        total_orders: 45,
        total_spent: 125000,
        last_order_date: '2024-01-20',
        average_order_value: 2778,
        status: 'Active',
      },
      {
        id: '2',
        customer_name: 'Global Tech Solutions',
        customer_type: 'Company',
        total_orders: 38,
        total_spent: 98000,
        last_order_date: '2024-01-18',
        average_order_value: 2579,
        status: 'Active',
      },
      {
        id: '3',
        customer_name: 'Innovation Labs',
        customer_type: 'Company',
        total_orders: 32,
        total_spent: 87500,
        last_order_date: '2024-01-15',
        average_order_value: 2734,
        status: 'Active',
      },
    ],
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setStats(mockStats);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting report...');
  };

  const topCustomersColumns: ColumnsType<CustomerReport> = [
    {
      title: 'Rank',
      key: 'rank',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Customer Name',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Type',
      dataIndex: 'customer_type',
      key: 'customer_type',
      render: (type: string) => (
        <span className={`px-2 py-1 rounded text-xs ${
          type === 'Company' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {type}
        </span>
      ),
    },
    {
      title: 'Total Orders',
      dataIndex: 'total_orders',
      key: 'total_orders',
      align: 'right',
    },
    {
      title: 'Total Spent',
      dataIndex: 'total_spent',
      key: 'total_spent',
      align: 'right',
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: 'Avg Order Value',
      dataIndex: 'average_order_value',
      key: 'average_order_value',
      align: 'right',
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: 'Last Order',
      dataIndex: 'last_order_date',
      key: 'last_order_date',
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <span 
              className="cursor-pointer text-blue-600 hover:text-blue-800"
              onClick={() => router.push(`/${locale}/dashboard/customers`)}
            >
              Customers
            </span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Reports</Breadcrumb.Item>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Reports</h1>
            <p className="text-gray-600">Analytics and insights about your customers</p>
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
              <Option value="overview">Overview</Option>
              <Option value="sales">Sales Performance</Option>
              <Option value="geographic">Geographic Distribution</Option>
              <Option value="trends">Customer Trends</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<BarChartOutlined />}
              onClick={fetchReportData}
              loading={loading}
            >
              Generate Report
            </Button>
          </Col>
        </Row>
      </Card>

      {stats && (
        <>
          {/* Key Metrics */}
          <Row gutter={16} className="mb-6">
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Customers"
                  value={stats.totalCustomers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Customers"
                  value={stats.activeCustomers}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="New This Month"
                  value={stats.newCustomers}
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={stats.totalRevenue}
                  prefix={<DollarOutlined />}
                  formatter={(value) => `$${value?.toLocaleString()}`}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} className="mb-6">
            <Col span={12}>
              {/* Customer Distribution by Type */}
              <Card title="Customer Distribution by Type" className="h-full">
                <div className="space-y-4">
                  {stats.customersByType.map((item) => (
                    <div key={item.type}>
                      <div className="flex justify-between mb-2">
                        <span className="flex items-center">
                          {item.type === 'Company' ? <TeamOutlined className="mr-2" /> : <UserOutlined className="mr-2" />}
                          {item.type}
                        </span>
                        <span className="font-medium">{item.count} ({item.percentage}%)</span>
                      </div>
                      <Progress
                        percent={item.percentage}
                        strokeColor={item.type === 'Company' ? '#1890ff' : '#52c41a'}
                        showInfo={false}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            <Col span={12}>
              {/* Customer Distribution by Country */}
              <Card title="Customer Distribution by Country" className="h-full">
                <div className="space-y-4">
                  {stats.customersByCountry.map((item) => (
                    <div key={item.country}>
                      <div className="flex justify-between mb-2">
                        <span>{item.country}</span>
                        <span className="font-medium">{item.count} ({item.percentage}%)</span>
                      </div>
                      <Progress
                        percent={item.percentage}
                        strokeColor="#722ed1"
                        showInfo={false}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Additional Metrics */}
          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <Card>
                <Statistic
                  title="Average Order Value"
                  value={stats.averageOrderValue}
                  prefix={<ShoppingCartOutlined />}
                  formatter={(value) => `$${value?.toLocaleString()}`}
                  precision={2}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Customer Retention Rate"
                  value={85.5}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Customer Acquisition Cost"
                  value={125}
                  prefix={<DollarOutlined />}
                  formatter={(value) => `$${value}`}
                />
              </Card>
            </Col>
          </Row>

          {/* Top Customers Table */}
          <Card title="Top Customers by Revenue" className="mb-6">
            <Table
              columns={topCustomersColumns}
              dataSource={stats.topCustomers}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>

          {/* Customer Lifecycle Analysis */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Customer Lifecycle Distribution">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>New Customers (0-3 months)</span>
                      <span className="font-medium">25 (16.7%)</span>
                    </div>
                    <Progress percent={16.7} strokeColor="#52c41a" showInfo={false} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Growing Customers (3-12 months)</span>
                      <span className="font-medium">45 (30%)</span>
                    </div>
                    <Progress percent={30} strokeColor="#1890ff" showInfo={false} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Mature Customers (1-3 years)</span>
                      <span className="font-medium">60 (40%)</span>
                    </div>
                    <Progress percent={40} strokeColor="#722ed1" showInfo={false} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Loyal Customers (3+ years)</span>
                      <span className="font-medium">20 (13.3%)</span>
                    </div>
                    <Progress percent={13.3} strokeColor="#fa8c16" showInfo={false} />
                  </div>
                </div>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Customer Health Score">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-green-600">Excellent (90-100)</span>
                      <span className="font-medium">35 customers</span>
                    </div>
                    <Progress percent={23.3} strokeColor="#52c41a" showInfo={false} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-blue-600">Good (70-89)</span>
                      <span className="font-medium">60 customers</span>
                    </div>
                    <Progress percent={40} strokeColor="#1890ff" showInfo={false} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-orange-600">Fair (50-69)</span>
                      <span className="font-medium">40 customers</span>
                    </div>
                    <Progress percent={26.7} strokeColor="#fa8c16" showInfo={false} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-red-600">Poor (0-49)</span>
                      <span className="font-medium">15 customers</span>
                    </div>
                    <Progress percent={10} strokeColor="#ff4d4f" showInfo={false} />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}