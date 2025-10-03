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
  Tree,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  BranchesOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Territory {
  id: string;
  territory_name: string;
  parent_territory?: string;
  territory_manager?: string;
  is_group: boolean;
  country?: string;
  state?: string;
  city?: string;
  description?: string;
  is_active: boolean;
  creation: string;
  customer_count: number;
  sales_target?: number;
  achieved_sales?: number;
}

interface TerritoryFormData {
  territory_name: string;
  parent_territory?: string;
  territory_manager?: string;
  is_group: boolean;
  country?: string;
  state?: string;
  city?: string;
  description?: string;
  is_active: boolean;
  sales_target?: number;
}

export default function TerritoriesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState<Territory | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [form] = Form.useForm();

  // Mock data for development
  const mockTerritories: Territory[] = [
    {
      id: '1',
      territory_name: 'North America',
      parent_territory: undefined,
      territory_manager: 'John Smith',
      is_group: true,
      country: 'Multiple',
      description: 'North American sales territory',
      is_active: true,
      creation: '2024-01-15T10:30:00Z',
      customer_count: 85,
      sales_target: 2000000,
      achieved_sales: 1750000,
    },
    {
      id: '2',
      territory_name: 'United States',
      parent_territory: 'North America',
      territory_manager: 'Sarah Johnson',
      is_group: true,
      country: 'United States',
      description: 'US sales territory',
      is_active: true,
      creation: '2024-01-16T11:00:00Z',
      customer_count: 65,
      sales_target: 1500000,
      achieved_sales: 1300000,
    },
    {
      id: '3',
      territory_name: 'California',
      parent_territory: 'United States',
      territory_manager: 'Mike Davis',
      is_group: false,
      country: 'United States',
      state: 'California',
      description: 'California state territory',
      is_active: true,
      creation: '2024-01-17T09:15:00Z',
      customer_count: 25,
      sales_target: 500000,
      achieved_sales: 475000,
    },
    {
      id: '4',
      territory_name: 'New York',
      parent_territory: 'United States',
      territory_manager: 'Lisa Wilson',
      is_group: false,
      country: 'United States',
      state: 'New York',
      description: 'New York state territory',
      is_active: true,
      creation: '2024-01-18T14:20:00Z',
      customer_count: 20,
      sales_target: 400000,
      achieved_sales: 380000,
    },
    {
      id: '5',
      territory_name: 'Canada',
      parent_territory: 'North America',
      territory_manager: 'Robert Brown',
      is_group: false,
      country: 'Canada',
      description: 'Canadian sales territory',
      is_active: true,
      creation: '2024-01-19T16:45:00Z',
      customer_count: 20,
      sales_target: 500000,
      achieved_sales: 450000,
    },
  ];

  useEffect(() => {
    fetchTerritories();
  }, []);

  const fetchTerritories = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setTerritories(mockTerritories);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch territories:', error);
      message.error('Failed to load territories');
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // TODO: Implement search functionality
  };

  const showModal = (territory?: Territory) => {
    setEditingTerritory(territory || null);
    setIsModalVisible(true);
    if (territory) {
      form.setFieldsValue(territory);
    } else {
      form.resetFields();
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingTerritory(null);
    form.resetFields();
  };

  const handleSubmit = async (values: TerritoryFormData) => {
    setModalLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Submitting territory:', values);
      
      setTimeout(() => {
        if (editingTerritory) {
          message.success('Territory updated successfully');
        } else {
          message.success('Territory created successfully');
        }
        setModalLoading(false);
        setIsModalVisible(false);
        setEditingTerritory(null);
        form.resetFields();
        fetchTerritories();
      }, 1000);
    } catch (error) {
      console.error('Failed to save territory:', error);
      message.error('Failed to save territory');
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      console.log('Deleting territory:', id);
      message.success('Territory deleted successfully');
      fetchTerritories();
    } catch (error) {
      console.error('Failed to delete territory:', error);
      message.error('Failed to delete territory');
    }
  };

  const columns: ColumnsType<Territory> = [
    {
      title: 'Territory',
      dataIndex: 'territory_name',
      key: 'territory_name',
      render: (text: string, record: Territory) => (
        <div className="flex items-center space-x-2">
          <EnvironmentOutlined className={record.is_group ? 'text-blue-500' : 'text-green-500'} />
          <div>
            <div className="font-medium">{text}</div>
            {record.parent_territory && (
              <div className="text-sm text-gray-500">Parent: {record.parent_territory}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Manager',
      dataIndex: 'territory_manager',
      key: 'territory_manager',
      render: (manager?: string) => (
        <div className="flex items-center space-x-2">
          <UserOutlined />
          <span>{manager || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record: Territory) => (
        <div>
          <div className="text-sm">{record.country}</div>
          {record.state && <div className="text-sm text-gray-500">{record.state}</div>}
          {record.city && <div className="text-sm text-gray-500">{record.city}</div>}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'is_group',
      key: 'is_group',
      render: (isGroup: boolean) => (
        <span className={`px-2 py-1 rounded text-xs ${
          isGroup ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {isGroup ? 'Group' : 'Territory'}
        </span>
      ),
    },
    {
      title: 'Customers',
      dataIndex: 'customer_count',
      key: 'customer_count',
      render: (count: number) => (
        <span className="font-medium">{count}</span>
      ),
    },
    {
      title: 'Sales Performance',
      key: 'performance',
      render: (_, record: Territory) => {
        if (!record.sales_target || !record.achieved_sales) return '-';
        const percentage = (record.achieved_sales / record.sales_target) * 100;
        return (
          <div>
            <div className="text-sm font-medium">
              ${record.achieved_sales.toLocaleString()} / ${record.sales_target.toLocaleString()}
            </div>
            <div className={`text-xs ${percentage >= 90 ? 'text-green-600' : percentage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
              {percentage.toFixed(1)}% achieved
            </div>
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
      render: (_, record: Territory) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this territory?"
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

  // Convert territories to tree data
  const buildTreeData = (territories: Territory[]): DataNode[] => {
    const territoryMap = new Map<string, Territory>();
    territories.forEach(t => territoryMap.set(t.territory_name, t));

    const buildNode = (territory: Territory): DataNode => ({
      title: (
        <div className="flex items-center justify-between">
          <span>{territory.territory_name}</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{territory.customer_count} customers</span>
            {territory.territory_manager && (
              <span className="text-xs text-blue-600">{territory.territory_manager}</span>
            )}
          </div>
        </div>
      ),
      key: territory.id,
      icon: <EnvironmentOutlined />,
      children: territories
        .filter(t => t.parent_territory === territory.territory_name)
        .map(buildNode),
    });

    return territories
      .filter(t => !t.parent_territory)
      .map(buildNode);
  };

  const treeData = buildTreeData(territories);

  const stats = {
    totalTerritories: territories.length,
    activeTerritories: territories.filter(t => t.is_active).length,
    totalCustomers: territories.reduce((sum, t) => sum + t.customer_count, 0),
    totalSalesTarget: territories.reduce((sum, t) => sum + (t.sales_target || 0), 0),
    totalAchievedSales: territories.reduce((sum, t) => sum + (t.achieved_sales || 0), 0),
  };

  const overallPerformance = stats.totalSalesTarget > 0 
    ? (stats.totalAchievedSales / stats.totalSalesTarget) * 100 
    : 0;

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
        <Breadcrumb.Item>Territories</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Territories</h1>
          <p className="text-gray-600">Manage sales territories and assignments</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size="large"
        >
          Add Territory
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Territories"
              value={stats.totalTerritories}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Territories"
              value={stats.activeTerritories}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={stats.totalCustomers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sales Performance"
              value={overallPerformance}
              precision={1}
              suffix="%"
              prefix={<BranchesOutlined />}
              valueStyle={{ 
                color: overallPerformance >= 90 ? '#3f8600' : overallPerformance >= 70 ? '#faad14' : '#cf1322' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <Search
            placeholder="Search territories..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ width: 400 }}
          />
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="List View" key="list">
            <Table
              columns={columns}
              dataSource={territories}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} territories`,
              }}
            />
          </TabPane>
          <TabPane tab="Hierarchy View" key="tree">
            <Tree
              showIcon
              defaultExpandAll
              treeData={treeData}
              className="territory-tree"
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal */}
      <Modal
        title={editingTerritory ? 'Edit Territory' : 'Add Territory'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            is_group: false,
            is_active: true,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="territory_name"
                label="Territory Name"
                rules={[{ required: true, message: 'Please enter territory name' }]}
              >
                <Input placeholder="Enter territory name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="parent_territory" label="Parent Territory">
                <Select placeholder="Select parent territory" allowClear>
                  {territories
                    .filter(t => t.is_group && t.id !== editingTerritory?.id)
                    .map(territory => (
                      <Option key={territory.id} value={territory.territory_name}>
                        {territory.territory_name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="territory_manager" label="Territory Manager">
                <Input placeholder="Enter manager name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sales_target" label="Sales Target">
                <Input
                  type="number"
                  placeholder="Enter sales target"
                  prefix="$"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="country" label="Country">
                <Input placeholder="Enter country" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="state" label="State/Province">
                <Input placeholder="Enter state" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="City">
                <Input placeholder="Enter city" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Enter territory description"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="is_group" valuePropName="checked" label="Is Group">
                <Switch checkedChildren="Group" unCheckedChildren="Territory" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_active" valuePropName="checked" label="Active">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={handleModalCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={modalLoading}
            >
              {editingTerritory ? 'Update' : 'Create'} Territory
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}