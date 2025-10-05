'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Tag,
  Breadcrumb,
  Row,
  Col,
  Statistic,
  Typography,
  Tooltip,
  Dropdown,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  DownloadOutlined,
  SendOutlined,
  HomeOutlined,
  TruckOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface QuotationItem {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
}

interface SupplierQuotation {
  id: string;
  quotationNumber: string;
  supplierName: string;
  supplierId: string;
  requestDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'received' | 'under_review' | 'approved' | 'rejected' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  totalAmount?: number;
  currency: string;
  items: QuotationItem[];
  notes?: string;
  createdBy: string;
  responseDate?: string;
}

export default function SupplierQuotationsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = useTranslations('suppliers');
  const tCommon = useTranslations('common');

  const [loading, setLoading] = useState(false);
  const [quotations, setQuotations] = useState<SupplierQuotation[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<SupplierQuotation | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [form] = Form.useForm();

  // Mock data for development
  const mockQuotations: SupplierQuotation[] = [
    {
      id: '1',
      quotationNumber: 'RFQ-2024-001',
      supplierName: 'Steel Corp Ltd',
      supplierId: '1',
      requestDate: '2024-01-15',
      dueDate: '2024-01-25',
      status: 'received',
      priority: 'high',
      totalAmount: 15000,
      currency: 'USD',
      items: [
        {
          id: '1',
          itemName: 'Steel Plates',
          description: 'High-grade steel plates 10mm thickness',
          quantity: 100,
          unit: 'pcs',
          unitPrice: 150,
          totalPrice: 15000,
        },
      ],
      notes: 'Urgent requirement for production',
      createdBy: 'John Doe',
      responseDate: '2024-01-20',
    },
    {
      id: '2',
      quotationNumber: 'RFQ-2024-002',
      supplierName: 'Component Solutions',
      supplierId: '2',
      requestDate: '2024-01-18',
      dueDate: '2024-01-28',
      status: 'sent',
      priority: 'medium',
      currency: 'USD',
      items: [
        {
          id: '1',
          itemName: 'Electronic Components',
          description: 'Various electronic components for assembly',
          quantity: 500,
          unit: 'pcs',
        },
      ],
      notes: 'Standard procurement request',
      createdBy: 'Jane Smith',
    },
    {
      id: '3',
      quotationNumber: 'RFQ-2024-003',
      supplierName: 'Packaging Pro',
      supplierId: '3',
      requestDate: '2024-01-20',
      dueDate: '2024-01-30',
      status: 'under_review',
      priority: 'low',
      totalAmount: 5000,
      currency: 'USD',
      items: [
        {
          id: '1',
          itemName: 'Packaging Materials',
          description: 'Cardboard boxes and protective materials',
          quantity: 1000,
          unit: 'pcs',
          unitPrice: 5,
          totalPrice: 5000,
        },
      ],
      createdBy: 'Mike Johnson',
      responseDate: '2024-01-22',
    },
  ];

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQuotations(mockQuotations);
    } catch (error) {
      message.error('Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingQuotation(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleView = (quotation: SupplierQuotation) => {
    router.push(`/${locale}/dashboard/suppliers/quotations/${quotation.id}`);
  };

  const handleEdit = (quotation: SupplierQuotation) => {
    setEditingQuotation(quotation);
    form.setFieldsValue({
      ...quotation,
      requestDate: dayjs(quotation.requestDate),
      dueDate: dayjs(quotation.dueDate),
    });
    setIsModalVisible(true);
  };

  const handleStatusChange = async (quotationId: string, newStatus: string) => {
    try {
      setQuotations(prev => prev.map(q => 
        q.id === quotationId ? { ...q, status: newStatus as any } : q
      ));
      message.success('Quotation status updated successfully');
    } catch (error) {
      message.error('Failed to update quotation status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'default',
      sent: 'blue',
      received: 'green',
      under_review: 'orange',
      approved: 'success',
      rejected: 'error',
      expired: 'default',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      urgent: 'magenta',
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                         quotation.supplierName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || quotation.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const columns = [
    {
      title: 'Quotation Number',
      dataIndex: 'quotationNumber',
      key: 'quotationNumber',
      render: (text: string, record: SupplierQuotation) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.supplierName}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => {
        const isOverdue = dayjs(date).isBefore(dayjs()) && !['received', 'approved'].includes('status');
        return (
          <span className={isOverdue ? 'text-red-500' : ''}>
            {date}
          </span>
        );
      },
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number, record: SupplierQuotation) => 
        amount ? `${record.currency} ${amount.toLocaleString()}` : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SupplierQuotation) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'send',
                  label: 'Send to Supplier',
                  icon: <SendOutlined />,
                  onClick: () => handleStatusChange(record.id, 'sent'),
                },
                {
                  key: 'approve',
                  label: 'Approve',
                  onClick: () => handleStatusChange(record.id, 'approved'),
                },
                {
                  key: 'reject',
                  label: 'Reject',
                  onClick: () => handleStatusChange(record.id, 'rejected'),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<DownloadOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const totalQuotations = quotations.length;
  const pendingQuotations = quotations.filter(q => ['sent', 'under_review'].includes(q.status)).length;
  const approvedQuotations = quotations.filter(q => q.status === 'approved').length;
  const totalValue = quotations
    .filter(q => q.totalAmount)
    .reduce((sum, q) => sum + (q.totalAmount || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item>
            <Link href={`/${locale}/dashboard`}>
              <HomeOutlined /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href={`/${locale}/dashboard/suppliers`}>
              <TruckOutlined /> Suppliers
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Quotations</Breadcrumb.Item>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="mb-2">Supplier Quotations</Title>
            <Text type="secondary">Manage quotation requests and responses</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            New Quotation
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Quotations"
              value={totalQuotations}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending"
              value={pendingQuotations}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Approved"
              value={approvedQuotations}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Value"
              value={totalValue}
              prefix="$"
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search quotations..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              <Option value="draft">Draft</Option>
              <Option value="sent">Sent</Option>
              <Option value="received">Received</Option>
              <Option value="under_review">Under Review</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="expired">Expired</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by priority"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Priority</Option>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="urgent">Urgent</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Quotations Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredQuotations}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} quotations`,
          }}
        />
      </Card>

      {/* Quotation Form Modal */}
      <Modal
        title={editingQuotation ? 'Edit Quotation' : 'Create New Quotation'}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form 
          form={form} 
          layout="vertical"
          onFinish={(values) => {
            console.log('Form values:', values);
            message.success('Quotation saved successfully');
            setIsModalVisible(false);
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quotationNumber"
                label="Quotation Number"
                rules={[{ required: true, message: 'Please enter quotation number' }]}
              >
                <Input placeholder="RFQ-2024-XXX" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplierId"
                label="Supplier"
                rules={[{ required: true, message: 'Please select supplier' }]}
              >
                <Select placeholder="Select supplier">
                  <Option value="1">Steel Corp Ltd</Option>
                  <Option value="2">Component Solutions</Option>
                  <Option value="3">Packaging Pro</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="requestDate"
                label="Request Date"
                rules={[{ required: true, message: 'Please select request date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: true, message: 'Please select due date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select placeholder="Select priority">
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="urgent">Urgent</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="currency"
                label="Currency"
                rules={[{ required: true, message: 'Please select currency' }]}
              >
                <Select placeholder="Select currency">
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                  <Option value="GBP">GBP</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea 
              placeholder="Additional notes or requirements" 
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}