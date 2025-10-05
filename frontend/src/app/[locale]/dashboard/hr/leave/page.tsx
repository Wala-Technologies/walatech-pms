'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Modal, 
  message, 
  Tooltip,
  Row,
  Col,
  Typography,
  DatePicker,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined, 
  CheckOutlined, 
  CloseOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { hrApi, LeaveApplication, LeaveApplicationStatus, PaginatedResponse, RejectLeaveApplicationDto } from '../../../../../lib/hr-api';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function LeaveApplicationsPage() {
  const router = useRouter();
  
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaveApplicationStatus | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);

  useEffect(() => {
    fetchLeaveApplications();
  }, [pagination.current, pagination.pageSize, searchTerm, statusFilter, dateRange]);

  const fetchLeaveApplications = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: pagination.current,
        limit: pagination.pageSize,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      const response = await hrApi.getLeaveApplications(params);
      
      setLeaveApplications(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data?.length || 0,
      }));
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      message.error('Failed to fetch leave applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await hrApi.approveLeaveApplication(id, { 
        approved_by: 'current_user', // This should be the current user's ID
        approved_date: new Date().toISOString()
      });
      message.success('Leave application approved successfully');
      fetchLeaveApplications();
    } catch (error) {
      console.error('Error approving leave application:', error);
      message.error('Failed to approve leave application');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await hrApi.rejectLeaveApplication(id, { 
        rejection_reason: 'Rejected by manager'
      });
      message.success('Leave application rejected');
      fetchLeaveApplications();
    } catch (error) {
      console.error('Error rejecting leave application:', error);
      message.error('Failed to reject leave application');
    }
  };

  const getStatusColor = (status: LeaveApplicationStatus) => {
    switch (status) {
      case LeaveApplicationStatus.DRAFT:
        return 'blue';
      case LeaveApplicationStatus.OPEN:
        return 'orange';
      case LeaveApplicationStatus.APPROVED:
        return 'green';
      case LeaveApplicationStatus.REJECTED:
        return 'red';
      case LeaveApplicationStatus.CANCELLED:
        return 'gray';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<LeaveApplication> = [
    {
      title: 'Employee',
      dataIndex: ['employee', 'name'],
      key: 'employee',
      render: (_, record) => (
        <div>
          <div>{record.employee?.name || 'N/A'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.employee?.employee_number || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Leave Type',
      dataIndex: 'leave_type',
      key: 'leave_type',
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => (
        <div>
          <div>{new Date(record.start_date).toLocaleDateString()} - {new Date(record.end_date).toLocaleDateString()}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.total_days} day(s)
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: LeaveApplicationStatus) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Applied Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/dashboard/hr/leave/${record.id}`)}
            />
          </Tooltip>
          
          {record.status === LeaveApplicationStatus.OPEN && (
            <>
              <Popconfirm
                title="Approve this leave application?"
                onConfirm={() => handleApprove(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Approve">
                  <Button
                    type="text"
                    icon={<CheckOutlined />}
                    style={{ color: '#52c41a' }}
                  />
                </Tooltip>
              </Popconfirm>
              
              <Popconfirm
                title="Reject this leave application?"
                onConfirm={() => handleReject(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Reject">
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    style={{ color: '#ff4d4f' }}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleTableChange = (paginationConfig: any) => {
    setPagination({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      total: pagination.total,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter(undefined);
    setDateRange(null);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>Leave Applications</Title>
        </Col>
        <Col>
          <Link href="/dashboard/hr/leave/apply">
            <Button type="primary" icon={<PlusOutlined />}>
              Apply for Leave
            </Button>
          </Link>
        </Col>
      </Row>

      <Card>
        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Search by employee name..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value={LeaveApplicationStatus.DRAFT}>Draft</Select.Option>
              <Select.Option value={LeaveApplicationStatus.OPEN}>Open</Select.Option>
              <Select.Option value={LeaveApplicationStatus.APPROVED}>Approved</Select.Option>
              <Select.Option value={LeaveApplicationStatus.REJECTED}>Rejected</Select.Option>
              <Select.Option value={LeaveApplicationStatus.CANCELLED}>Cancelled</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={fetchLeaveApplications}
              >
                Apply Filters
              </Button>
              <Button onClick={clearFilters}>
                Clear
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={leaveApplications}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} leave applications`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}