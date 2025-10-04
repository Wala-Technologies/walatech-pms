'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Descriptions, 
  Button, 
  Tag, 
  Space, 
  Alert, 
  Spin, 
  Row, 
  Col, 
  Typography,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Divider
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  EditOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { hrApi, LeaveApplication, LeaveApplicationStatus, ApproveLeaveApplicationDto, RejectLeaveApplicationDto } from '../../../../../../lib/hr-api';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function LeaveApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leaveId = params.id as string;

  const [leaveApplication, setLeaveApplication] = useState<LeaveApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (leaveId) {
      fetchLeaveApplication();
    }
  }, [leaveId]);

  const fetchLeaveApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await hrApi.getLeaveApplication(leaveId);
      if (response.data) {
        setLeaveApplication(response.data);
      } else {
        setError('Leave application not found');
      }
    } catch (error) {
      console.error('Error fetching leave application:', error);
      setError('Failed to load leave application details');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approved: boolean, comments: string = '') => {
    try {
      setActionLoading(true);
      
      if (approved) {
        const approvalData: ApproveLeaveApplicationDto = {
          approved_by: 'current-user', // This should be the current user's ID
          approved_date: new Date().toISOString()
        };
        await hrApi.approveLeaveApplication(leaveId, approvalData);
      } else {
        const rejectionData: RejectLeaveApplicationDto = {
          rejection_reason: comments
        };
        await hrApi.rejectLeaveApplication(leaveId, rejectionData);
      }

      message.success(`Leave application ${approved ? 'approved' : 'rejected'} successfully`);
      
      setApprovalModalVisible(false);
      setRejectionModalVisible(false);
      form.resetFields();
      
      // Refresh the data
      fetchLeaveApplication();
    } catch (error) {
      console.error('Error processing leave application:', error);
      message.error(`Failed to ${approved ? 'approve' : 'reject'} leave application`);
    } finally {
      setActionLoading(false);
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

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !leaveApplication) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error"
          description={error || 'Leave application not found'}
          type="error"
          showIcon
        />
      </div>
    );
  }

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
            <Title level={2} style={{ margin: 0 }}>Leave Application Details</Title>
          </Space>
        </Col>
        <Col>
          {leaveApplication.status === LeaveApplicationStatus.OPEN && (
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => setApprovalModalVisible(true)}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => setRejectionModalVisible(true)}
              >
                Reject
              </Button>
            </Space>
          )}
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title={
            <Space>
              <FileTextOutlined />
              <span>Application Information</span>
              <Tag color={getStatusColor(leaveApplication.status)}>
                {leaveApplication.status.toUpperCase()}
              </Tag>
            </Space>
          }>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Leave Type">
                <Text strong>{leaveApplication.leave_type}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {new Date(leaveApplication.start_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {new Date(leaveApplication.end_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Descriptions.Item>
              <Descriptions.Item label="Total Days">
                <Text strong>{leaveApplication.total_days} day(s)</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Reason">
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {leaveApplication.reason}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Applied Date">
                {new Date(leaveApplication.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
              {leaveApplication.approved_date && (
                <Descriptions.Item label="Decision Date">
                  {new Date(leaveApplication.approved_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Descriptions.Item>
              )}
              {leaveApplication.rejection_reason && (
                <Descriptions.Item label="Rejection Reason">
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {leaveApplication.rejection_reason}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={
            <Space>
              <UserOutlined />
              <span>Employee Information</span>
            </Space>
          }>
            <Descriptions column={1}>
              <Descriptions.Item label="Name">
                <Text strong>
                  {leaveApplication.employee?.name || 'N/A'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Employee Number">
                {leaveApplication.employee?.employee_number || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {leaveApplication.employee?.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {leaveApplication.employee?.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {leaveApplication.employee?.department?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Designation">
                {leaveApplication.employee?.designation?.title || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Approval Modal */}
      <Modal
        title="Approve Leave Application"
        open={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => handleApproval(true, values.comments)}
        >
          <Alert
            message="Approve Leave Application"
            description="You are about to approve this leave application. You can add optional comments below."
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Form.Item
            label="Comments (Optional)"
            name="comments"
          >
            <TextArea
              rows={3}
              placeholder="Add any comments for the employee..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setApprovalModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={actionLoading}
                icon={<CheckOutlined />}
              >
                Approve Application
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        title="Reject Leave Application"
        open={rejectionModalVisible}
        onCancel={() => setRejectionModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => handleApproval(false, values.comments)}
        >
          <Alert
            message="Reject Leave Application"
            description="You are about to reject this leave application. Please provide a reason for rejection."
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Form.Item
            label="Reason for Rejection"
            name="comments"
            rules={[{ required: true, message: 'Please provide a reason for rejection' }]}
          >
            <TextArea
              rows={3}
              placeholder="Please provide a clear reason for rejecting this application..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setRejectionModalVisible(false)}>
                Cancel
              </Button>
              <Button
                danger
                htmlType="submit"
                loading={actionLoading}
                icon={<CloseOutlined />}
              >
                Reject Application
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}