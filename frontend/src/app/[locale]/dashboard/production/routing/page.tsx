'use client';

import React from 'react';
import { Card, Table, Tag, Space, Button, Input, Modal, Form, Select, InputNumber, message, Descriptions } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface RoutingStep {
  key: string;
  stepNumber: number;
  operation: string;
  workCenter: string;
  setupTime: number;
  runTime: number;
  description: string;
  skillRequired: string;
}

interface Routing {
  key: string;
  routingCode: string;
  productName: string;
  version: string;
  status: 'Active' | 'Draft' | 'Obsolete';
  totalTime: number;
  steps: RoutingStep[];
  createdDate: string;
  createdBy: string;
}

const mockData: Routing[] = [
  {
    key: '1',
    routingCode: 'RT001',
    productName: 'Steel Frame Assembly',
    version: '1.0',
    status: 'Active',
    totalTime: 180,
    steps: [
      {
        key: '1-1',
        stepNumber: 10,
        operation: 'Cut Steel Rods',
        workCenter: 'Cutting Station A',
        setupTime: 15,
        runTime: 30,
        description: 'Cut steel rods to specified lengths using plasma cutter',
        skillRequired: 'Cutting Operator',
      },
      {
        key: '1-2',
        stepNumber: 20,
        operation: 'Weld Frame',
        workCenter: 'Welding Station B',
        setupTime: 20,
        runTime: 45,
        description: 'Weld steel rods together to form frame structure',
        skillRequired: 'Certified Welder',
      },
      {
        key: '1-3',
        stepNumber: 30,
        operation: 'Quality Check',
        workCenter: 'QC Station',
        setupTime: 5,
        runTime: 15,
        description: 'Inspect welded frame for quality and dimensional accuracy',
        skillRequired: 'QC Inspector',
      },
    ],
    createdDate: '2024-01-10',
    createdBy: 'John Engineer',
  },
  {
    key: '2',
    routingCode: 'RT002',
    productName: 'Aluminum Panel',
    version: '2.1',
    status: 'Active',
    totalTime: 120,
    steps: [
      {
        key: '2-1',
        stepNumber: 10,
        operation: 'Cut Aluminum Sheet',
        workCenter: 'CNC Cutting',
        setupTime: 10,
        runTime: 25,
        description: 'Cut aluminum sheet to required dimensions',
        skillRequired: 'CNC Operator',
      },
      {
        key: '2-2',
        stepNumber: 20,
        operation: 'Bend Edges',
        workCenter: 'Press Brake',
        setupTime: 15,
        runTime: 20,
        description: 'Bend edges of aluminum panel to specifications',
        skillRequired: 'Press Operator',
      },
    ],
    createdDate: '2024-01-08',
    createdBy: 'Jane Designer',
  },
  {
    key: '3',
    routingCode: 'RT003',
    productName: 'Motor Housing',
    version: '1.5',
    status: 'Draft',
    totalTime: 240,
    steps: [],
    createdDate: '2024-01-12',
    createdBy: 'Mike Engineer',
  },
];

