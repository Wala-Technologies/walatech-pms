'use client';

import { useTranslations } from 'next-intl';
import { Card, Row, Col, Statistic, Progress, Table, Badge } from 'antd';
import {
  LineChartOutlined,
  TeamOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons';

interface ProductionMetrics {
  totalProduction: number;
  activeWorkers: number;
  pendingOrders: number;
  completedOrders: number;
  efficiency: number;
  qualityRate: number;
}

interface WorkOrder {
  id: string;
  product: string;
  quantity: number;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  dueDate: string;
  progress: number;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  // Mock data - in real app, this would come from API
  const metrics: ProductionMetrics = {
    totalProduction: 1250,
    activeWorkers: 45,
    pendingOrders: 23,
    completedOrders: 187,
    efficiency: 87.5,
    qualityRate: 94.2
  };

  const recentOrders: WorkOrder[] = [
    {
      id: 'WO-001',
      product: 'Steel Frame Assembly',
      quantity: 100,
      status: 'in-progress',
      dueDate: '2024-01-15',
      progress: 65
    },
    {
      id: 'WO-002',
      product: 'Motor Housing',
      quantity: 50,
      status: 'pending',
      dueDate: '2024-01-18',
      progress: 0
    },
    {
      id: 'WO-003',
      product: 'Control Panel',
      quantity: 25,
      status: 'completed',
      dueDate: '2024-01-12',
      progress: 100
    },
    {
      id: 'WO-004',
      product: 'Conveyor Belt',
      quantity: 75,
      status: 'delayed',
      dueDate: '2024-01-10',
      progress: 30
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'processing';
      case 'pending': return 'default';
      case 'delayed': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Work Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={getStatusColor(status) as any} text={status.replace('-', ' ')} />
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Production Dashboard
        </h1>
        <p className="text-gray-600">
          Real-time overview of manufacturing operations
        </p>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Total Production"
              value={metrics.totalProduction}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix="units"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Active Workers"
              value={metrics.activeWorkers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={metrics.pendingOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Completed Orders"
              value={metrics.completedOrders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Efficiency"
              value={metrics.efficiency}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Quality Rate"
              value={metrics.qualityRate}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#eb2f96' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Work Orders */}
      <Card title="Recent Work Orders" className="mb-6">
        <Table
          columns={columns}
          dataSource={recentOrders}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Production Efficiency Chart Placeholder */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Production Efficiency Trend">
            <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
              <p className="text-gray-500">Chart will be implemented with Chart.js or similar</p>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quality Metrics">
            <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
              <p className="text-gray-500">Quality metrics visualization</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}