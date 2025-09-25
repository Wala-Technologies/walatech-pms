'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Alert,
  Spin,
  Row,
  Col,
  Typography,
  Divider,
} from 'antd';
import {
  EditOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { hrApi, Employee, EmployeeStatus } from '../../../../../../lib/hr-api';

const { Title, Text } = Typography;

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const locale = params.locale as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await hrApi.getEmployee(employeeId);
      if (response.data) {
        setEmployee(response.data);
      } else {
        setError('Employee not found');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      setError('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE:
        return 'green';
      case EmployeeStatus.INACTIVE:
        return 'orange';
      case EmployeeStatus.TERMINATED:
        return 'red';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatSalary = (salary?: number) => {
    if (!salary) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(salary);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error"
          description={error || 'Employee not found'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchEmployee}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: '16px' }}
        >
          Back to Employees
        </Button>
        
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              {employee.employee_name}
            </Title>
            <Text type="secondary">Employee ID: {employee.employee_number}</Text>
          </Col>
          <Col>
            <Space>
              <Link href={`/${locale}/dashboard/hr/employees/${employee.id}/edit`}>
                <Button type="primary" icon={<EditOutlined />}>
                  Edit Employee
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        {/* Basic Information */}
        <Col xs={24} lg={12}>
          <Card title="Basic Information" bordered={false}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Display Name">
                <Space>
                  <UserOutlined />
                  {employee.employee_name}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="System Name">
                {employee.name}
              </Descriptions.Item>
              
              <Descriptions.Item label="Email">
                <Space>
                  <MailOutlined />
                  <a href={`mailto:${employee.email}`}>{employee.email}</a>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Phone">
                <Space>
                  <PhoneOutlined />
                  {employee.phone || 'Not provided'}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Date of Birth">
                <Space>
                  <CalendarOutlined />
                  {employee.date_of_birth ? formatDate(employee.date_of_birth) : 'Not provided'}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Address">
                {employee.address || 'Not provided'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Employment Information */}
        <Col xs={24} lg={12}>
          <Card title="Employment Information" bordered={false}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(employee.status)}>{employee.status}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Date of Joining">
                <Space>
                  <CalendarOutlined />
                  {formatDate(employee.date_of_joining)}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Department">
                {employee.department?.name || 'Not assigned'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Designation">
                {employee.designation?.title || 'Not assigned'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Salary">
                <Space>
                  <DollarOutlined />
                  {formatSalary(employee.salary)}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* System Information */}
        <Col xs={24}>
          <Card title="System Information" bordered={false}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Created At">
                {formatDate(employee.createdAt)}
              </Descriptions.Item>
              
              <Descriptions.Item label="Last Updated">
                {formatDate(employee.updatedAt)}
              </Descriptions.Item>
              
              <Descriptions.Item label="Active Status">
                <Tag color={employee.isActive ? 'green' : 'red'}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginTop: '24px' }}>
        <Space wrap>
          <Link href={`/${locale}/dashboard/hr/leave-applications/new?employeeId=${employee.id}`}>
            <Button>Apply for Leave</Button>
          </Link>
          <Link href={`/${locale}/dashboard/hr/attendance/mark?employeeId=${employee.id}`}>
            <Button>Mark Attendance</Button>
          </Link>
          <Link href={`/${locale}/dashboard/hr/attendance?employeeId=${employee.id}`}>
            <Button>View Attendance History</Button>
          </Link>
          <Link href={`/${locale}/dashboard/hr/leave-applications?employeeId=${employee.id}`}>
            <Button>View Leave History</Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
}