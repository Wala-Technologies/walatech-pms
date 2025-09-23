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
  Descriptions,
  Form,
  InputNumber,
  Timeline,
  Avatar,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CommentOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { apiClient, apiConfig } from '../../../../../config/api';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface WorkOrderTask {
  id: string;
  taskName: string;
  workOrder: {
    id: string;
    workOrderNumber: string;
    productionOrder: {
      orderNumber: string;
      productName: string;
    };
  };
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  actualHours?: number;
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
  progress: number;
  notes?: string;
  completionNotes?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TaskStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  averageCompletionTime: number;
  onTimeCompletion: number;
}

export default function TasksPage() {
  const t = useTranslations('tasks');
  const [tasks, setTasks] = useState<WorkOrderTask[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [workOrderFilter, setWorkOrderFilter] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<WorkOrderTask | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
  const [isCompletionNotesModalVisible, setIsCompletionNotesModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [newProgress, setNewProgress] = useState<number>(0);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [pagination.current, pagination.pageSize, searchText, statusFilter, priorityFilter, workOrderFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        ...(searchText && { search: searchText }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(workOrderFilter && { workOrderId: workOrderFilter }),
      };

      const response = await apiClient.get(apiConfig.endpoints.production.tasks, params);

      if (response.ok) {
        const data = await response.json();
        setTasks(data.data);
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
      const response = await apiClient.get(apiConfig.endpoints.production.taskStats);

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedTask || !newStatus) return;

    try {
      const response = await apiClient.patch(`${apiConfig.endpoints.production.tasks}/${selectedTask.id}/status`, { status: newStatus });

      if (response.ok) {
        message.success(t('statusUpdateSuccess'));
        setIsStatusModalVisible(false);
        fetchTasks();
        fetchStats();
      } else {
        message.error(t('statusUpdateError'));
      }
    } catch (error) {
      message.error(t('statusUpdateError'));
    }
  };

  const handleProgressUpdate = async () => {
    if (!selectedTask) return;

    try {
      const response = await apiClient.patch(`${apiConfig.endpoints.production.tasks}/${selectedTask.id}/progress`, { progress: newProgress });

      if (response.ok) {
        message.success(t('progressUpdateSuccess'));
        setIsProgressModalVisible(false);
        fetchTasks();
        fetchStats();
      } else {
        message.error(t('progressUpdateError'));
      }
    } catch (error) {
      message.error(t('progressUpdateError'));
    }
  };

  const handleAddNotes = async (values: { notes: string }) => {
    if (!selectedTask) return;

    try {
      const response = await apiClient.patch(`${apiConfig.endpoints.production.tasks}/${selectedTask.id}/notes`, values);

      if (response.ok) {
        message.success(t('notesUpdateSuccess'));
        setIsNotesModalVisible(false);
        fetchTasks();
      } else {
        message.error(t('notesUpdateError'));
      }
    } catch (error) {
      message.error(t('notesUpdateError'));
    }
  };

  const handleAddCompletionNotes = async (values: { completionNotes: string }) => {
    if (!selectedTask) return;

    try {
      const response = await apiClient.patch(`${apiConfig.endpoints.production.tasks}/${selectedTask.id}/completion-notes`, values);

      if (response.ok) {
        message.success(t('completionNotesUpdateSuccess'));
        setIsCompletionNotesModalVisible(false);
        fetchTasks();
      } else {
        message.error(t('completionNotesUpdateError'));
      }
    } catch (error) {
      message.error(t('completionNotesUpdateError'));
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

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      urgent: 'red',
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const getEfficiencyPercentage = (task: WorkOrderTask) => {
    if (!task.actualHours || task.estimatedHours === 0) return 0;
    return Math.round((task.estimatedHours / task.actualHours) * 100);
  };

  const isOverdue = (task: WorkOrderTask) => {
    if (!task.dueDate || task.status === 'completed') return false;
    return dayjs().isAfter(dayjs(task.dueDate));
  };

  const columns = [
    {
      title: t('taskName'),
      dataIndex: 'taskName',
      key: 'taskName',
      width: 200,
      render: (text: string, record: WorkOrderTask) => (
        <div>
          <div style={{ fontWeight: 'bold', color: isOverdue(record) ? '#ff4d4f' : undefined }}>
            {text}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.workOrder.workOrderNumber}
          </div>
        </div>
      ),
    },
    {
      title: t('workOrder'),
      key: 'workOrder',
      width: 180,
      render: (record: WorkOrderTask) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.workOrder.workOrderNumber}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.workOrder.productionOrder.productName}
          </div>
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
      title: t('progress'),
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number, record: WorkOrderTask) => (
        <div>
          <Progress 
            percent={progress} 
            size="small" 
            status={record.status === 'completed' ? 'success' : isOverdue(record) ? 'exception' : 'active'}
          />
          <div style={{ fontSize: '11px', textAlign: 'center' }}>{progress}%</div>
        </div>
      ),
    },
    {
      title: t('timeTracking'),
      key: 'timeTracking',
      width: 150,
      render: (record: WorkOrderTask) => (
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
      render: (record: WorkOrderTask) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            {record.assignedTo ? 
              `${record.assignedTo.firstName} ${record.assignedTo.lastName}` : 
              t('unassigned')
            }
          </div>
        </div>
      ),
    },
    {
      title: t('dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (dueDate: string, record: WorkOrderTask) => (
        dueDate ? (
          <div style={{ color: isOverdue(record) ? '#ff4d4f' : undefined }}>
            {dayjs(dueDate).format('MMM DD, YYYY')}
            {isOverdue(record) && (
              <div style={{ fontSize: '11px' }}>{t('overdue')}</div>
            )}
          </div>
        ) : '-'
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 180,
      render: (record: WorkOrderTask) => (
        <Space>
          <Tooltip title={t('viewDetails')}>
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {
                setSelectedTask(record);
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
                setSelectedTask(record);
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
                setSelectedTask(record);
                setNewProgress(record.progress);
                setIsProgressModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title={t('addNotes')}>
            <Button 
              type="text" 
              icon={<CommentOutlined />} 
              size="small"
              onClick={() => {
                setSelectedTask(record);
                form.setFieldsValue({ notes: record.notes || '' });
                setIsNotesModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'completed' && (
            <Tooltip title={t('addCompletionNotes')}>
              <Button 
                type="text" 
                icon={<CheckCircleOutlined />} 
                size="small"
                onClick={() => {
                  setSelectedTask(record);
                  form.setFieldsValue({ completionNotes: record.completionNotes || '' });
                  setIsCompletionNotesModalVisible(true);
                }}
              />
            </Tooltip>
          )}
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
                title={t('totalTasks')}
                value={stats.total}
                prefix={<PlayCircleOutlined />}
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
                title={t('onTimeCompletion')}
                value={stats.onTimeCompletion}
                precision={1}
                suffix="%"
                valueStyle={{ color: stats.onTimeCompletion > 90 ? '#52c41a' : '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>{t('workOrderTasks')}</h2>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
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
            placeholder={t('filterByPriority')}
            allowClear
            style={{ width: 150 }}
            onChange={setPriorityFilter}
          >
            <Option value="low">{t('priority.low')}</Option>
            <Option value="medium">{t('priority.medium')}</Option>
            <Option value="high">{t('priority.high')}</Option>
            <Option value="urgent">{t('priority.urgent')}</Option>
          </Select>
          <Select
            placeholder={t('filterByWorkOrder')}
            allowClear
            style={{ width: 200 }}
            onChange={setWorkOrderFilter}
            showSearch
            optionFilterProp="children"
          >
            {/* This would be populated with actual work orders */}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={tasks}
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
          scroll={{ x: 1500 }}
          rowClassName={(record) => isOverdue(record) ? 'overdue-row' : ''}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={t('taskDetails')}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedTask && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label={t('taskName')} span={2}>
                {selectedTask.taskName}
              </Descriptions.Item>
              <Descriptions.Item label={t('workOrder')}>
                {selectedTask.workOrder.workOrderNumber}
              </Descriptions.Item>
              <Descriptions.Item label={t('productionOrder')}>
                {selectedTask.workOrder.productionOrder.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label={t('status')}>
                <Tag color={getStatusColor(selectedTask.status)}>
                  {t(`status.${selectedTask.status}`)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('priority')}>
                <Tag color={getPriorityColor(selectedTask.priority)}>
                  {t(`priority.${selectedTask.priority}`)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('progress')} span={2}>
                <Progress percent={selectedTask.progress} />
              </Descriptions.Item>
              <Descriptions.Item label={t('estimatedHours')}>
                {selectedTask.estimatedHours}h
              </Descriptions.Item>
              {selectedTask.actualHours && (
                <Descriptions.Item label={t('actualHours')}>
                  {selectedTask.actualHours}h
                </Descriptions.Item>
              )}
              {selectedTask.dueDate && (
                <Descriptions.Item label={t('dueDate')} span={2}>
                  <span style={{ color: isOverdue(selectedTask) ? '#ff4d4f' : undefined }}>
                    {dayjs(selectedTask.dueDate).format('YYYY-MM-DD HH:mm')}
                    {isOverdue(selectedTask) && ` (${t('overdue')})`}
                  </span>
                </Descriptions.Item>
              )}
              {selectedTask.startedAt && (
                <Descriptions.Item label={t('startedAt')}>
                  {dayjs(selectedTask.startedAt).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              )}
              {selectedTask.completedAt && (
                <Descriptions.Item label={t('completedAt')}>
                  {dayjs(selectedTask.completedAt).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              )}
              {selectedTask.assignedTo && (
                <Descriptions.Item label={t('assignedTo')} span={2}>
                  {selectedTask.assignedTo.firstName} {selectedTask.assignedTo.lastName}
                </Descriptions.Item>
              )}
              <Descriptions.Item label={t('createdBy')} span={2}>
                {selectedTask.createdBy.firstName} {selectedTask.createdBy.lastName}
              </Descriptions.Item>
              {selectedTask.description && (
                <Descriptions.Item label={t('description')} span={2}>
                  {selectedTask.description}
                </Descriptions.Item>
              )}
              {selectedTask.notes && (
                <Descriptions.Item label={t('notes')} span={2}>
                  {selectedTask.notes}
                </Descriptions.Item>
              )}
              {selectedTask.completionNotes && (
                <Descriptions.Item label={t('completionNotes')} span={2}>
                  {selectedTask.completionNotes}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Task Timeline */}
            <div style={{ marginTop: '24px' }}>
              <h3>{t('timeline')}</h3>
              <Timeline>
                <Timeline.Item color="blue">
                  <div>
                    <strong>{t('taskCreated')}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {dayjs(selectedTask.createdAt).format('YYYY-MM-DD HH:mm')}
                    </div>
                  </div>
                </Timeline.Item>
                {selectedTask.startedAt && (
                  <Timeline.Item color="orange">
                    <div>
                      <strong>{t('taskStarted')}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {dayjs(selectedTask.startedAt).format('YYYY-MM-DD HH:mm')}
                      </div>
                    </div>
                  </Timeline.Item>
                )}
                {selectedTask.completedAt && (
                  <Timeline.Item color="green">
                    <div>
                      <strong>{t('taskCompleted')}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {dayjs(selectedTask.completedAt).format('YYYY-MM-DD HH:mm')}
                      </div>
                    </div>
                  </Timeline.Item>
                )}
              </Timeline>
            </div>
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
          <p>{t('progressPercentage')}</p>
          <InputNumber
            value={newProgress}
            onChange={(value) => setNewProgress(value || 0)}
            min={0}
            max={100}
            style={{ width: '100%' }}
            formatter={value => `${value}%`}
            parser={value => parseFloat(value!.replace('%', '')) || 0}
          />
        </div>
      </Modal>

      {/* Notes Modal */}
      <Modal
        title={t('addNotes')}
        open={isNotesModalVisible}
        onCancel={() => setIsNotesModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddNotes} layout="vertical">
          <Form.Item
            name="notes"
            label={t('notes')}
            rules={[{ required: true, message: t('notesRequired') }]}
          >
            <TextArea rows={4} placeholder={t('enterNotes')} />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsNotesModalVisible(false)}>
                {t('cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('save')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Completion Notes Modal */}
      <Modal
        title={t('addCompletionNotes')}
        open={isCompletionNotesModalVisible}
        onCancel={() => setIsCompletionNotesModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddCompletionNotes} layout="vertical">
          <Form.Item
            name="completionNotes"
            label={t('completionNotes')}
            rules={[{ required: true, message: t('completionNotesRequired') }]}
          >
            <TextArea rows={4} placeholder={t('enterCompletionNotes')} />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCompletionNotesModalVisible(false)}>
                {t('cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('save')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <style jsx global>{`
        .overdue-row {
          background-color: #fff2f0 !important;
        }
        .overdue-row:hover {
          background-color: #ffebe6 !important;
        }
      `}</style>
    </div>
  );
}