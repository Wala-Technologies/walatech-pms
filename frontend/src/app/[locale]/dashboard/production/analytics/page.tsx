'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Select,
  DatePicker,
  Space,
  Tag,
  Tooltip,
  Alert,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { apiClient, apiConfig } from '../../../../../config/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ProductionMetrics {
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  overdueOrders: number;
  totalWorkOrders: number;
  completedWorkOrders: number;
  totalTasks: number;
  completedTasks: number;
  averageCompletionTime: number;
  onTimeDeliveryRate: number;
  productionEfficiency: number;
  totalCost: number;
  averageCostPerOrder: number;
  resourceUtilization: number;
}

interface TrendData {
  period: string;
  ordersCompleted: number;
  efficiency: number;
  cost: number;
  onTimeDelivery: number;
}

interface TopPerformer {
  id: string;
  name: string;
  completedTasks: number;
  efficiency: number;
  onTimeRate: number;
}

interface ProductPerformance {
  productName: string;
  totalOrders: number;
  completedOrders: number;
  averageTime: number;
  efficiency: number;
  revenue: number;
}

export default function ProductionAnalyticsPage() {
  const t = useTranslations('analytics');
  const [metrics, setMetrics] = useState<ProductionMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        period,
      };

      // Fetch metrics
      const metricsResponse = await apiClient.get(apiConfig.endpoints.production.analytics.metrics, params);
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      // Fetch trend data
      const trendResponse = await apiClient.get(apiConfig.endpoints.production.analytics.trends, params);
      if (trendResponse.ok) {
        const trendData = await trendResponse.json();
        setTrendData(trendData);
      }

      // Fetch top performers
      const performersResponse = await apiClient.get(apiConfig.endpoints.production.analytics.topPerformers, params);
      if (performersResponse.ok) {
        const performersData = await performersResponse.json();
        setTopPerformers(performersData);
      }

      // Fetch product performance
      const productResponse = await apiClient.get(apiConfig.endpoints.production.analytics.productPerformance, params);
      if (productResponse.ok) {
        const productData = await productResponse.json();
        setProductPerformance(productData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return '#52c41a';
    if (efficiency >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    } else if (current < previous) {
      return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
    }
    return null;
  };

  const performerColumns = [
    {
      title: t('employee'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('completedTasks'),
      dataIndex: 'completedTasks',
      key: 'completedTasks',
      sorter: (a: TopPerformer, b: TopPerformer) => a.completedTasks - b.completedTasks,
    },
    {
      title: t('efficiency'),
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency: number) => (
        <div>
          <Progress 
            percent={efficiency} 
            size="small" 
            strokeColor={getEfficiencyColor(efficiency)}
            showInfo={false}
          />
          <span style={{ color: getEfficiencyColor(efficiency) }}>{efficiency}%</span>
        </div>
      ),
      sorter: (a: TopPerformer, b: TopPerformer) => a.efficiency - b.efficiency,
    },
    {
      title: t('onTimeRate'),
      dataIndex: 'onTimeRate',
      key: 'onTimeRate',
      render: (rate: number) => (
        <Tag color={rate >= 90 ? 'green' : rate >= 70 ? 'orange' : 'red'}>
          {rate}%
        </Tag>
      ),
      sorter: (a: TopPerformer, b: TopPerformer) => a.onTimeRate - b.onTimeRate,
    },
  ];

  const productColumns = [
    {
      title: t('product'),
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: t('totalOrders'),
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      sorter: (a: ProductPerformance, b: ProductPerformance) => a.totalOrders - b.totalOrders,
    },
    {
      title: t('completionRate'),
      key: 'completionRate',
      render: (record: ProductPerformance) => {
        const rate = getCompletionRate(record.completedOrders, record.totalOrders);
        return (
          <div>
            <Progress 
              percent={rate} 
              size="small" 
              strokeColor={getEfficiencyColor(rate)}
              showInfo={false}
            />
            <span>{rate}%</span>
          </div>
        );
      },
      sorter: (a: ProductPerformance, b: ProductPerformance) => 
        getCompletionRate(a.completedOrders, a.totalOrders) - getCompletionRate(b.completedOrders, b.totalOrders),
    },
    {
      title: t('averageTime'),
      dataIndex: 'averageTime',
      key: 'averageTime',
      render: (time: number) => `${time.toFixed(1)}h`,
      sorter: (a: ProductPerformance, b: ProductPerformance) => a.averageTime - b.averageTime,
    },
    {
      title: t('efficiency'),
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency: number) => (
        <Tag color={getEfficiencyColor(efficiency) === '#52c41a' ? 'green' : getEfficiencyColor(efficiency) === '#faad14' ? 'orange' : 'red'}>
          {efficiency}%
        </Tag>
      ),
      sorter: (a: ProductPerformance, b: ProductPerformance) => a.efficiency - b.efficiency,
    },
    {
      title: t('revenue'),
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => `$${revenue.toLocaleString()}`,
      sorter: (a: ProductPerformance, b: ProductPerformance) => a.revenue - b.revenue,
    },
  ];

  const trendColumns = [
    {
      title: t('period'),
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: t('ordersCompleted'),
      dataIndex: 'ordersCompleted',
      key: 'ordersCompleted',
    },
    {
      title: t('efficiency'),
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency: number) => `${efficiency}%`,
    },
    {
      title: t('cost'),
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => `$${cost.toLocaleString()}`,
    },
    {
      title: t('onTimeDelivery'),
      dataIndex: 'onTimeDelivery',
      key: 'onTimeDelivery',
      render: (rate: number) => `${rate}%`,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{t('productionAnalytics')}</h2>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              format="YYYY-MM-DD"
            />
            <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
              <Option value="daily">{t('daily')}</Option>
              <Option value="weekly">{t('weekly')}</Option>
              <Option value="monthly">{t('monthly')}</Option>
            </Select>
          </Space>
        </div>
      </Card>

      {/* Key Metrics */}
      {metrics && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('totalOrders')}
                value={metrics.totalOrders}
                prefix={<CalendarOutlined />}
                suffix={
                  <Tooltip title={t('completionRate')}>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      ({getCompletionRate(metrics.completedOrders, metrics.totalOrders)}%)
                    </span>
                  </Tooltip>
                }
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('productionEfficiency')}
                value={metrics.productionEfficiency}
                precision={1}
                suffix="%"
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: getEfficiencyColor(metrics.productionEfficiency) }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('onTimeDelivery')}
                value={metrics.onTimeDeliveryRate}
                precision={1}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: getEfficiencyColor(metrics.onTimeDeliveryRate) }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('averageCompletionTime')}
                value={metrics.averageCompletionTime}
                precision={1}
                suffix="h"
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Secondary Metrics */}
      {metrics && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('overdueOrders')}
                value={metrics.overdueOrders}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: metrics.overdueOrders > 0 ? '#ff4d4f' : '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('totalCost')}
                value={metrics.totalCost}
                prefix={<DollarOutlined />}
                formatter={(value) => `$${value?.toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('averageCostPerOrder')}
                value={metrics.averageCostPerOrder}
                prefix={<DollarOutlined />}
                formatter={(value) => `$${value?.toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('resourceUtilization')}
                value={metrics.resourceUtilization}
                precision={1}
                suffix="%"
                prefix={<TeamOutlined />}
                valueStyle={{ color: getEfficiencyColor(metrics.resourceUtilization) }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Alerts */}
      {metrics && metrics.overdueOrders > 0 && (
        <Alert
          message={t('overdueAlert')}
          description={t('overdueAlertDescription', { count: metrics.overdueOrders })}
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {metrics && metrics.productionEfficiency < 70 && (
        <Alert
          message={t('efficiencyAlert')}
          description={t('efficiencyAlertDescription', { efficiency: metrics.productionEfficiency })}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Row gutter={16}>
        {/* Trend Analysis */}
        <Col span={12}>
          <Card title={t('trendAnalysis')} style={{ marginBottom: '24px' }}>
            <Table
              columns={trendColumns}
              dataSource={trendData}
              rowKey="period"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Top Performers */}
        <Col span={12}>
          <Card title={t('topPerformers')} style={{ marginBottom: '24px' }}>
            <Table
              columns={performerColumns}
              dataSource={topPerformers}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Product Performance */}
      <Card title={t('productPerformance')}>
        <Table
          columns={productColumns}
          dataSource={productPerformance}
          rowKey="productName"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
}