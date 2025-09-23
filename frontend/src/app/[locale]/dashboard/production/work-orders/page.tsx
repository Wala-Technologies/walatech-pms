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
  Progress,
  Tooltip,
  message,
  Row,
  Col,
  Statistic,
  Timeline,
  Descriptions,
  InputNumber,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { apiClient, apiConfig } from '../../../../../config/api';

const { Search } = Input;
const { Option } = Select;

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  productionOrder: {
    id: string;
    orderNumber: string;
    productName: string;
  };
  quantityPlanned: number;
  quantityProduced: number;
  unit: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  type: 'manufacturing' | 'assembly' | 'packaging' | 'quality_check' | 'maintenance';
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedHours: number;
  actualHours?: number;
  description?: string;
  notes?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface WorkOrderStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  averageCompletionTime: number;
  efficiency: number;
}

export default function WorkOrdersPage() {
  const t = useTranslations('workOrders');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [stats, setStats] = useState<WorkOrderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [newProgress, setNewProgress] = useState<number>(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchWorkOrders();
    fetchStats();
  }, [pagination.current, pagination.pageSize, searchText, statusFilter, typeFilter]);

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        ...(searchText && { search: searchText }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
      };

      const response = await apiClient.get(apiConfig.endpoints.production.workOrders, params);

      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data.data);
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
      const response = await apiClient.get(apiConfig.endpoints.production.workOrderStats);

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedWorkOrder || !newStatus) return;

    try {
      const response = await apiClient.patch(`${apiConfig.endpoints.production.workOrders}/${selectedWorkOrder.id}/status`, { status: newStatus });

      if (response.ok) {
        message.success(t('statusUpdateSuccess'));
        setIsStatusModalVisible(false);
        fetchWorkOrders();
        fetchStats();
      } else {
        message.error(t('statusUpdateError'));
      }
    } catch (error) {
      message.error(t('statusUpdateError'));
    }
  };

  const handleProgressUpdate = async () => {
    if (!selectedWorkOrder) return;

    try {
      const response = await apiClient.patch(`${apiConfig.endpoints.production.workOrders}/${selectedWorkOrder.id}/progress`, { progress: newProgress });

      if (response.ok) {
        message.success(t('progressUpdateSuccess'));
        setIsProgressModalVisible(false);
        fetchWorkOrders();
        fetchStats();
      } else {
        message.error(t('progressUpdateError'));
      }
    } catch (error) {
      message.error(t('progressUpdateError'));
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'default',
      in_progress: 'orange',
      completed: 'green',
      on_hold: 'red',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      manufacturing: 'blue',
      assembly: 'green',
      packaging: 'orange',
      quality_check: 'purple',
      maintenance: 'red',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getProgressPercentage = (workOrder: WorkOrder) => {
    if (workOrder.quantityPlanned === 0) return 0;
    return Math.round((workOrder.quantityProduced / workOrder.quantityPlanned) * 100);
  };

  const getEfficiencyPercentage = (workOrder: WorkOrder) => {
    if (!workOrder.actualHours || workOrder.estimatedHours === 0) return 0;
    return Math.round((workOrder.estimatedHours / workOrder.actualHours) * 100);
  };

  const columns = [
    {
      title: t('workOrderNumber'),
      dataIndex: 'workOrderNumber',
      key: 'workOrderNumber',
      width: 140,
    },
    {
      title: t('productionOrder'),
      key: 'productionOrder',
      width: 200,
      render: (record: WorkOrder) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productionOrder.orderNumber}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productionOrder.productName}</div>
        </div>
      ),
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={getTypeColor(type)} icon={<ToolOutlined />}>
          {t(`type.${type}`)}
        </Tag>
      ),
    },
    {
      title: t('progress'),
      key: 'progress',
      width: 150,
      render: (record: WorkOrder) => (
        <div>
          <div style={{ marginBottom: '4px' }}>
            {record.quantityProduced} / {record.quantityPlanned} {record.unit}
          </div>
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
      title: t('timeTracking'),
      key: 'timeTracking',
      width: 150,
      render: (record: WorkOrder) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            {t('estimated')}: {record.estimatedHours}h
          </div>
          {record.actualHours && (
            <div style={{ fontSize: '12px' }}>
              {t('actual')}: {record.actualHours}h
            </div>
          )}
          {record.actualHours && (
            <div style={{ fontSize: '11px', color: getEfficiencyPercentage(record) >= 100 ? '#52c41a' : '#fa8c16' }}>
              {t('efficiency')}: {getEfficiencyPercentage(record)}%
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('assignedTo'),
      key: 'assignedTo',
      width: 120,
      render: (record: WorkOrder) => (
        record.assignedTo ? 
          `${record.assignedTo.firstName} ${record.assignedTo.lastName}` : 
          '-'
      ),
    },
    {
      title: t('plannedDates'),
      key: 'plannedDates',
      width: 180,
      render: (record: WorkOrder) => (
        <div>
          <div>{dayjs(record.plannedStartDate).format('MMM DD, YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {dayjs(record.plannedEndDate).format('MMM DD, YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 150,
      render: (record: WorkOrder) => (
        <Space>
          <Tooltip title={t('viewDetails')}>
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {
                setSelectedWorkOrder(record);
                setIsDetailModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title={t('updateStatus')}>
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => {
                setSelectedWorkOrder(record);
                setNewStatus(record.status);
                setIsStatusModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title={t('updateProgress')}>
            <Button 
              type="text" 
              icon={<PlayCircleOutlined />} 
              size="small"
              onClick={() => {
                setSelectedWorkOrder(record);
                setNewProgress(record.quantityProduced);
                setIsProgressModalVisible(true);
              }}
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
          <Col span={4}>
            <Card>
              <Statistic
                title={t('totalWorkOrders')}
                value={stats.total}
                prefix={<ToolOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title={t('inProgress')}
                value={stats.byStatus.in_progress || 0}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title={t('completed')}
                value={stats.byStatus.completed || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title={t('onHold')}
                value={stats.byStatus.on_hold || 0}
                prefix={<PauseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title={t('avgCompletionTime')}
                value={stats.averageCompletionTime}
                precision={1}
                suffix="h"
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title={t('efficiency')}
                value={stats.efficiency}
                precision={1}
                suffix="%"
                valueStyle={{ color: stats.efficiency > 90 ? '#52c41a' : '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>{t('workOrders')}</h2>
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
            style={{ width: 150 }}
            onChange={setStatusFilter}
          >
            <Option value="pending">{t('status.pending')}</Option>
            <Option value="in_progress">{t('status.in_progress')}</Option>
            <Option value="completed">{t('status.completed')}</Option>
            <Option value="on_hold">{t('status.on_hold')}</Option>
          </Select>
          <Select
            placeholder={t('filterByType')}
            allowClear
            style={{ width: 150 }}
            onChange={setTypeFilter}
          >
            <Option value="manufacturing">{t('type.manufacturing')}</Option>
            <Option value="assembly">{t('type.assembly')}</Option>
            <Option value="packaging">{t('type.packaging')}</Option>
            <Option value="quality_check">{t('type.quality_check')}</Option>
            <Option value="maintenance">{t('type.maintenance')}</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={workOrders}
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
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={t('workOrderDetails')}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedWorkOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label={t('workOrderNumber')} span={2}>
                {selectedWorkOrder.workOrderNumber}
              </Descriptions.Item>
              <Descriptions.Item label={t('productionOrder')}>
                {selectedWorkOrder.productionOrder.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label={t('product')}>
                {selectedWorkOrder.productionOrder.productName}
              </Descriptions.Item>
              <Descriptions.Item label={t('type')}>
                <Tag color={getTypeColor(selectedWorkOrder.type)}>
                  {t(`type.${selectedWorkOrder.type}`)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('status')}>
                <Tag color={getStatusColor(selectedWorkOrder.status)}>
                  {t(`status.${selectedWorkOrder.status}`)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('quantity')}>
                {selectedWorkOrder.quantityProduced} / {selectedWorkOrder.quantityPlanned} {selectedWorkOrder.unit}
              </Descriptions.Item>
              <Descriptions.Item label={t('progress')}>
                <Progress percent={getProgressPercentage(selectedWorkOrder)} />
              </Descriptions.Item>
              <Descriptions.Item label={t('plannedStartDate')}>
                {dayjs(selectedWorkOrder.plannedStartDate).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label={t('plannedEndDate')}>
                {dayjs(selectedWorkOrder.plannedEndDate).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              {selectedWorkOrder.actualStartDate && (
                <Descriptions.Item label={t('actualStartDate')}>
                  {dayjs(selectedWorkOrder.actualStartDate).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              )}
              {selectedWorkOrder.actualEndDate && (
                <Descriptions.Item label={t('actualEndDate')}>
                  {dayjs(selectedWorkOrder.actualEndDate).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label={t('estimatedHours')}>
                {selectedWorkOrder.estimatedHours}h
              </Descriptions.Item>
              {selectedWorkOrder.actualHours && (
                <Descriptions.Item label={t('actualHours')}>
                  {selectedWorkOrder.actualHours}h
                </Descriptions.Item>
              )}
              {selectedWorkOrder.assignedTo && (
                <Descriptions.Item label={t('assignedTo')} span={2}>
                  {selectedWorkOrder.assignedTo.firstName} {selectedWorkOrder.assignedTo.lastName}
                </Descriptions.Item>
              )}
              {selectedWorkOrder.description && (
                <Descriptions.Item label={t('description')} span={2}>
                  {selectedWorkOrder.description}
                </Descriptions.Item>
              )}
              {selectedWorkOrder.notes && (
                <Descriptions.Item label={t('notes')} span={2}>
                  {selectedWorkOrder.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title={t('updateStatus')}
        open={isStatusModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => setIsStatusModalVisible(false)}
      >
        <Select
          value={newStatus}
          onChange={setNewStatus}
          style={{ width: '100%' }}
        >
          <Option value="pending">{t('status.pending')}</Option>
          <Option value="in_progress">{t('status.in_progress')}</Option>
          <Option value="completed">{t('status.completed')}</Option>
          <Option value="on_hold">{t('status.on_hold')}</Option>
        </Select>
      </Modal>

      {/* Progress Update Modal */}
      <Modal
        title={t('updateProgress')}
        open={isProgressModalVisible}
        onOk={handleProgressUpdate}
        onCancel={() => setIsProgressModalVisible(false)}
      >
        <div>
          <p>{t('quantityProduced')}</p>
          <InputNumber
            value={newProgress}
            onChange={(value) => setNewProgress(value || 0)}
            min={0}
            max={selectedWorkOrder?.quantityPlanned || 0}
            style={{ width: '100%' }}
          />
          {selectedWorkOrder && (
            <p style={{ marginTop: '8px', color: '#666' }}>
              {t('maxQuantity')}: {selectedWorkOrder.quantityPlanned} {selectedWorkOrder.unit}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}