export default function RoutingPage() {
  const [loading, setLoading] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isStepsModalVisible, setIsStepsModalVisible] = React.useState(false);
  const [editingRouting, setEditingRouting] = React.useState<Routing | null>(null);
  const [viewingRouting, setViewingRouting] = React.useState<Routing | null>(null);
  const [form] = Form.useForm();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'green';
      case 'Draft':
        return 'orange';
      case 'Obsolete':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Routing Code',
      dataIndex: 'routingCode',
      key: 'routingCode',
      sorter: (a: Routing, b: Routing) => a.routingCode.localeCompare(b.routingCode),
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a: Routing, b: Routing) => a.productName.localeCompare(b.productName),
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
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
      title: 'Total Time',
      dataIndex: 'totalTime',
      key: 'totalTime',
      sorter: (a: Routing, b: Routing) => a.totalTime - b.totalTime,
      render: (value: number) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {value} min
        </span>
      ),
    },
    {
      title: 'Steps Count',
      key: 'stepsCount',
      render: (record: Routing) => record.steps.length,
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      sorter: (a: Routing, b: Routing) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Routing) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewSteps(record)}
          >
            View Steps
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.key)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const stepsColumns = [
    {
      title: 'Step',
      dataIndex: 'stepNumber',
      key: 'stepNumber',
      width: 80,
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      key: 'operation',
    },
    {
      title: 'Work Center',
      dataIndex: 'workCenter',
      key: 'workCenter',
    },
    {
      title: 'Setup Time',
      dataIndex: 'setupTime',
      key: 'setupTime',
      render: (value: number) => `${value} min`,
    },
    {
      title: 'Run Time',
      dataIndex: 'runTime',
      key: 'runTime',
      render: (value: number) => `${value} min`,
    },
    {
      title: 'Total Time',
      key: 'totalTime',
      render: (record: RoutingStep) => `${record.setupTime + record.runTime} min`,
    },
    {
      title: 'Skill Required',
      dataIndex: 'skillRequired',
      key: 'skillRequired',
    },
  ];

  const handleEdit = (routing: Routing) => {
    setEditingRouting(routing);
    form.setFieldsValue(routing);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this routing?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        message.success('Routing deleted successfully');
      },
    });
  };

  const handleAdd = () => {
    setEditingRouting(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleViewSteps = (routing: Routing) => {
    setViewingRouting(routing);
    setIsStepsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(() => {
      setIsModalVisible(false);
      message.success(editingRouting ? 'Routing updated successfully' : 'Routing created successfully');
    });
  };

  const filteredData = mockData.filter(routing => {
    const matchesSearch = routing.productName.toLowerCase().includes(searchText.toLowerCase()) ||
                         routing.routingCode.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || routing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Production Routing</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Create Routing
          </Button>
        </div>
        
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
          <Search
            placeholder="Search routings..."
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">All Status</Option>
            <Option value="Active">Active</Option>
            <Option value="Draft">Draft</Option>
            <Option value="Obsolete">Obsolete</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} routings`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Routing Form Modal */}
      <Modal
        title={editingRouting ? 'Edit Routing' : 'Create New Routing'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="routingCode"
            label="Routing Code"
            rules={[{ required: true, message: 'Please enter routing code' }]}
          >
            <Input placeholder="e.g., RT001" />
          </Form.Item>
          <Form.Item
            name="productName"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="e.g., Steel Frame Assembly" />
          </Form.Item>
          <Form.Item
            name="version"
            label="Version"
            rules={[{ required: true, message: 'Please enter version' }]}
          >
            <Input placeholder="e.g., 1.0" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="Active">Active</Option>
              <Option value="Draft">Draft</Option>
              <Option value="Obsolete">Obsolete</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="totalTime"
            label="Total Time (minutes)"
            rules={[{ required: true, message: 'Please enter total time' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0"
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Routing Steps Modal */}
      <Modal
        title={`Routing Steps - ${viewingRouting?.routingCode} (${viewingRouting?.productName})`}
        open={isStepsModalVisible}
        onCancel={() => setIsStepsModalVisible(false)}
        footer={null}
        width={1200}
      >
        {viewingRouting && (
          <div>
            <Descriptions
              bordered
              size="small"
              style={{ marginBottom: 16 }}
              items={[
                {
                  key: 'routingCode',
                  label: 'Routing Code',
                  children: viewingRouting.routingCode,
                },
                {
                  key: 'version',
                  label: 'Version',
                  children: viewingRouting.version,
                },
                {
                  key: 'status',
                  label: 'Status',
                  children: <Tag color={getStatusColor(viewingRouting.status)}>{viewingRouting.status}</Tag>,
                },
                {
                  key: 'totalTime',
                  label: 'Total Time',
                  children: `${viewingRouting.totalTime} minutes`,
                },
              ]}
            />
            <Table
              columns={stepsColumns}
              dataSource={viewingRouting.steps}
              pagination={false}
              size="small"
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ margin: 0 }}>
                    <strong>Description:</strong> {record.description}
                  </div>
                ),
                rowExpandable: (record) => !!record.description,
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}