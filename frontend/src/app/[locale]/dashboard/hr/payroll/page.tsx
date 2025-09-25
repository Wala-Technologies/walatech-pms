'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Select,
  DatePicker,
  Statistic,
  Tag,
  message,
  Spin,
  Alert,
} from 'antd';
import {
  DollarOutlined,
  DownloadOutlined,
  PlusOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import { hrApi, Employee } from '../../../../../lib/hr-api';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface PayrollRecord {
  id: string;
  employeeId: string;
  employee: Employee;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  status: 'Draft' | 'Processed' | 'Paid';
  processedDate?: string;
  paidDate?: string;
}

export default function PayrollPage() {
  const params = useParams();
  const locale = params.locale as string;
  
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>();

  // Mock payroll statistics
  const [stats, setStats] = useState({
    totalEmployees: 0,
    processedPayrolls: 0,
    pendingPayrolls: 0,
    totalPayrollAmount: 0,
  });

  useEffect(() => {
    fetchEmployees();
    generateMockPayrollData();
  }, [selectedMonth, selectedYear]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await hrApi.getEmployees({ limit: 1000, isActive: true });
      if (response.data) {
        setEmployees(response.data.employees || []);
        setStats(prev => ({ ...prev, totalEmployees: response.data.employees?.length || 0 }));
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // Generate mock payroll data for demonstration
  const generateMockPayrollData = () => {
    const mockRecords: PayrollRecord[] = employees.map((employee, index) => ({
      id: `payroll-${employee.id}-${selectedYear}-${selectedMonth}`,
      employeeId: employee.id,
      employee,
      month: selectedMonth,
      year: selectedYear,
      basicSalary: employee.salary || 50000,
      allowances: (employee.salary || 50000) * 0.2,
      deductions: (employee.salary || 50000) * 0.15,
      grossPay: (employee.salary || 50000) * 1.2,
      netPay: (employee.salary || 50000) * 1.05,
      status: index % 3 === 0 ? 'Paid' : index % 3 === 1 ? 'Processed' : 'Draft',
      processedDate: index % 3 !== 2 ? dayjs().subtract(5, 'days').format('YYYY-MM-DD') : undefined,
      paidDate: index % 3 === 0 ? dayjs().subtract(2, 'days').format('YYYY-MM-DD') : undefined,
    }));

    setPayrollRecords(mockRecords);
    
    // Update statistics
    const processed = mockRecords.filter(r => r.status === 'Processed' || r.status === 'Paid').length;
    const pending = mockRecords.filter(r => r.status === 'Draft').length;
    const totalAmount = mockRecords.reduce((sum, r) => sum + r.netPay, 0);
    
    setStats(prev => ({
      ...prev,
      processedPayrolls: processed,
      pendingPayrolls: pending,
      totalPayrollAmount: totalAmount,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'green';
      case 'Processed': return 'blue';
      case 'Draft': return 'orange';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleProcessPayroll = () => {
    message.info('Payroll processing functionality will be implemented soon');
  };

  const handleGeneratePayslips = () => {
    message.info('Payslip generation functionality will be implemented soon');
  };

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (record: PayrollRecord) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.employee.employee_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.employee.employee_number}
          </div>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: ['employee', 'department', 'name'],
      key: 'department',
      render: (text: string) => text || '-',
    },
    {
      title: 'Basic Salary',
      dataIndex: 'basicSalary',
      key: 'basicSalary',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Allowances',
      dataIndex: 'allowances',
      key: 'allowances',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Deductions',
      dataIndex: 'deductions',
      key: 'deductions',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Net Pay',
      dataIndex: 'netPay',
      key: 'netPay',
      render: (amount: number) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>
          {formatCurrency(amount)}
        </span>
      ),
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
      title: 'Actions',
      key: 'actions',
      render: (record: PayrollRecord) => (
        <Space>
          <Button size="small" icon={<FileTextOutlined />}>
            View
          </Button>
          <Button size="small" icon={<DownloadOutlined />}>
            Download
          </Button>
        </Space>
      ),
    },
  ];

  const filteredRecords = selectedEmployee 
    ? payrollRecords.filter(record => record.employeeId === selectedEmployee)
    : payrollRecords;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>Payroll Management</Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleGeneratePayslips}>
                Generate Payslips
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleProcessPayroll}>
                Process Payroll
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={stats.totalEmployees}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Processed Payrolls"
              value={stats.processedPayrolls}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Payrolls"
              value={stats.pendingPayrolls}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Payroll Amount"
              value={stats.totalPayrollAmount}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={4}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Month:
            </label>
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              style={{ width: '100%' }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <Option key={i + 1} value={i + 1}>
                  {dayjs().month(i).format('MMMM')}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Year:
            </label>
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ width: '100%' }}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = dayjs().year() - 2 + i;
                return (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                );
              })}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Employee:
            </label>
            <Select
              placeholder="All Employees"
              allowClear
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              style={{ width: '100%' }}
            >
              {employees.map((employee) => (
                <Option key={employee.id} value={employee.id}>
                  {employee.employee_name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Notice */}
      <Alert
        message="Development Notice"
        description="This is a placeholder payroll page. Full payroll functionality including salary calculations, tax deductions, and payment processing will be implemented in future updates."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      {/* Payroll Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} payroll records`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}