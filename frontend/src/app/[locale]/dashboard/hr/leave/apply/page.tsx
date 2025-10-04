'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  message, 
  Row, 
  Col, 
  Typography,
  Space,
  Alert,
  Divider
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { hrApi, CreateLeaveApplicationDto, Employee } from '../../../../../../lib/hr-api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const leaveTypes = [
  'Annual Leave',
  'Sick Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Emergency Leave',
  'Casual Leave',
  'Study Leave',
  'Bereavement Leave',
  'Unpaid Leave'
];

export default function ApplyLeavePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDates, setSelectedDates] = useState<[any, any] | null>(null);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedDates && selectedDates[0] && selectedDates[1]) {
      const start = dayjs(selectedDates[0]);
      const end = dayjs(selectedDates[1]);
      const days = end.diff(start, 'day') + 1;
      setTotalDays(days);
      form.setFieldsValue({ totalDays: days });
    } else {
      setTotalDays(0);
      form.setFieldsValue({ totalDays: 0 });
    }
  }, [selectedDates, form]);

  const fetchEmployees = async () => {
    try {
      const response = await hrApi.getEmployees({ limit: 1000 });
      setEmployees(response.data?.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Failed to fetch employees');
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      const leaveData: CreateLeaveApplicationDto = {
        employeeId: values.employeeId,
        leave_type: values.leaveType,
        start_date: values.dateRange[0].format('YYYY-MM-DD'),
        end_date: values.dateRange[1].format('YYYY-MM-DD'),
        reason: values.reason,
      };

      await hrApi.createLeaveApplication(leaveData);
      message.success('Leave application submitted successfully');
      router.push('/dashboard/hr/leave');
    } catch (error) {
      console.error('Error submitting leave application:', error);
      message.error('Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current: any) => {
    // Disable past dates
    return current && current < dayjs().startOf('day');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Space>
            <Link href="/dashboard/hr/leave">
              <Button icon={<ArrowLeftOutlined />}>
                Back to Leave Applications
              </Button>
            </Link>
            <Title level={2} style={{ margin: 0 }}>Apply for Leave</Title>
          </Space>
        </Col>
      </Row>

      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card>
            <Alert
              message="Leave Application Guidelines"
              description="Please ensure you apply for leave at least 3 days in advance for planned leave. For emergency leave, please contact your supervisor immediately."
              type="info"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
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
                      {employee.name} ({employee.employee_number})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Leave Type"
                name="leaveType"
                rules={[{ required: true, message: 'Please select leave type' }]}
              >
                <Select placeholder="Select leave type">
                  {leaveTypes.map(type => (
                    <Select.Option key={type} value={type}>
                      {type}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Leave Duration"
                name="dateRange"
                rules={[{ required: true, message: 'Please select leave dates' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
                  onChange={setSelectedDates}
                />
              </Form.Item>

              <Form.Item
                label="Total Days"
                name="totalDays"
              >
                <Input
                  readOnly
                  value={totalDays}
                  suffix="days"
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </Form.Item>

              <Divider />

              <Form.Item
                label="Reason for Leave"
                name="reason"
                rules={[{ required: true, message: 'Please provide reason for leave' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Please provide detailed reason for your leave application..."
                />
              </Form.Item>

              <Form.Item
                label="Emergency Contact (Optional)"
                name="emergencyContact"
              >
                <Input placeholder="Emergency contact number during leave" />
              </Form.Item>

              <Form.Item style={{ marginTop: '32px' }}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Link href="/dashboard/hr/leave">
                    <Button>Cancel</Button>
                  </Link>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Submit Application
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}