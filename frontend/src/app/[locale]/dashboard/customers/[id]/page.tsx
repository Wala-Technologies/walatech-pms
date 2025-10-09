'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  Descriptions,
  Avatar,
  Space,
  Breadcrumb,
  Tabs,
  Table,
  Statistic,
  Timeline,
  Empty,
  message,
  Modal,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  HomeOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { customerApi } from '../../../../../lib/customer-api';
import type { Customer as ApiCustomer } from '../../../../../lib/customer-api';
import type { ColumnsType } from 'antd/es/table';

const { TabPane } = Tabs;

// Use shared Customer type from service
type Customer = ApiCustomer;

interface Order {
  id: string;
  order_number: string;
  date: string;
  status: string;
  total_amount: number;
  items_count: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  status: string;
}

interface Activity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  user: string;
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Real data will be loaded via API; remove mocks

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const customerResp = await customerApi.getCustomer(customerId);
      if (customerResp.error) throw new Error(customerResp.error);
      setCustomer(customerResp.data || null);

      // TODO: Hook up orders, transactions, activities when backend endpoints exist
      setOrders([]);
      setTransactions([]);
      setActivities([]);
    } catch (error) {
      message.error('Failed to fetch customer data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/${locale}/dashboard/customers/${customerId}/edit`);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Customer',
      content: `Are you sure you want to delete ${customer?.customer_name}?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const resp = await customerApi.deleteCustomer(customerId);
          if (resp.error) throw new Error(resp.error);
          message.success('Customer deleted successfully');
          router.push(`/${locale}/dashboard/customers`);
        } catch (error) {
          message.error('Failed to delete customer');
        }
      },
    });
  };

  const handleBack = () => {
    router.push(`/${locale}/dashboard/customers`);
  };

  const orderColumns: ColumnsType<Order> = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Completed' ? 'green' : 'blue'}>{status}</Tag>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items_count',
      key: 'items_count',
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
  ];

  const transactionColumns: ColumnsType<Transaction> = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'Payment' ? 'green' : 'blue'}>{type}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Completed' ? 'green' : 'orange'}>{status}</Tag>
      ),
    },
  ];

  if (loading || !customer) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a onClick={handleBack}>Customers</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{customer.customer_name}</Breadcrumb.Item>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Avatar
              size={64}
              icon={customer.customer_type === 'Company' ? <TeamOutlined /> : <UserOutlined />}
              className={customer.customer_type === 'Company' ? 'bg-blue-500' : 'bg-green-500'}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.customer_name}</h1>
              <div className="flex items-center space-x-2">
                <Tag color={customer.customer_type === 'Company' ? 'blue' : 'green'}>
                  {customer.customer_type}
                </Tag>
                <span className="text-gray-500">{customer.customer_code}</span>
                {customer.is_frozen && <Tag color="orange">Frozen</Tag>}
                {customer.disabled && <Tag color="red">Disabled</Tag>}
              </div>
            </div>
          </div>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Back
            </Button>
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              Edit
            </Button>
            <Button icon={<DeleteOutlined />} danger onClick={handleDelete}>
              Delete
            </Button>
          </Space>
        </div>
      </div>

      {/* Content */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Overview" key="overview">
          <Row gutter={24}>
            <Col span={16}>
              {/* Basic Information */}
              <Card title="Basic Information" className="mb-6">
                <Descriptions column={2}>
                  <Descriptions.Item label="Customer Name">
                    {customer.customer_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Customer Code">
                    {customer.customer_code}
                  </Descriptions.Item>
                  <Descriptions.Item label="Customer Type">
                    <Tag color={customer.customer_type === 'Company' ? 'blue' : 'green'}>
                      {customer.customer_type}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tax ID">
                    {customer.tax_id || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {customer.email ? (
                      <a href={`mailto:${customer.email}`}>
                        <MailOutlined /> {customer.email}
                      </a>
                    ) : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mobile">
                    {customer.mobile_no ? (
                      <span>
                        <PhoneOutlined /> {customer.mobile_no}
                      </span>
                    ) : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {customer.phone ? (
                      <span>
                        <PhoneOutlined /> {customer.phone}
                      </span>
                    ) : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Website">
                    {customer.website ? (
                      <a href={customer.website} target="_blank" rel="noopener noreferrer">
                        <GlobalOutlined /> {customer.website}
                      </a>
                    ) : 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Address Information */}
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Billing Address" className="mb-6">
                    <div className="space-y-1">
                      <div>{customer.billing_address_line1}</div>
                      {customer.billing_address_line2 && (
                        <div>{customer.billing_address_line2}</div>
                      )}
                      <div>
                        {customer.billing_city}, {customer.billing_state} {customer.billing_pincode}
                      </div>
                      <div>{customer.billing_country}</div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Shipping Address" className="mb-6">
                    <div className="space-y-1">
                      <div>{customer.shipping_address_line1}</div>
                      {customer.shipping_address_line2 && (
                        <div>{customer.shipping_address_line2}</div>
                      )}
                      <div>
                        {customer.shipping_city}, {customer.shipping_state} {customer.shipping_pincode}
                      </div>
                      <div>{customer.shipping_country}</div>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Notes */}
              {customer.notes && (
                <Card title="Notes" className="mb-6">
                  <p>{customer.notes}</p>
                </Card>
              )}
            </Col>

            <Col span={8}>
              {/* Financial Summary */}
              <Card title="Financial Summary" className="mb-6">
                <Row gutter={16}>
                  <Col span={24}>
                    <Statistic
                      title="Credit Limit"
                      value={customer.credit_limit}
                      prefix={<DollarOutlined />}
                      formatter={(value) => `$${value?.toLocaleString()}`}
                    />
                  </Col>
                </Row>
                <div className="mt-4">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Payment Terms">
                      {customer.payment_terms || 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card title="Quick Stats" className="mb-6">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Total Orders"
                      value={orders.length}
                      prefix={<ShoppingCartOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Total Spent"
                      value={orders.reduce((sum, order) => sum + order.total_amount, 0)}
                      prefix={<DollarOutlined />}
                      formatter={(value) => `$${value?.toLocaleString()}`}
                    />
                  </Col>
                </Row>
              </Card>

              {/* Account Status */}
              <Card title="Account Status">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Account Status:</span>
                    <Tag color={!customer.disabled && !customer.is_frozen ? 'green' : 'red'}>
                      {!customer.disabled && !customer.is_frozen ? 'Active' : 'Inactive'}
                    </Tag>
                  </div>
                  <div className="flex justify-between">
                    <span>Frozen:</span>
                    <Tag color={customer.is_frozen ? 'orange' : 'green'}>
                      {customer.is_frozen ? 'Yes' : 'No'}
                    </Tag>
                  </div>
                  <div className="flex justify-between">
                    <span>Disabled:</span>
                    <Tag color={customer.disabled ? 'red' : 'green'}>
                      {customer.disabled ? 'Yes' : 'No'}
                    </Tag>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Orders" key="orders">
          <Card>
            <Table
              columns={orderColumns}
              dataSource={orders}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Transactions" key="transactions">
          <Card>
            <Table
              columns={transactionColumns}
              dataSource={transactions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Activity" key="activity">
          <Card>
            {activities.length > 0 ? (
              <Timeline>
                {activities.map((activity) => (
                  <Timeline.Item key={activity.id}>
                    <div>
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-gray-600">{activity.description}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()} by {activity.user}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="No activity found" />
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}