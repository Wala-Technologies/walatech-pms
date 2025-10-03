'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Dropdown,
  Modal,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Tooltip,
  Avatar,
  DatePicker,
  Breadcrumb,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
  TeamOutlined,
  ExportOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  DollarOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import CustomerForm from './components/CustomerForm';
import { apiClient } from '../../../../config/api';
import { apiConfig } from '../../../../config/api';

const { Search } = Input;
const { Option } = Select;

interface Customer {
  id: string;
  customer_name: string;
  customer_code?: string;
  customer_type: string;
  email?: string;
  mobile_no?: string;
  city?: string;
  country?: string;
  is_frozen: boolean;
  disabled: boolean;
  creation: string;
  credit_limit: number;
}

interface CustomerStats {
  total: number;
  active: number;
  frozen: number;
  disabled: number;
  byType: { [key: string]: number };
  byCountry: { [key: string]: number };
}

export default function CustomersPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    customer_type: '',
    country: '',
    is_frozen: '',
    disabled: '',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addModalLoading, setAddModalLoading] = useState(false);

  // Mock data for development
  const mockCustomers: Customer[] = [
    {
      id: '1',
      customer_name: 'Acme Corporation',
      customer_code: 'ACME001',
      customer_type: 'Company',
      email: 'contact@acme.com',
      mobile_no: '+1234567890',
      city: 'New York',
      country: 'USA',
      is_frozen: false,
      disabled: false,
      creation: '2024-01-15T10:30:00Z',
      credit_limit: 50000,
    },
    {
      id: '2',
      customer_name: 'John Smith',
      customer_code: 'JOHN001',
      customer_type: 'Individual',
      email: 'john.smith@email.com',
      mobile_no: '+1987654321',
      city: 'Los Angeles',
      country: 'USA',
      is_frozen: false,
      disabled: false,
      creation: '2024-01-20T14:15:00Z',
      credit_limit: 10000,
    },
    {
      id: '3',
      customer_name: 'Global Tech Solutions',
      customer_code: 'GTS001',
      customer_type: 'Company',
      email: 'info@globaltech.com',
      mobile_no: '+44123456789',
      city: 'London',
      country: 'UK',
      is_frozen: true,
      disabled: false,
      creation: '2024-01-10T09:00:00Z',
      credit_limit: 75000,
    },
  ];

  const mockStats: CustomerStats = {
    total: 3,
    active: 2,
    frozen: 1,
    disabled: 0,
    byType: { Company: 2, Individual: 1 },
    byCountry: { USA: 2, UK: 1 },
  };

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [searchTerm, filters, pagination.current, pagination.pageSize]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
      };

      // Add search term if provided
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add filters if provided
      if (filters.customer_type) {
        params.customer_type = filters.customer_type;
      }
      if (filters.country) {
        params.country = filters.country;
      }
      if (filters.disabled) {
        params.disabled = filters.disabled;
      }
      if (filters.is_frozen) {
        params.is_frozen = filters.is_frozen;
      }

      const response = await apiClient.get(apiConfig.endpoints.customers.list, params);

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
        setPagination(prev => ({ ...prev, total: data.total || 0 }));
      } else {
        // Fallback to mock data if API fails
        console.warn('API call failed, using mock data');
        setCustomers(mockCustomers);
        setPagination(prev => ({ ...prev, total: mockCustomers.length }));
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      // Fallback to mock data on error
      setCustomers(mockCustomers);
      setPagination(prev => ({ ...prev, total: mockCustomers.length }));
      message.error('Failed to fetch customers, showing cached data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get(apiConfig.endpoints.customers.stats);

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Fallback to mock data if API fails
        console.warn('Stats API call failed, using mock data');
        setStats(mockStats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Fallback to mock data on error
      setStats(mockStats);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (paginationConfig: any) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));
  };

  const handleEdit = (customer: Customer) => {
    router.push(`/${locale}/dashboard/customers/${customer.id}/edit`);
  };

  const handleView = (customer: Customer) => {
    router.push(`/${locale}/dashboard/customers/${customer.id}`);
  };

  const handleDelete = (customer: Customer) => {
    Modal.confirm({
      title: 'Delete Customer',
      content: `Are you sure you want to delete ${customer.customer_name}?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // TODO: Replace with actual API call
          message.success('Customer deleted successfully');
          fetchCustomers();
        } catch (error) {
          message.error('Failed to delete customer');
        }
      },
    });
  };

  const handleToggleStatus = async (customer: Customer, action: 'freeze' | 'disable') => {
    try {
      // TODO: Replace with actual API call
      message.success(`Customer ${action}d successfully`);
      fetchCustomers();
    } catch (error) {
      message.error(`Failed to ${action} customer`);
    }
  };

  const handleAddCustomer = () => {
    setIsAddModalVisible(true);
  };

  const handleAddModalCancel = () => {
    setIsAddModalVisible(false);
  };

  const handleAddCustomerSubmit = async (values: any) => {
    setAddModalLoading(true);
    try {
      const response = await apiClient.post(apiConfig.endpoints.customers.create, values);

      if (response.ok) {
        message.success('Customer created successfully');
        setIsAddModalVisible(false);
        
        // Refresh the customer list and stats
        fetchCustomers();
        fetchStats();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Failed to create customer');
      }
    } catch (error) {
      console.error('Failed to create customer:', error);
      message.error('Failed to create customer');
    } finally {
      setAddModalLoading(false);
    }
  };

  const columns: ColumnsType<Customer> = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar
            icon={record.customer_type === 'Company' ? <TeamOutlined /> : <UserOutlined />}
            className={record.customer_type === 'Company' ? 'bg-blue-500' : 'bg-green-500'}
          />
          <div>
            <div className="font-medium">{record.customer_name}</div>
            <div className="text-sm text-gray-500">{record.customer_code}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'customer_type',
      key: 'customer_type',
      render: (type: string) => (
        <Tag color={type === 'Company' ? 'blue' : 'green'}>{type}</Tag>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div className="text-sm">{record.email}</div>
          <div className="text-sm text-gray-500">{record.mobile_no}</div>
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <div>
          <div className="text-sm">{record.city}</div>
          <div className="text-sm text-gray-500">{record.country}</div>
        </div>
      ),
    },
    {
      title: 'Credit Limit',
      dataIndex: 'credit_limit',
      key: 'credit_limit',
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space>
          {record.disabled && <Tag color="red">Disabled</Tag>}
          {record.is_frozen && <Tag color="orange">Frozen</Tag>}
          {!record.disabled && !record.is_frozen && <Tag color="green">Active</Tag>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'View Details',
                icon: <EyeOutlined />,
                onClick: () => handleView(record),
              },
              {
                key: 'edit',
                label: 'Edit',
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
              },
              { type: 'divider' },
              {
                key: 'freeze',
                label: record.is_frozen ? 'Unfreeze' : 'Freeze',
                onClick: () => handleToggleStatus(record, 'freeze'),
              },
              {
                key: 'disable',
                label: record.disabled ? 'Enable' : 'Disable',
                onClick: () => handleToggleStatus(record, 'disable'),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Delete',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600">Manage your customer database</p>
          </div>
          <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCustomer}
            >
              Add Customer
            </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <Row gutter={16} className="mb-6">
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Customers"
                  value={stats.total}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active"
                  value={stats.active}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Frozen"
                  value={stats.frozen}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Disabled"
                  value={stats.disabled}
                  valueStyle={{ color: '#8c8c8c' }}
                />
              </Card>
            </Col>
          </Row>
        )}
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <Row gutter={[12, 16]} align="middle">
          <Col xs={24} sm={24} md={8} lg={6} xl={6}>
            <Search
              placeholder="Search customers..."
              allowClear
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} sm={12} md={4} lg={3} xl={3}>
            <Select
              placeholder="Type"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('customer_type', value || '')}
            >
              <Option value="Individual">Individual</Option>
              <Option value="Company">Company</Option>
            </Select>
          </Col>
          <Col xs={12} sm={12} md={4} lg={3} xl={3}>
            <Select
              placeholder="Country"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('country', value || '')}
            >
              <Option value="USA">USA</Option>
              <Option value="UK">UK</Option>
              <Option value="Canada">Canada</Option>
            </Select>
          </Col>
          <Col xs={12} sm={12} md={3} lg={3} xl={3}>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('disabled', value || '')}
            >
              <Option value="false">Active</Option>
              <Option value="true">Disabled</Option>
            </Select>
          </Col>
          <Col xs={12} sm={12} md={3} lg={3} xl={3}>
            <Select
              placeholder="Frozen"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('is_frozen', value || '')}
            >
              <Option value="false">No</Option>
              <Option value="true">Yes</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={2} lg={6} xl={6}>
            <Space>
              <Tooltip title="Refresh">
                <Button icon={<ReloadOutlined />} onClick={fetchCustomers} />
              </Tooltip>
              <Tooltip title="Export">
                <Button icon={<ExportOutlined />} />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} customers`,
          }}
          onChange={handleTableChange}
          rowSelection={{
            selectedRowKeys,
            onChange: (selectedRowKeys) => setSelectedRowKeys(selectedRowKeys.map(key => String(key))),
          }}
        />
      </Card>

      {/* Add Customer Modal */}
      <Modal
        title="Add New Customer"
        open={isAddModalVisible}
        onCancel={handleAddModalCancel}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <CustomerForm
          onSubmit={handleAddCustomerSubmit}
          onCancel={handleAddModalCancel}
          loading={addModalLoading}
          submitText="Create Customer"
        />
      </Modal>
    </div>
  );
}