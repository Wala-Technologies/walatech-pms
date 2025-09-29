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
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  HomeOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface CustomerGroup {
  id: string;
  group_name: string;
  parent_group?: string;
  is_group: boolean;
  default_price_list?: string;
  default_payment_terms?: string;
  credit_limit?: number;
  description?: string;
  is_active: boolean;
  creation: string;
  customer_count: number;
}

interface CustomerGroupFormData {
  group_name: string;
  parent_group?: string;
  is_group: boolean;
  default_price_list?: string;
  default_payment_terms?: string;
  credit_limit?: number;
  description?: string;
  is_active: boolean;
}

export default function CustomerGroupsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  // Mock data for development
  const mockGroups: CustomerGroup[] = [
    {
      id: '1',
      group_name: 'Enterprise Customers',
      parent_group: undefined,
      is_group: true,
      default_price_list: 'Enterprise Pricing',
      default_payment_terms: 'Net 30',
      credit_limit: 100000,
      description: 'Large enterprise customers with special pricing',
      is_active: true,
      creation: '2024-01-15T10:30:00Z',
      customer_count: 25,
    },
    {
      id: '2',
      group_name: 'SMB Customers',
      parent_group: undefined,
      is_group: true,
      default_price_list: 'Standard Pricing',
      default_payment_terms: 'Net 15',
      credit_limit: 25000,
      description: 'Small and medium business customers',
      is_active: true,
      creation: '2024-01-16T11:00:00Z',
      customer_count: 45,
    },
    {
      id: '3',
      group_name: 'Retail Customers',
      parent_group: undefined,
      is_group: true,
      default_price_list: 'Retail Pricing',
      default_payment_terms: 'Immediate',
      credit_limit: 5000,
      description: 'Individual retail customers',
      is_active: true,
      creation: '2024-01-17T09:15:00Z',
      customer_count: 120,
    },
    {
      id: '4',
      group_name: 'VIP Enterprise',
      parent_group: 'Enterprise Customers',
      is_group: false,
      default_price_list: 'VIP Pricing',
      default_payment_terms: 'Net 45',
      credit_limit: 500000,
      description: 'Top tier enterprise customers',
      is_active: true,
      creation: '2024-01-18T14:20:00Z',
      customer_count: 8,
    },
  ];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setGroups(mockGroups);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch customer groups:', error);
      message.error('Failed to load customer groups');
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // TODO: Implement search functionality
  };

  const showModal = (group?: CustomerGroup) => {
    setEditingGroup(group || null);
    setIsModalVisible(true);
    if (group) {
      form.setFieldsValue(group);
    } else {
      form.resetFields();
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingGroup(null);
    form.resetFields();
  };

  const handleSubmit = async (values: CustomerGroupFormData) => {
    setModalLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Submitting customer group:', values);
      
      setTimeout(() => {
        if (editingGroup) {
          message.success('Customer group updated successfully');
        } else {
          message.success('Customer group created successfully');
        }
        setModalLoading(false);
        setIsModalVisible(false);
        setEditingGroup(null);
        form.resetFields();
        fetchGroups();
      }, 1000);
    } catch (error) {
      console.error('Failed to save customer group:', error);
      message.error('Failed to save customer group');
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      console.log('Deleting customer group:', id);
      message.success('Customer group deleted successfully');
      fetchGroups();
    } catch (error) {
      console.error('Failed to delete customer group:', error);
      message.error('Failed to delete customer group');
    }
  };

  const columns: ColumnsType<CustomerGroup> = [
    {
      title: 'Group Name',
      dataIndex: 'group_name',
      key: 'group_name',
      render: (text: string, record: CustomerGroup) => (
        <div className="flex items-center space-x-2">
          <TeamOutlined className={record.is_group ? 'text-blue-500' : 'text-green-500'} />
          <div>
            <div className="font-medium">{text}</div>
            {record.parent_group && (
              <div className="text-sm text-gray-500">Parent: {record.parent_group}</div>
            )}
          </div>
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
          {isGroup ? 'Group' : 'Leaf'}
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
      title: 'Credit Limit',
      dataIndex: 'credit_limit',
      key: 'credit_limit',
      render: (limit?: number) => limit ? `$${limit.toLocaleString()}` : '-',
    },
    {
      title: 'Payment Terms',
      dataIndex: 'default_payment_terms',
      key: 'default_payment_terms',
      render: (terms?: string) => terms || '-',
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
      render: (_, record: CustomerGroup) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this customer group?"
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
    totalGroups: groups.length,
    activeGroups: groups.filter(g => g.is_active).length,
    totalCustomers: groups.reduce((sum, g) => sum + g.customer_count, 0),
    groupTypes: groups.filter(g => g.is_group).length,
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
        <Breadcrumb.Item>Customer Groups</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Groups</h1>
          <p className="text-gray-600">Manage customer groups and hierarchies</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size="large"
        >
          Add Customer Group
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Groups"
              value={stats.totalGroups}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Groups"
              value={stats.activeGroups}
              prefix={<UsergroupAddOutlined />}
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
              title="Group Types"
              value={stats.groupTypes}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <Search
            placeholder="Search customer groups..."
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
          dataSource={groups}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} groups`,
          }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={editingGroup ? 'Edit Customer Group' : 'Add Customer Group'}
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
            is_group: true,
            is_active: true,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="group_name"
                label="Group Name"
                rules={[{ required: true, message: 'Please enter group name' }]}
              >
                <Input placeholder="Enter group name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="parent_group" label="Parent Group">
                <Select placeholder="Select parent group" allowClear>
                  {groups
                    .filter(g => g.is_group && g.id !== editingGroup?.id)
                    .map(group => (
                      <Option key={group.id} value={group.group_name}>
                        {group.group_name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="default_price_list" label="Default Price List">
                <Input placeholder="Enter default price list" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="default_payment_terms" label="Default Payment Terms">
                <Select placeholder="Select payment terms" allowClear>
                  <Option value="Immediate">Immediate</Option>
                  <Option value="Net 15">Net 15</Option>
                  <Option value="Net 30">Net 30</Option>
                  <Option value="Net 45">Net 45</Option>
                  <Option value="Net 60">Net 60</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="credit_limit" label="Credit Limit">
            <Input
              type="number"
              placeholder="Enter credit limit"
              prefix="$"
            />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Enter group description"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="is_group" valuePropName="checked" label="Is Group">
                <Switch checkedChildren="Group" unCheckedChildren="Leaf" />
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
              {editingGroup ? 'Update' : 'Create'} Group
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}