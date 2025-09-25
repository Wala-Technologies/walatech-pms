'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Tag, Space, Typography, Alert } from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { hrApi, Employee, LeaveApplication, Attendance, EmployeeStatus, LeaveApplicationStatus, AttendanceStatus } from '../../../../lib/hr-api';

const { Title, Text } = Typography;

export default function HRDashboard() {
  const params = useParams();
  const locale = params.locale as string;
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaveApplications: 0,
    todayAttendance: 0,
  });
  const [recentLeaveApplications, setRecentLeaveApplications] = useState<LeaveApplication[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch employees
      const employeesResponse = await hrApi.getEmployees({ limit: 1000 });
      const employees = employeesResponse.data?.employees || [];
      
      // Fetch recent leave applications
      const leaveResponse = await hrApi.getLeaveApplications({ limit: 5 });
      const leaveApplications = leaveResponse.data || [];
      
      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const attendanceResponse = await hrApi.getAttendance({ date: today, limit: 100 });
      const attendance = attendanceResponse.data?.attendance || [];

      // Calculate statistics
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter(emp => emp.status === EmployeeStatus.ACTIVE).length;
      const pendingLeaveApplications = leaveApplications.filter(
        app => app.status === LeaveApplicationStatus.OPEN
      ).length;
      const todayAttendanceCount = attendance.filter(
        att => att.status === AttendanceStatus.PRESENT
      ).length;

      setStats({
        totalEmployees,
        activeEmployees,
        pendingLeaveApplications,
        todayAttendance: todayAttendanceCount,
      });

      setRecentLeaveApplications(leaveApplications.slice(0, 5));
      setTodayAttendance(attendance.slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLeaveStatusColor = (status: LeaveApplicationStatus) => {
    switch (status) {
      case LeaveApplicationStatus.APPROVED:
        return 'green';
      case LeaveApplicationStatus.REJECTED:
        return 'red';
      case LeaveApplicationStatus.OPEN:
        return 'blue';
      case LeaveApplicationStatus.DRAFT:
        return 'orange';
      case LeaveApplicationStatus.CANCELLED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getAttendanceStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'green';
      case AttendanceStatus.ABSENT:
        return 'red';
      case AttendanceStatus.HALF_DAY:
        return 'orange';
      case AttendanceStatus.LATE:
        return 'yellow';
      case AttendanceStatus.ON_LEAVE:
        return 'blue';
      default:
        return 'default';
    }
  };

  const leaveColumns = [
    {
      title: 'Employee',
      dataIndex: ['employee', 'employee_name'],
      key: 'employee',
      render: (text: string, record: LeaveApplication) => 
        record.employee?.employee_name || 'Unknown Employee',
    },
    {
      title: 'Leave Type',
      dataIndex: 'leave_type',
      key: 'leave_type',
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (record: LeaveApplication) => 
        `${record.start_date} to ${record.end_date} (${record.total_days} days)`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: LeaveApplicationStatus) => (
        <Tag color={getLeaveStatusColor(status)}>{status}</Tag>
      ),
    },
  ];

  const attendanceColumns = [
    {
      title: 'Employee',
      dataIndex: ['employee', 'employee_name'],
      key: 'employee',
      render: (text: string, record: Attendance) => 
        record.employee?.employee_name || 'Unknown Employee',
    },
    {
      title: 'Check In',
      dataIndex: 'check_in_time',
      key: 'check_in_time',
      render: (time: string) => time || '-',
    },
    {
      title: 'Check Out',
      dataIndex: 'check_out_time',
      key: 'check_out_time',
      render: (time: string) => time || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AttendanceStatus) => (
        <Tag color={getAttendanceStatusColor(status)}>{status}</Tag>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>HR Dashboard</Title>
        <Text type="secondary">Overview of human resources management</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={stats.totalEmployees}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Employees"
              value={stats.activeEmployees}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Leave Requests"
              value={stats.pendingLeaveApplications}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Attendance"
              value={stats.todayAttendance}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Link href={`/${locale}/dashboard/hr/employees/new`}>
            <Button type="primary" icon={<UserAddOutlined />}>
              Add New Employee
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/hr/leave-applications/new`}>
            <Button icon={<FileTextOutlined />}>
              Apply for Leave
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/hr/attendance/mark`}>
            <Button icon={<CalendarOutlined />}>
              Mark Attendance
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/hr/employees`}>
            <Button icon={<TeamOutlined />}>
              View All Employees
            </Button>
          </Link>
        </Space>
      </Card>

      {/* Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Leave Applications" 
            extra={
              <Link href={`/${locale}/dashboard/hr/leave-applications`}>
                <Button type="link">View All</Button>
              </Link>
            }
          >
            <Table
              dataSource={recentLeaveApplications}
              columns={leaveColumns}
              pagination={false}
              loading={loading}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Today's Attendance" 
            extra={
              <Link href={`/${locale}/dashboard/hr/attendance`}>
                <Button type="link">View All</Button>
              </Link>
            }
          >
            <Table
              dataSource={todayAttendance}
              columns={attendanceColumns}
              pagination={false}
              loading={loading}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}