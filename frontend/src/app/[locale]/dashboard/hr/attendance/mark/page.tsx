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
  TimePicker,
  Checkbox,
  Alert,
  Divider
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { hrApi, Employee, AttendanceStatus, CreateAttendanceDto } from '../../../../../../lib/hr-api';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface AttendanceRecord {
  employee: Employee;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  selected: boolean;
}

export default function MarkAttendancePage() {
  const router = useRouter();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<any>(dayjs());
  const [defaultCheckInTime, setDefaultCheckInTime] = useState<any>(dayjs('09:00', 'HH:mm'));
  const [defaultCheckOutTime, setDefaultCheckOutTime] = useState<any>(dayjs('17:00', 'HH:mm'));
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      initializeAttendanceRecords();
    }
  }, [employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await hrApi.getEmployees({ 
        limit: 1000,
        status: 'ACTIVE' // Only active employees
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const initializeAttendanceRecords = () => {
    const records: AttendanceRecord[] = employees.map(employee => ({
      employee,
      status: AttendanceStatus.PRESENT,
      checkInTime: defaultCheckInTime.format('HH:mm'),
      checkOutTime: defaultCheckOutTime.format('HH:mm'),
      notes: '',
      selected: false
    }));
    setAttendanceRecords(records);
  };

  const handleStatusChange = (employeeId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.employee.id === employeeId 
          ? { ...record, status }
          : record
      )
    );
  };

  const handleTimeChange = (employeeId: string, field: 'checkInTime' | 'checkOutTime', time: any) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.employee.id === employeeId 
          ? { ...record, [field]: time?.format('HH:mm') }
          : record
      )
    );
  };

  const handleNotesChange = (employeeId: string, notes: string) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.employee.id === employeeId 
          ? { ...record, notes }
          : record
      )
    );
  };

  const handleSelectChange = (employeeId: string, selected: boolean) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.employee.id === employeeId 
          ? { ...record, selected }
          : record
      )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setAttendanceRecords(prev => 
      prev.map(record => ({ ...record, selected: checked }))
    );
  };

  const applyBulkStatus = (status: AttendanceStatus) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.selected 
          ? { ...record, status }
          : record
      )
    );
  };

  const applyBulkTimes = () => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.selected 
          ? { 
              ...record, 
              checkInTime: defaultCheckInTime.format('HH:mm'),
              checkOutTime: defaultCheckOutTime.format('HH:mm')
            }
          : record
      )
    );
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      
      const attendanceData: CreateAttendanceDto[] = attendanceRecords.map(record => ({
        employeeId: record.employee.id,
        date: selectedDate.format('YYYY-MM-DD'),
        checkInTime: record.status === AttendanceStatus.ABSENT ? undefined : record.checkInTime,
        checkOutTime: record.status === AttendanceStatus.ABSENT ? undefined : record.checkOutTime,
        status: record.status,
        notes: record.notes,
      }));

      // Save attendance records in batches
      const batchSize = 10;
      for (let i = 0; i < attendanceData.length; i += batchSize) {
        const batch = attendanceData.slice(i, i + batchSize);
        await Promise.all(
          batch.map(data => hrApi.createAttendanceRecord(data))
        );
      }

      message.success(`Attendance marked successfully for ${attendanceData.length} employees`);
      router.push('/dashboard/hr/attendance');
    } catch (error) {
      console.error('Error saving attendance:', error);
      message.error('Failed to save attendance records');
    } finally {
      setSaving(false);
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

  const selectedCount = attendanceRecords.filter(r => r.selected).length;

  const columns: ColumnsType<AttendanceRecord> = [
    {
      title: (
        <Checkbox
          checked={selectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
        >
          Select All
        </Checkbox>
      ),
      key: 'select',
      width: 100,
      render: (_, record) => (
        <Checkbox
          checked={record.selected}
          onChange={(e) => handleSelectChange(record.employee.id, e.target.checked)}
        />
      ),
    },
    {
      title: 'Employee',
      key: 'employee',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.employee.firstName} {record.employee.lastName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.employee.employeeId}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.employee.department?.name}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 150,
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(value) => handleStatusChange(record.employee.id, value)}
          style={{ width: '100%' }}
        >
          <Select.Option value={AttendanceStatus.PRESENT}>
            <Tag color="green">Present</Tag>
          </Select.Option>
          <Select.Option value={AttendanceStatus.ABSENT}>
            <Tag color="red">Absent</Tag>
          </Select.Option>
          <Select.Option value={AttendanceStatus.LATE}>
            <Tag color="orange">Late</Tag>
          </Select.Option>
          <Select.Option value={AttendanceStatus.HALF_DAY}>
            <Tag color="blue">Half Day</Tag>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: 'Check In',
      key: 'checkInTime',
      width: 120,
      render: (_, record) => (
        <TimePicker
          value={record.checkInTime ? dayjs(record.checkInTime, 'HH:mm') : null}
          onChange={(time) => handleTimeChange(record.employee.id, 'checkInTime', time)}
          format="HH:mm"
          style={{ width: '100%' }}
          disabled={record.status === AttendanceStatus.ABSENT}
        />
      ),
    },
    {
      title: 'Check Out',
      key: 'checkOutTime',
      width: 120,
      render: (_, record) => (
        <TimePicker
          value={record.checkOutTime ? dayjs(record.checkOutTime, 'HH:mm') : null}
          onChange={(time) => handleTimeChange(record.employee.id, 'checkOutTime', time)}
          format="HH:mm"
          style={{ width: '100%' }}
          disabled={record.status === AttendanceStatus.ABSENT}
        />
      ),
    },
    {
      title: 'Notes',
      key: 'notes',
      render: (_, record) => (
        <Input
          value={record.notes}
          onChange={(e) => handleNotesChange(record.employee.id, e.target.value)}
          placeholder="Add notes..."
          style={{ width: '100%' }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Space>
            <Link href="/dashboard/hr/attendance">
              <Button icon={<ArrowLeftOutlined />}>
                Back to Attendance
              </Button>
            </Link>
            <Title level={2} style={{ margin: 0 }}>Mark Attendance</Title>
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveAttendance}
            loading={saving}
            size="large"
          >
            Save Attendance
          </Button>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} lg={18}>
          <Card>
            {/* Date Selection */}
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col xs={24} sm={8}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>Attendance Date:</Text>
                </div>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>Default Check In:</Text>
                </div>
                <TimePicker
                  value={defaultCheckInTime}
                  onChange={setDefaultCheckInTime}
                  format="HH:mm"
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>Default Check Out:</Text>
                </div>
                <TimePicker
                  value={defaultCheckOutTime}
                  onChange={setDefaultCheckOutTime}
                  format="HH:mm"
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>

            <Divider />

            <Table
              columns={columns}
              dataSource={attendanceRecords}
              rowKey={(record) => record.employee.id}
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} employees`,
              }}
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card title="Bulk Actions" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message={`${selectedCount} employee(s) selected`}
                type="info"
                showIcon
              />
              
              <div>
                <Text strong>Apply Status to Selected:</Text>
              </div>
              <Button
                block
                onClick={() => applyBulkStatus(AttendanceStatus.PRESENT)}
                disabled={selectedCount === 0}
              >
                Mark Present
              </Button>
              <Button
                block
                onClick={() => applyBulkStatus(AttendanceStatus.ABSENT)}
                disabled={selectedCount === 0}
              >
                Mark Absent
              </Button>
              <Button
                block
                onClick={() => applyBulkStatus(AttendanceStatus.LATE)}
                disabled={selectedCount === 0}
              >
                Mark Late
              </Button>
              <Button
                block
                onClick={() => applyBulkStatus(AttendanceStatus.HALF_DAY)}
                disabled={selectedCount === 0}
              >
                Mark Half Day
              </Button>
              
              <Divider />
              
              <Button
                block
                onClick={applyBulkTimes}
                disabled={selectedCount === 0}
              >
                Apply Default Times
              </Button>
            </Space>
          </Card>

          <Card title="Summary">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Total Employees:</Text>
                <Text strong>{attendanceRecords.length}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Present:</Text>
                <Text strong style={{ color: '#52c41a' }}>
                  {attendanceRecords.filter(r => r.status === AttendanceStatus.PRESENT).length}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Absent:</Text>
                <Text strong style={{ color: '#ff4d4f' }}>
                  {attendanceRecords.filter(r => r.status === AttendanceStatus.ABSENT).length}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Late:</Text>
                <Text strong style={{ color: '#fa8c16' }}>
                  {attendanceRecords.filter(r => r.status === AttendanceStatus.LATE).length}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Half Day:</Text>
                <Text strong style={{ color: '#1890ff' }}>
                  {attendanceRecords.filter(r => r.status === AttendanceStatus.HALF_DAY).length}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}