'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip,
  Popconfirm,
  Breadcrumb,
  Form,
  Select,
  Switch,
  Tag,
  Progress,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PieChartOutlined,
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  AimOutlined,
  TrophyOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface MarketSegment {
  id: string;
  segment_name: string;
  description?: string;
  segment_type: 'demographic' | 'geographic' | 'behavioral' | 'psychographic';
  criteria: string[];
  customer_count: number;
  revenue_contribution: number;
  growth_rate: number;
  priority: 'high' | 'medium' | 'low';
  is_active: boolean;
  creation: string;
  target_revenue?: number;
  achieved_revenue?: number;
}

interface MarketSegmentFormData {
  segment_name: string;
  description?: string;
  segment_type: 'demographic' | 'geographic' | 'behavioral' | 'psychographic';
  criteria: string[];
  priority: 'high' | 'medium' | 'low';
  is_active: boolean;
  target_revenue?: number;
}

export default function MarketSegmentsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [segments, setSegments] = useState<MarketSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSegment, setEditingSegment] = useState<MarketSegment | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  // Mock data for development
  const mockSegments: MarketSegment[] = [
    {
      id: '1',
      segment_name: 'Enterprise Clients',
      description: 'Large corporations with 500+ employees',
      segment_type: 'demographic',
      criteria: ['Company Size: 500+ employees', 'Annual Revenue: $50M+', 'Industry: Technology'],
      customer_count: 45,
      revenue_contribution: 65.5,
      growth_rate: 12.3,
      priority: 'high',
      is_active: true,
      creation: '2024-01-15T10:30:00Z',
      target_revenue: 2000000,
      achieved_revenue: 1850000,
    },
    {
      id: '2',
      segment_name: 'SMB Technology',
      description: 'Small to medium tech businesses',
      segment_type: 'demographic',
      criteria: ['Company Size: 10-500 employees', 'Industry: Technology', 'Growth Stage: Scaling'],
      customer_count: 120,
      revenue_contribution: 25.8,
      growth_rate: 18.7,
      priority: 'high',
      is_active: true,
      creation: '2024-01-16T11:00:00Z',
      target_revenue: 800000,
      achieved_revenue: 750000,
    },
    {
      id: '3',
      segment_name: 'West Coast',
      description: 'Customers located on the US West Coast',
      segment_type: 'geographic',
      criteria: ['Location: California, Oregon, Washington', 'Market: US West Coast'],
      customer_count: 85,
      revenue_contribution: 35.2,
      growth_rate: 8.9,
      priority: 'medium',
      is_active: true,
      creation: '2024-01-17T09:15:00Z',
      target_revenue: 1200000,
      achieved_revenue: 1100000,
    },
    {
      id: '4',
      segment_name: 'Early Adopters',
      description: 'Customers who adopt new technologies quickly',
      segment_type: 'behavioral',
      criteria: ['Purchase Behavior: Early adopter', 'Technology Adoption: High', 'Innovation Index: Top 20%'],
      customer_count: 35,
      revenue_contribution: 15.3,
      growth_rate: 22.1,
      priority: 'medium',
      is_active: true,
      creation: '2024-01-18T14:20:00Z',
      target_revenue: 500000,
      achieved_revenue: 480000,
    },
    {
      id: '5',
      segment_name: 'Cost-Conscious',
      description: 'Price-sensitive customers seeking value',
      segment_type: 'psychographic',
      criteria: ['Price Sensitivity: High', 'Value Orientation: Cost-focused', 'Decision Factor: Price'],
      customer_count: 95,
      revenue_contribution: 18.7,
      growth_rate: 5.2,
      priority: 'low',
      is_active: true,
      creation: '2024-01-19T16:45:00Z',
      target_revenue: 600000,
      achieved_revenue: 580000,
    },
  ];

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setSegments(mockSegments);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch market segments:', error);
      message.error('Failed to load market segments');
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // TODO: Implement search functionality
  };

  const showModal = (segment?: MarketSegment) => {
    setEditingSegment(segment || null);
    setIsModalVisible(true);
    if (segment) {
      form.setFieldsValue(segment);
    } else {
      form.resetFields();
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingSegment(null);
    form.resetFields();
  };

  const handleSubmit = async (values: MarketSegmentFormData) => {
    setModalLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Submitting market segment:', values);
      
      setTimeout(() => {
        if (editingSegment) {
          message.success('Market segment updated successfully');
        } else {
          message.success('Market segment created successfully');
        }
        setModalLoading(false);
        setIsModalVisible(false);
        setEditingSegment(null);
        form.resetFields();
        fetchSegments();
      }, 1000);
    } catch (error) {
      console.error('Failed to save market segment:', error);
      message.error('Failed to save market segment');
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      console.log('Deleting market segment:', id);
      message.success('Market segment deleted successfully');
      fetchSegments();
    } catch (error) {
      console.error('Failed to delete market segment:', error);
      message.error('Failed to delete market segment');
    }
  };

  const getSegmentTypeColor = (type: string) => {
    const colors = {
      demographic: 'blue',
      geographic: 'green',
      behavioral: 'orange',
      psychographic: 'purple',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'green',
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const columns: ColumnsType<MarketSegment> = [
    {
      title: 'Segment',
      dataIndex: 'segment_name',
      key: 'segment_name',
      render: (text: string, record: MarketSegment) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
          <div className="mt-1">
            <Tag color={getSegmentTypeColor(record.segment_type)}>
              {record.segment_type.charAt(0).toUpperCase() + record.segment_type.slice(1)}
            </Tag>
            <Tag color={getPriorityColor(record.priority)}>
              {record.priority.toUpperCase()} Priority
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Criteria',
      dataIndex: 'criteria',
      key: 'criteria',
      render: (criteria: string[]) => (
        <div>
          {criteria.slice(0, 2).map((criterion, index) => (
            <div key={index} className="text-sm text-gray-600">
              • {criterion}
            </div>
          ))}
          {criteria.length > 2 && (
            <div className="text-sm text-blue-600">
              +{criteria.length - 2} more
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Customers',
      dataIndex: 'customer_count',
      key: 'customer_count',
      render: (count: number) => (
        <div className="flex items-center space-x-2">
          <UserOutlined />
          <span className="font-medium">{count}</span>
        </div>
      ),
    },
    {
      title: 'Revenue Share',
      dataIndex: 'revenue_contribution',
      key: 'revenue_contribution',
      render: (contribution: number) => (
        <div>
          <div className="font-medium">{contribution.toFixed(1)}%</div>
          <Progress
            percent={contribution}
            size="small"
            showInfo={false}
            strokeColor={contribution > 30 ? '#52c41a' : contribution > 15 ? '#faad14' : '#ff4d4f'}
          />
        </div>
      ),
    },
    {
      title: 'Growth Rate',
      dataIndex: 'growth_rate',
      key: 'growth_rate',
      render: (rate: number) => (
        <div className={`flex items-center space-x-1 ${
          rate > 15 ? 'text-green-600' : rate > 5 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          <RiseOutlined />
          <span className="font-medium">{rate.toFixed(1)}%</span>
        </div>
      ),
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_, record: MarketSegment) => {
        if (!record.target_revenue || !record.achieved_revenue) return '-';
        const percentage = (record.achieved_revenue / record.target_revenue) * 100;
        return (
          <div>
            <div className="text-sm font-medium">
              ${(record.achieved_revenue / 1000).toFixed(0)}K / ${(record.target_revenue / 1000).toFixed(0)}K
            </div>
            <Progress
              percent={percentage}
              size="small"
              format={(percent) => `${percent?.toFixed(0)}%`}
              strokeColor={percentage >= 90 ? '#52c41a' : percentage >= 70 ? '#faad14' : '#ff4d4f'}
            />
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <span className={`px-2 py-1 rounded text-xs ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: MarketSegment) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this market segment?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    totalSegments: segments.length,
    activeSegments: segments.filter(s => s.is_active).length,
    totalCustomers: segments.reduce((sum, s) => sum + s.customer_count, 0),
    avgGrowthRate: segments.reduce((sum, s) => sum + s.growth_rate, 0) / segments.length,
    highPrioritySegments: segments.filter(s => s.priority === 'high').length,
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <span>Dashboard</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <span>Customers</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Market Segments</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Market Segments</h1>
          <p className="text-gray-600">Manage customer segmentation and targeting strategies</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size="large"
        >
          Add Segment
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={5}>
          <Card>
            <Statistic
              title="Total Segments"
              value={stats.totalSegments}
              prefix={<PieChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Active Segments"
              value={stats.activeSegments}
              prefix={<AimOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Total Customers"
              value={stats.totalCustomers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Avg Growth"
              value={stats.avgGrowthRate}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="High Priority"
              value={stats.highPrioritySegments}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <Search
            placeholder="Search market segments..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ width: 400 }}
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={segments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} segments`,
          }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={editingSegment ? 'Edit Market Segment' : 'Add Market Segment'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            segment_type: 'demographic',
            priority: 'medium',
            is_active: true,
            criteria: [],
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="segment_name"
                label="Segment Name"
                rules={[{ required: true, message: 'Please enter segment name' }]}
              >
                <Input placeholder="Enter segment name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="segment_type"
                label="Segment Type"
                rules={[{ required: true, message: 'Please select segment type' }]}
              >
                <Select placeholder="Select segment type">
                  <Option value="demographic">Demographic</Option>
                  <Option value="geographic">Geographic</Option>
                  <Option value="behavioral">Behavioral</Option>
                  <Option value="psychographic">Psychographic</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Enter segment description"
            />
          </Form.Item>

          <Form.Item
            name="criteria"
            label="Segmentation Criteria"
            rules={[{ required: true, message: 'Please add at least one criterion' }]}
          >
            <Select
              mode="tags"
              placeholder="Add criteria (press Enter to add)"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select placeholder="Select priority">
                  <Option value="high">High</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="low">Low</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="target_revenue" label="Target Revenue">
                <Input
                  type="number"
                  placeholder="Enter target revenue"
                  prefix="$"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="is_active" valuePropName="checked" label="Active">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Divider />

          <div className="flex justify-end space-x-2">
            <Button onClick={handleModalCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={modalLoading}
            >
              {editingSegment ? 'Update' : 'Create'} Segment
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}