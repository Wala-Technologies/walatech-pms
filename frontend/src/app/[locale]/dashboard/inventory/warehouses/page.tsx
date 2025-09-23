'use client';

import React from 'react';
import { Card, Table, Tag, Space, Button, Input, Modal, Form, Select, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

interface Warehouse {
  key: string;
  code: string;
  name: string;
  location: string;
  manager: string;
  capacity: number;
  currentUtilization: number;
  status: 'Active' | 'Inactive' | 'Maintenance';
  type: 'Main' | 'Secondary' | 'Transit';
  createdDate: string;
}

const mockData: Warehouse[] = [
  {
    key: '1',
    code: 'WH001',
    name: 'Main Warehouse',
    location: 'Addis Ababa, Ethiopia',
    manager: 'John Doe',
    capacity: 10000,
    currentUtilization: 7500,
    status: 'Active',
    type: 'Main',
    createdDate: '2023-01-15',
  },
  {
    key: '2',
    code: 'WH002',
    name: 'Secondary Warehouse',
    location: 'Dire Dawa, Ethiopia',
    manager: 'Jane Smith',
    capacity: 5000,
    currentUtilization: 3200,
    status: 'Active',
    type: 'Secondary',
    createdDate: '2023-03-20',
  },
  {
    key: '3',
    code: 'WH003',
    name: 'Transit Hub',
    location: 'Hawassa, Ethiopia',
    manager: 'Mike Johnson',
    capacity: 2000,
    currentUtilization: 800,
    status: 'Maintenance',
    type: 'Transit',
    createdDate: '2023-06-10',
  },
];

export default function WarehousesPage() {
  const [loading, setLoading] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [editingWarehouse, setEditingWarehouse] = React.useState<Warehouse | null>(null);
  const [form] = Form.useForm();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'green';
      case 'Inactive':
        return 'red';
      case 'Maintenance':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Main':
        return 'blue';
      case 'Secondary':
        return 'cyan';
      case 'Transit':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getUtilizationColor = (utilization: number, capacity: number) => {
    const percentage = (utilization / capacity) * 100;
    if (percentage >= 90) return '#ff4d4f';
    if (percentage >= 70) return '#faad14';
    return '#52c41a';
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a: Warehouse, b: Warehouse) => a.code.localeCompare(b.code),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Warehouse, b: Warehouse) => a.name.localeCompare(b.name),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Manager',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      sorter: (a: Warehouse, b: Warehouse) => a.capacity - b.capacity,
      render: (value: number) => `${value.toLocaleString()} m³`,
    },
    {
      title: 'Utilization',
      key: 'utilization',
      sorter: (a: Warehouse, b: Warehouse) => (a.currentUtilization / a.capacity) - (b.currentUtilization / b.capacity),
      render: (record: Warehouse) => {
        const percentage = ((record.currentUtilization / record.capacity) * 100).toFixed(1);
        return (
          <div>
            <div style={{ color: getUtilizationColor(record.currentUtilization, record.capacity) }}>
              {record.currentUtilization.toLocaleString()} / {record.capacity.toLocaleString()} m³
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {percentage}% utilized
            </div>
          </div>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{type}</Tag>
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
      render: (record: Warehouse) => (
        <Space>
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

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    form.setFieldsValue(warehouse);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this warehouse?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        message.success('Warehouse deleted successfully');
      },
    });
  };

  const handleAdd = () => {
    setEditingWarehouse(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(() => {
      setIsModalVisible(false);
      message.success(editingWarehouse ? 'Warehouse updated successfully' : 'Warehouse created successfully');
    });
  };

  const filteredData = mockData.filter(warehouse => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         warehouse.code.toLowerCase().includes(searchText.toLowerCase()) ||
                         warehouse.location.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || warehouse.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Warehouses</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Warehouse
          </Button>
        </div>
        
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
          <Search
            placeholder="Search warehouses..."
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
            <Option value="Inactive">Inactive</Option>
            <Option value="Maintenance">Maintenance</Option>
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} warehouses`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="Warehouse Code"
            rules={[{ required: true, message: 'Please enter warehouse code' }]}
          >
            <Input placeholder="e.g., WH001" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Warehouse Name"
            rules={[{ required: true, message: 'Please enter warehouse name' }]}
          >
            <Input placeholder="e.g., Main Warehouse" />
          </Form.Item>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input placeholder="e.g., Addis Ababa, Ethiopia" />
          </Form.Item>
          <Form.Item
            name="manager"
            label="Manager"
            rules={[{ required: true, message: 'Please enter manager name' }]}
          >
            <Input placeholder="e.g., John Doe" />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Capacity (m³)"
            rules={[{ required: true, message: 'Please enter capacity' }]}
          >
            <Input type="number" placeholder="e.g., 10000" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select placeholder="Select warehouse type">
              <Option value="Main">Main</Option>
              <Option value="Secondary">Secondary</Option>
              <Option value="Transit">Transit</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Maintenance">Maintenance</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}