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
  message, 
  Row, 
  Col, 
  Typography,
  DatePicker,
  Modal,
  Form,
  TimePicker,
  Tooltip,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { hrApi, Attendance, AttendanceStatus, Employee, PaginatedResponse, CreateAttendanceDto } from '../../../../../lib/hr-api';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function AttendancePage() {
  const router = useRouter();
  
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [markAttendanceModalVisible, setMarkAttendanceModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<any>(dayjs());
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>(undefined);

  // Statistics
  const [todayStats, setTodayStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0
  });

  useEffect(() => {
    fetchAttendanceRecords();
    fetchEmployees();
    fetchTodayStats();
  }, [pagination.current, pagination.pageSize, searchTerm, statusFilter, selectedDate, employeeFilter]);

  const fetchAttendanceRecords = async () => {
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
      
      if (selectedDate) {
        params.date = selectedDate.format('YYYY-MM-DD');
      }
      
      if (employeeFilter) {
        params.employeeId = employeeFilter;
      }
      
      const response: PaginatedResponse<Attendance> = await hrApi.getAttendanceRecords(params);
      
      setAttendanceRecords(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      message.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await hrApi.getEmployees({ limit: 1000 });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const response: PaginatedResponse<Attendance> = await hrApi.getAttendanceRecords({
        date: today,
        limit: 1000
      });
      
      const records = response.data;
      const stats = {
        present: records.filter(r => r.status === AttendanceStatus.PRESENT).length,
        absent: records.filter(r => r.status === AttendanceStatus.ABSENT).length,
        late: records.filter(r => r.status === AttendanceStatus.LATE).length,
        total: records.length
      };
      
      setTodayStats(stats);
    } catch (error) {
      console.error('Error fetching today stats:', error);
    }
  };

  const handleMarkAttendance = async (values: any) => {
    try {
      const attendanceData: CreateAttendanceDto = {
        employeeId: values.employeeId,
        date: values.date.format('YYYY-MM-DD'),
        checkInTime: values.checkInTime?.format('HH:mm') || undefined,
        checkOutTime: values.checkOutTime?.format('HH:mm') || undefined,
        status: values.status,
        notes: values.notes,
      };

      await hrApi.createAttendanceRecord(attendanceData);
      message.success('Attendance marked successfully');
      setMarkAttendanceModalVisible(false);
      form.resetFields();
      fetchAttendanceRecords();
      fetchTodayStats();
    } catch (error) {
      console.error('Error marking attendance:', error);
      message.error('Failed to mark attendance');
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'green';
      case AttendanceStatus.ABSENT:
        return 'red';
      case AttendanceStatus.LATE:
        return 'orange';
      case AttendanceStatus.HALF_DAY:
        return 'blue';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<Attendance> = [
    {
      title: 'Employee',
      dataIndex: ['employee', 'firstName'],
      key: 'employee',
      render: (_, record) => (
        <div>
          <div>{record.employee.firstName} {record.employee.lastName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.employee.employeeId}
          </div>
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Check In',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (time: string) => time || 'N/A',
    },
    {
      title: 'Check Out',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (time: string) => time || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AttendanceStatus) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => notes || 'N/A',
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
              onClick={() => router.push(`/dashboard/hr/attendance/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => router.push(`/dashboard/hr/attendance/${record.id}/edit`)}
            />
          </Tooltip>
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
    setEmployeeFilter(undefined);
    setSelectedDate(dayjs());
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>Attendance Management</Title>
        </Col>
        <Col>
          <Space>
            <Link href="/dashboard/hr/attendance/mark">
              <Button type="primary" icon={<ClockCircleOutlined />}>
                Mark Attendance
              </Button>
            </Link>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={() => setMarkAttendanceModalVisible(true)}
            >
              Quick Mark
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Today's Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Present Today"
              value={todayStats.present}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Absent Today"
              value={todayStats.absent}
              prefix={<ClockCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Late Today"
              value={todayStats.late}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={todayStats.total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={6}>
            <Input
              placeholder="Search by employee name..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by employee"
              value={employeeFilter}
              onChange={setEmployeeFilter}
              allowClear
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  ?.includes(input.toLowerCase())
              }
            >
              {employees.map(employee => (
                <Select.Option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value={AttendanceStatus.PRESENT}>Present</Select.Option>
              <Select.Option value={AttendanceStatus.ABSENT}>Absent</Select.Option>
              <Select.Option value={AttendanceStatus.LATE}>Late</Select.Option>
              <Select.Option value={AttendanceStatus.HALF_DAY}>Half Day</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              style={{ width: '100%' }}
              placeholder="Select date"
            />
          </Col>
        </Row>

        <Row style={{ marginBottom: '16px' }}>
          <Col>
            <Space>
              <Button onClick={fetchAttendanceRecords}>
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
          dataSource={attendanceRecords}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} attendance records`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Quick Mark Attendance Modal */}
      <Modal
        title="Quick Mark Attendance"
        open={markAttendanceModalVisible}
        onCancel={() => setMarkAttendanceModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleMarkAttendance}
          initialValues={{
            date: dayjs(),
            status: AttendanceStatus.PRESENT
          }}
        >
          <Form.Item
            label="Employee"
            name="employeeId"
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <Select
              placeholder="Select employee"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  ?.includes(input.toLowerCase())
              }
            >
              {employees.map(employee => (
                <Select.Option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} ({employee.employeeId})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Check In Time"
                name="checkInTime"
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Check Out Time"
                name="checkOutTime"
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Select.Option value={AttendanceStatus.PRESENT}>Present</Select.Option>
              <Select.Option value={AttendanceStatus.ABSENT}>Absent</Select.Option>
              <Select.Option value={AttendanceStatus.LATE}>Late</Select.Option>
              <Select.Option value={AttendanceStatus.HALF_DAY}>Half Day</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Notes (Optional)"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Add any notes..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setMarkAttendanceModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Mark Attendance
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}