'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Tag,
  Dropdown,
  Modal,
  message,
  Row,
  Col,
  Statistic,
  Typography,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ExportOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import SalesOrderForm from '../../../../components/SalesOrderForm';
import {
  salesOrderApi,
  SalesOrder,
  SalesOrderQueryParams,
  SalesOrderStats,
  CreateSalesOrderData,
  UpdateSalesOrderData,
} from '../../../../lib/sales-order-api';
import { apiClient } from '../../../../lib/api-client';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Customer {
  id: string;
  name: string;
  email?: string;
}

interface Item {
  code: string;
  name: string;
  rate: number;
  uom?: string;
}

const SalesOrdersPage: React.FC = () => {
  const router = useRouter();
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SalesOrderStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<SalesOrderQueryParams>({});
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedOrderType, setSelectedOrderType] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
  };
  
  // Modal states
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingSalesOrder, setEditingSalesOrder] = useState<SalesOrder | null>(null);
  const [viewingSalesOrder, setViewingSalesOrder] = useState<SalesOrder | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchSalesOrders();
    fetchStats();
    fetchCustomers();
    fetchItems();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchSalesOrders = async () => {
    setLoading(true);
    try {
      const params: SalesOrderQueryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await salesOrderApi.getSalesOrders(params);
      const responseData = response?.data;
      if (responseData) {
        setSalesOrders(responseData.data);
        setPagination(prev => ({
          ...prev,
          total: responseData.total,
        }));
      }
    } catch (error) {
      message.error('Failed to fetch sales orders');
      console.error('Error fetching sales orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await salesOrderApi.getSalesOrderStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await apiClient.get('/customers');
      if (response.data) {
        setCustomers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchItems = async () => {
    try {
      // Assuming there's an items endpoint
      const response = await apiClient.get('/items');
      if (response.data) {
        setItems(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      // Mock data for demo
      setItems([
        { code: 'ITEM001', name: 'Product A', rate: 100, uom: 'Nos' },
        { code: 'ITEM002', name: 'Product B', rate: 250, uom: 'Kg' },
        { code: 'ITEM003', name: 'Service C', rate: 500, uom: 'Hour' },
      ]);
    }
  };

  const handleSearch = () => {
    const newFilters: SalesOrderQueryParams = {
      search: searchText || undefined,
      status: selectedStatus || undefined,
      order_type: selectedOrderType || undefined,
      from_date: dateRange?.[0]?.format('YYYY-MM-DD'),
      to_date: dateRange?.[1]?.format('YYYY-MM-DD'),
    };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedStatus('');
    setSelectedOrderType('');
    setDateRange(null);
    setFilters({});
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleCreate = () => {
    setEditingSalesOrder(null);
    setIsFormModalVisible(true);
  };

  const handleEdit = (record: SalesOrder) => {
    setEditingSalesOrder(record);
    setIsFormModalVisible(true);
  };

  const handleView = (record: SalesOrder) => {
    setViewingSalesOrder(record);
    setIsViewModalVisible(true);
  };

  const handleFormSubmit = async (data: CreateSalesOrderData | UpdateSalesOrderData) => {
    setFormLoading(true);
    try {
      if (editingSalesOrder) {
        await salesOrderApi.updateSalesOrder(editingSalesOrder.id, data as UpdateSalesOrderData);
        message.success('Sales order updated successfully');
      } else {
        await salesOrderApi.createSalesOrder(data as CreateSalesOrderData);
        message.success('Sales order created successfully');
      }
      setIsFormModalVisible(false);
      fetchSalesOrders();
      fetchStats();
    } catch (error) {
      message.error('Failed to save sales order');
      console.error('Error saving sales order:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await salesOrderApi.deleteSalesOrder(id);
      message.success('Sales order deleted successfully');
      fetchSalesOrders();
      fetchStats();
    } catch (error) {
      message.error('Failed to delete sales order');
      console.error('Error deleting sales order:', error);
    }
  };

  const handleStatusAction = async (id: string, action: string) => {
    try {
      switch (action) {
        case 'submit':
          await salesOrderApi.submitSalesOrder(id);
          message.success('Sales order submitted successfully');
          break;
        case 'cancel':
          await salesOrderApi.cancelSalesOrder(id);
          message.success('Sales order cancelled successfully');
          break;
        case 'close':
          await salesOrderApi.closeSalesOrder(id);
          message.success('Sales order closed successfully');
          break;
        case 'hold':
          await salesOrderApi.holdSalesOrder(id);
          message.success('Sales order put on hold successfully');
          break;
        case 'resume':
          await salesOrderApi.resumeSalesOrder(id);
          message.success('Sales order resumed successfully');
          break;
      }
      fetchSalesOrders();
      fetchStats();
    } catch (error) {
      message.error(`Failed to ${action} sales order`);
      console.error(`Error ${action} sales order:`, error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Draft': 'default',
      'On Hold': 'warning',
      'To Deliver and Bill': 'processing',
      'To Bill': 'cyan',
      'To Deliver': 'blue',
      'Completed': 'success',
      'Cancelled': 'error',
      'Closed': 'default',
    };
    return colors[status] || 'default';
  };

  const getActionMenuItems = (record: SalesOrder) => {
    const items = [
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
        disabled: record.status === 'Completed' || record.status === 'Cancelled',
      },
    ];

    if (record.status === 'Draft') {
      items.push({
        key: 'submit',
        label: 'Submit',
        icon: <CheckCircleOutlined />,
        onClick: () => handleStatusAction(record.id, 'submit'),
      });
    }

    if (record.status === 'To Deliver and Bill' || record.status === 'To Bill' || record.status === 'To Deliver') {
      items.push({
        key: 'hold',
        label: 'Put on Hold',
        icon: <PauseCircleOutlined />,
        onClick: () => handleStatusAction(record.id, 'hold'),
      });
      items.push({
        key: 'close',
        label: 'Close',
        icon: <FileTextOutlined />,
        onClick: () => handleStatusAction(record.id, 'close'),
      });
    }

    if (record.status === 'On Hold') {
      items.push({
        key: 'resume',
        label: 'Resume',
        icon: <PlayCircleOutlined />,
        onClick: () => handleStatusAction(record.id, 'resume'),
      });
    }

    if (record.status !== 'Completed' && record.status !== 'Cancelled') {
      items.push({
        key: 'cancel',
        label: 'Cancel',
        icon: <CloseCircleOutlined />,
        onClick: () => handleStatusAction(record.id, 'cancel'),
      });
    }

    items.push({
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      onClick: () => handleDelete(record.id),
      disabled: record.status !== 'Draft' && record.status !== 'Cancelled',
    });

    return items;
  };

  const columns: ColumnsType<SalesOrder> = [
    {
      title: 'Sales Order',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: SalesOrder) => (
        <Button type="link" onClick={() => handleView(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Date',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Delivery Date',
      dataIndex: 'delivery_date',
      key: 'delivery_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Order Type',
      dataIndex: 'order_type',
      key: 'order_type',
    },
    {
      title: 'Grand Total',
      dataIndex: 'grand_total',
      key: 'grand_total',
      render: (amount: number, record: SalesOrder) => 
        `${record.currency} ${amount.toFixed(2)}`,
      align: 'right',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record: SalesOrder) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Sales Orders</Title>
        
        {stats && (
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={6}>
              <Card>
                <Statistic title="Total Orders" value={stats.total} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Draft" value={stats.draft} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Completed" value={stats.completed} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Total Value" 
                  value={stats.totalValue} 
                  prefix="$"
                  precision={2}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Card>
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={6}>
              <Input
                placeholder="Search sales orders..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="Draft">Draft</Option>
                <Option value="On Hold">On Hold</Option>
                <Option value="To Deliver and Bill">To Deliver and Bill</Option>
                <Option value="To Bill">To Bill</Option>
                <Option value="To Deliver">To Deliver</Option>
                <Option value="Completed">Completed</Option>
                <Option value="Cancelled">Cancelled</Option>
                <Option value="Closed">Closed</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Order Type"
                value={selectedOrderType}
                onChange={setSelectedOrderType}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="Sales">Sales</Option>
                <Option value="Maintenance">Maintenance</Option>
                <Option value="Shopping Cart">Shopping Cart</Option>
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={4}>
              <Space>
                <Button onClick={handleSearch} icon={<FilterOutlined />}>
                  Filter
                </Button>
                <Button onClick={handleReset}>Reset</Button>
              </Space>
            </Col>
          </Row>

          <Row justify="space-between" style={{ marginBottom: '16px' }}>
            <Col>
              <Space>
                <Button type="primary" onClick={handleCreate} icon={<PlusOutlined />}>
                  New Sales Order
                </Button>
                <Button icon={<ExportOutlined />}>Export</Button>
              </Space>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={salesOrders}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              onChange: (page, pageSize) => {
                setPagination(prev => ({
                  ...prev,
                  current: page,
                  pageSize: pageSize || 10,
                }));
              },
            }}
          />
        </Card>
      </div>

      {/* Form Modal */}
      <Modal
        title={editingSalesOrder ? 'Edit Sales Order' : 'Create Sales Order'}
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={null}
        width={1200}
        destroyOnClose
      >
        <SalesOrderForm
          initialValues={editingSalesOrder || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalVisible(false)}
          loading={formLoading}
          customers={customers}
          items={items}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        title="Sales Order Details"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={1000}
      >
        {viewingSalesOrder && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Sales Order:</strong> {viewingSalesOrder.name}</p>
                <p><strong>Customer:</strong> {viewingSalesOrder.customer_name}</p>
                <p><strong>Status:</strong> <Tag color={getStatusColor(viewingSalesOrder.status)}>{viewingSalesOrder.status}</Tag></p>
                <p><strong>Order Type:</strong> {viewingSalesOrder.order_type}</p>
              </Col>
              <Col span={12}>
                <p><strong>Transaction Date:</strong> {dayjs(viewingSalesOrder.transaction_date).format('DD/MM/YYYY')}</p>
                <p><strong>Delivery Date:</strong> {dayjs(viewingSalesOrder.delivery_date).format('DD/MM/YYYY')}</p>
                <p><strong>Currency:</strong> {viewingSalesOrder.currency}</p>
                <p><strong>Grand Total:</strong> {viewingSalesOrder.currency} {viewingSalesOrder.grand_total.toFixed(2)}</p>
              </Col>
            </Row>
            
            <div style={{ marginTop: '16px' }}>
              <Title level={4}>Items</Title>
              <Table
                dataSource={viewingSalesOrder.items}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { title: 'Item Code', dataIndex: 'item_code', key: 'item_code' },
                  { title: 'Item Name', dataIndex: 'item_name', key: 'item_name' },
                  { title: 'Qty', dataIndex: 'qty', key: 'qty' },
                  { title: 'Rate', dataIndex: 'rate', key: 'rate', render: (rate: number) => rate.toFixed(2) },
                  { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (amount: number) => amount?.toFixed(2) },
                  { title: 'UOM', dataIndex: 'uom', key: 'uom' },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesOrdersPage;