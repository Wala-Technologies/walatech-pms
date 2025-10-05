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
  message,
  Popconfirm,
  Tag,
  Breadcrumb,
  Row,
  Col,
  Statistic,
  Typography,
  Tooltip,
  Dropdown,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MoreOutlined,
  TeamOutlined,
  HomeOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const { Title, Text } = Typography;
const { Option } = Select;

interface SupplierGroup {
  id: string;
  groupName: string;
  description?: string;
  groupType: 'category' | 'region' | 'performance' | 'custom';
  status: 'active' | 'inactive';
  supplierCount: number;
  createdDate: string;
  createdBy: string;
  lastModified: string;
}

export default function SupplierGroupsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = useTranslations('suppliers');
  const tCommon = useTranslations('common');

  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<SupplierGroup[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SupplierGroup | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // Mock data for development
  const mockGroups: SupplierGroup[] = [
    {
      id: '1',
      groupName: 'Raw Materials',
      description: 'Suppliers providing raw materials and components',
      groupType: 'category',
      status: 'active',
      supplierCount: 15,
      createdDate: '2024-01-15',
      createdBy: 'Admin',
      lastModified: '2024-01-20',
    },
    {
      id: '2',
      groupName: 'European Suppliers',
      description: 'Suppliers located in European region',
      groupType: 'region',
      status: 'active',
      supplierCount: 8,
      createdDate: '2024-01-10',
      createdBy: 'Admin',
      lastModified: '2024-01-18',
    },
    {
      id: '3',
      groupName: 'Premium Partners',
      description: 'High-performance suppliers with excellent ratings',
      groupType: 'performance',
      status: 'active',
      supplierCount: 5,
      createdDate: '2024-01-05',
      createdBy: 'Admin',
      lastModified: '2024-01-25',
    },
    {
      id: '4',
      groupName: 'Packaging Suppliers',
      description: 'Suppliers specializing in packaging materials',
      groupType: 'category',
      status: 'inactive',
      supplierCount: 3,
      createdDate: '2024-01-01',
      createdBy: 'Admin',
      lastModified: '2024-01-15',
    },
  ];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGroups(mockGroups);
    } catch (error) {
      message.error('Failed to fetch supplier groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingGroup(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (group: SupplierGroup) => {
    setEditingGroup(group);
    form.setFieldsValue(group);
    setIsModalVisible(true);
  };

  const handleDelete = async (groupId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setGroups(prev => prev.filter(group => group.id !== groupId));
      message.success('Supplier group deleted successfully');
    } catch (error) {
      message.error('Failed to delete supplier group');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingGroup) {
        // Update existing group
        setGroups(prev => prev.map(group => 
          group.id === editingGroup.id 
            ? { ...group, ...values, lastModified: new Date().toISOString().split('T')[0] }
            : group
        ));
        message.success('Supplier group updated successfully');
      } else {
        // Create new group
        const newGroup: SupplierGroup = {
          id: Date.now().toString(),
          ...values,
          supplierCount: 0,
          createdDate: new Date().toISOString().split('T')[0],
          createdBy: 'Current User',
          lastModified: new Date().toISOString().split('T')[0],
        };
        setGroups(prev => [newGroup, ...prev]);
        message.success('Supplier group created successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const getGroupTypeColor = (type: string) => {
    const colors = {
      category: 'blue',
      region: 'green',
      performance: 'gold',
      custom: 'purple',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  const filteredGroups = groups.filter(group =>
    group.groupName.toLowerCase().includes(searchText.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Group Name',
      dataIndex: 'groupName',
      key: 'groupName',
      render: (text: string, record: SupplierGroup) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.description && (
            <div className="text-sm text-gray-500">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'groupType',
      key: 'groupType',
      render: (type: string) => (
        <Tag color={getGroupTypeColor(type)}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Suppliers',
      dataIndex: 'supplierCount',
      key: 'supplierCount',
      render: (count: number) => (
        <span className="font-medium">{count}</span>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SupplierGroup) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this group?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalSuppliers = groups.reduce((sum, group) => sum + group.supplierCount, 0);
  const activeGroups = groups.filter(group => group.status === 'active').length;

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
          <Breadcrumb.Item>Groups</Breadcrumb.Item>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="mb-2">Supplier Groups</Title>
            <Text type="secondary">Organize and manage supplier groups</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add Group
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Groups"
              value={groups.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Groups"
              value={activeGroups}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Suppliers"
              value={totalSuppliers}
              prefix={<TruckOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search groups..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
        </Row>
      </Card>

      {/* Groups Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredGroups}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} groups`,
          }}
        />
      </Card>

      {/* Group Form Modal */}
      <Modal
        title={editingGroup ? 'Edit Supplier Group' : 'Create Supplier Group'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="groupName"
            label="Group Name"
            rules={[{ required: true, message: 'Please enter group name' }]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea 
              placeholder="Enter group description" 
              rows={3}
            />
          </Form.Item>
          
          <Form.Item
            name="groupType"
            label="Group Type"
            rules={[{ required: true, message: 'Please select group type' }]}
          >
            <Select placeholder="Select group type">
              <Option value="category">Category</Option>
              <Option value="region">Region</Option>
              <Option value="performance">Performance</Option>
              <Option value="custom">Custom</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}