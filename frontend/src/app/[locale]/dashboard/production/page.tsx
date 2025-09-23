'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  message,
  Tooltip,
  Progress,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { apiClient, apiConfig, getAuthHeaders } from '../../../../config/api';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ProductionOrder {
  id: string;
  orderNumber: string;
  productName: string;
  productCode: string;
  quantityPlanned: number;
  quantityProduced: number;
  unit: string;
  status: 'draft' | 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  description?: string;
  estimatedCost?: number;
  actualCost?: number;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductionStats {
  total: number;
  byStatus: Record<string, number>;
  completionRate: number;
}

export default function ProductionOrdersPage() {
  const t = useTranslations('production');
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [stats, setStats] = useState<ProductionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [pagination.current, pagination.pageSize, searchText, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        ...(searchText && { search: searchText }),
        ...(statusFilter && { status: statusFilter }),
      };

      const response = await apiClient.get(apiConfig.endpoints.production.orders, params);

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data);
        setPagination(prev => ({ ...prev, total: data.total }));
      }
    } catch (error) {
      message.error(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get(apiConfig.endpoints.production.statistics);

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleCreate = () => {
    setEditingOrder(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (order: ProductionOrder) => {
    setEditingOrder(order);
    form.setFieldsValue({
      ...order,
      plannedStartDate: dayjs(order.plannedStartDate),
      plannedEndDate: dayjs(order.plannedEndDate),
      actualStartDate: order.actualStartDate ? dayjs(order.actualStartDate) : null,
      actualEndDate: order.actualEndDate ? dayjs(order.actualEndDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        plannedStartDate: values.plannedStartDate.format('YYYY-MM-DD'),
        plannedEndDate: values.plannedEndDate.format('YYYY-MM-DD'),
        actualStartDate: values.actualStartDate?.format('YYYY-MM-DD'),
        actualEndDate: values.actualEndDate?.format('YYYY-MM-DD'),
      };

      const url = editingOrder
        ? `/api/production-orders/${editingOrder.id}`
        : '/api/production-orders';
      
      const method = editingOrder ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success(editingOrder ? t('updateSuccess') : t('createSuccess'));
        setIsModalVisible(false);
        fetchOrders();
        fetchStats();
      } else {
        message.error(t('saveError'));
      }
    } catch (error) {
      message.error(t('saveError'));
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: t('confirmDelete'),
      content: t('deleteWarning'),
      onOk: async () => {
          try {
            const response = await apiClient.delete(`${apiConfig.endpoints.production.orders}/${id}`);

          if (response.ok) {
            message.success(t('deleteSuccess'));
            fetchOrders();
            fetchStats();
          } else {
            message.error(t('deleteError'));
          }
        } catch (error) {
          message.error(t('deleteError'));
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'default',
      planned: 'blue',
      in_progress: 'orange',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      urgent: 'red',
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const getProgressPercentage = (order: ProductionOrder) => {
    if (order.quantityPlanned === 0) return 0;
    return Math.round((order.quantityProduced / order.quantityPlanned) * 100);
  };

  const columns = [
    {
      title: t('orderNumber'),
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
    },
    {
      title: t('product'),
      key: 'product',
      width: 200,
      render: (record: ProductionOrder) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productCode}</div>
        </div>
      ),
    },
    {
      title: t('quantity'),
      key: 'quantity',
      width: 150,
      render: (record: ProductionOrder) => (
        <div>
          <div>{record.quantityProduced} / {record.quantityPlanned} {record.unit}</div>
          <Progress 
            percent={getProgressPercentage(record)} 
            size="small" 
            status={record.status === 'completed' ? 'success' : 'active'}
          />
        </div>
      ),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {t(`status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('priority'),
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {t(`priority.${priority}`)}
        </Tag>
      ),
    },
    {
      title: t('plannedDates'),
      key: 'plannedDates',
      width: 180,
      render: (record: ProductionOrder) => (
        <div>
          <div>{dayjs(record.plannedStartDate).format('MMM DD, YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {dayjs(record.plannedEndDate).format('MMM DD, YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: t('assignedTo'),
      key: 'assignedTo',
      width: 120,
      render: (record: ProductionOrder) => (
        record.assignedTo ? 
          `${record.assignedTo.firstName} ${record.assignedTo.lastName}` : 
          '-'
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 150,
      render: (record: ProductionOrder) => (
        <Space>
          <Tooltip title={t('view')}>
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {/* Navigate to detail view */}}
            />
          </Tooltip>
          <Tooltip title={t('edit')}>
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={t('delete')}>
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('totalOrders')}
                value={stats.total}
                prefix={<PlayCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('inProgress')}
                value={stats.byStatus.in_progress || 0}
                prefix={<PauseCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('completed')}
                value={stats.byStatus.completed || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('completionRate')}
                value={stats.completionRate}
                precision={1}
                suffix="%"
                valueStyle={{ color: stats.completionRate > 80 ? '#52c41a' : '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{t('productionOrders')}</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {t('createOrder')}
          </Button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
          <Search
            placeholder={t('searchPlaceholder')}
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
          />
          <Select
            placeholder={t('filterByStatus')}
            allowClear
            style={{ width: 200 }}
            onChange={setStatusFilter}
          >
            <Option value="draft">{t('status.draft')}</Option>
            <Option value="planned">{t('status.planned')}</Option>
            <Option value="in_progress">{t('status.in_progress')}</Option>
            <Option value="completed">{t('status.completed')}</Option>
            <Option value="cancelled">{t('status.cancelled')}</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} ${t('of')} ${total} ${t('items')}`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingOrder ? t('editOrder') : t('createOrder')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productName"
                label={t('productName')}
                rules={[{ required: true, message: t('productNameRequired') }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="productCode"
                label={t('productCode')}
                rules={[{ required: true, message: t('productCodeRequired') }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantityPlanned"
                label={t('quantityPlanned')}
                rules={[{ required: true, message: t('quantityRequired') }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label={t('unit')}
                rules={[{ required: true, message: t('unitRequired') }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority"
                label={t('priority')}
              >
                <Select>
                  <Option value="low">{t('priority.low')}</Option>
                  <Option value="medium">{t('priority.medium')}</Option>
                  <Option value="high">{t('priority.high')}</Option>
                  <Option value="urgent">{t('priority.urgent')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="plannedStartDate"
                label={t('plannedStartDate')}
                rules={[{ required: true, message: t('startDateRequired') }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="plannedEndDate"
                label={t('plannedEndDate')}
                rules={[{ required: true, message: t('endDateRequired') }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={t('description')}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="estimatedCost"
            label={t('estimatedCost')}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => (parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0) as 0}
            />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                {t('cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {editingOrder ? t('update') : t('create')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}