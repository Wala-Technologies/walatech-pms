'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Row,
  Col,
  Tree,
  Divider,
  Tag,
  Typography,
  Breadcrumb,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
  UserOutlined,
  TeamOutlined,
  LinkOutlined,
  HomeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';

const { Option } = Select;
const { Title, Text } = Typography;

interface CustomerRelationship {
  id: string;
  parent_customer: string;
  child_customer: string;
  relationship_type: string;
  created_at: string;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  code: string;
  customer_type: string;
  status: string;
}

interface CustomerHierarchyNode extends DataNode {
  customer_id: string;
  customer_name: string;
  customer_type: string;
  relationship_type?: string;
  children?: CustomerHierarchyNode[];
}

const CustomerHierarchyPage: React.FC = () => {
  const [relationships, setRelationships] = useState<CustomerRelationship[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hierarchyData, setHierarchyData] = useState<CustomerHierarchyNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<CustomerRelationship | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [form] = Form.useForm();

  // Generate stable ID for new relationships
  const generateId = useCallback(() => {
    return `rel_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  }, []);

  // Get current date in a stable way
  const getCurrentDate = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Mock data for development
  const mockCustomers: Customer[] = [
    { id: '1', name: 'Acme Corporation', code: 'ACME001', customer_type: 'Company', status: 'Active' },
    { id: '2', name: 'Acme North Division', code: 'ACME002', customer_type: 'Company', status: 'Active' },
    { id: '3', name: 'Acme South Division', code: 'ACME003', customer_type: 'Company', status: 'Active' },
    { id: '4', name: 'TechCorp Ltd', code: 'TECH001', customer_type: 'Company', status: 'Active' },
    { id: '5', name: 'TechCorp Subsidiary', code: 'TECH002', customer_type: 'Company', status: 'Active' },
    { id: '6', name: 'John Smith', code: 'JS001', customer_type: 'Individual', status: 'Active' },
    { id: '7', name: 'Global Enterprises', code: 'GLOB001', customer_type: 'Company', status: 'Active' },
    { id: '8', name: 'Global EU Branch', code: 'GLOB002', customer_type: 'Company', status: 'Active' },
  ];

  const mockRelationships: CustomerRelationship[] = [
    {
      id: '1',
      parent_customer: '1',
      child_customer: '2',
      relationship_type: 'Subsidiary',
      created_at: '2024-01-15',
      notes: 'North American operations division'
    },
    {
      id: '2',
      parent_customer: '1',
      child_customer: '3',
      relationship_type: 'Subsidiary',
      created_at: '2024-01-15',
      notes: 'South American operations division'
    },
    {
      id: '3',
      parent_customer: '4',
      child_customer: '5',
      relationship_type: 'Subsidiary',
      created_at: '2024-02-01',
      notes: 'Technology subsidiary'
    },
    {
      id: '4',
      parent_customer: '7',
      child_customer: '8',
      relationship_type: 'Branch',
      created_at: '2024-02-15',
      notes: 'European branch office'
    },
    {
      id: '5',
      parent_customer: '2',
      child_customer: '6',
      relationship_type: 'Contact Person',
      created_at: '2024-03-01',
      notes: 'Primary contact for North Division'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCustomers(mockCustomers);
      setRelationships(mockRelationships);
      buildHierarchyTree(mockRelationships, mockCustomers);
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchyTree = (relationships: CustomerRelationship[], customers: Customer[]) => {
    const customerMap = new Map(customers.map(c => [c.id, c]));
    const childrenMap = new Map<string, CustomerRelationship[]>();
    
    // Group relationships by parent
    relationships.forEach(rel => {
      if (!childrenMap.has(rel.parent_customer)) {
        childrenMap.set(rel.parent_customer, []);
      }
      childrenMap.get(rel.parent_customer)!.push(rel);
    });

    // Find root customers (those who are not children of anyone)
    const childIds = new Set(relationships.map(r => r.child_customer));
    const rootCustomers = customers.filter(c => !childIds.has(c.id));

    const buildNode = (customer: Customer, relationshipType?: string): CustomerHierarchyNode => {
      const children = childrenMap.get(customer.id) || [];
      return {
        key: customer.id,
        title: (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserOutlined className="mr-2" />
              <span className="font-medium">{customer.name}</span>
              <Text type="secondary" className="ml-2">({customer.code})</Text>
              {relationshipType && (
                <Tag color="blue" className="ml-2">{relationshipType}</Tag>
              )}
            </div>
            <Tag color={customer.customer_type === 'Company' ? 'green' : 'orange'}>
              {customer.customer_type}
            </Tag>
          </div>
        ),
        customer_id: customer.id,
        customer_name: customer.name,
        customer_type: customer.customer_type,
        relationship_type: relationshipType,
        children: children.map(rel => {
          const childCustomer = customerMap.get(rel.child_customer);
          return childCustomer ? buildNode(childCustomer, rel.relationship_type) : null;
        }).filter(Boolean) as CustomerHierarchyNode[]
      };
    };

    const treeData = rootCustomers.map(customer => buildNode(customer));
    setHierarchyData(treeData);
  };

  const handleAddRelationship = () => {
    setEditingRelationship(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditRelationship = (relationship: CustomerRelationship) => {
    setEditingRelationship(relationship);
    form.setFieldsValue(relationship);
    setModalVisible(true);
  };

  const handleDeleteRelationship = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedRelationships = relationships.filter(r => r.id !== id);
      setRelationships(updatedRelationships);
      buildHierarchyTree(updatedRelationships, customers);
      message.success('Relationship deleted successfully');
    } catch (error) {
      message.error('Failed to delete relationship');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingRelationship) {
        // Update existing relationship
        const updatedRelationships = relationships.map(r =>
          r.id === editingRelationship.id ? { ...r, ...values } : r
        );
        setRelationships(updatedRelationships);
        buildHierarchyTree(updatedRelationships, customers);
        message.success('Relationship updated successfully');
      } else {
        // Create new relationship
        const newRelationship: CustomerRelationship = {
          id: generateId(),
          ...values,
          created_at: getCurrentDate()
        };
        const updatedRelationships = [...relationships, newRelationship];
        setRelationships(updatedRelationships);
        buildHierarchyTree(updatedRelationships, customers);
        message.success('Relationship created successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save relationship');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.name} (${customer.code})` : 'Unknown Customer';
  };

  const columns: ColumnsType<CustomerRelationship> = [
    {
      title: 'Parent Customer',
      dataIndex: 'parent_customer',
      key: 'parent_customer',
      render: (customerId: string) => getCustomerName(customerId),
    },
    {
      title: 'Child Customer',
      dataIndex: 'child_customer',
      key: 'child_customer',
      render: (customerId: string) => getCustomerName(customerId),
    },
    {
      title: 'Relationship Type',
      dataIndex: 'relationship_type',
      key: 'relationship_type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Created Date',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditRelationship(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this relationship?"
            onConfirm={() => handleDeleteRelationship(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item>Customers</Breadcrumb.Item>
        <Breadcrumb.Item>Hierarchy</Breadcrumb.Item>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="mb-0 flex items-center">
            <ApartmentOutlined className="mr-3" />
            Customer Hierarchy & Relationships
          </Title>
          <Text type="secondary">
            Manage customer relationships and organizational hierarchy
          </Text>
        </div>
        <Space>
          <Button
            type={viewMode === 'table' ? 'primary' : 'default'}
            icon={<TeamOutlined />}
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
          <Button
            type={viewMode === 'tree' ? 'primary' : 'default'}
            icon={<ApartmentOutlined />}
            onClick={() => setViewMode('tree')}
          >
            Tree View
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRelationship}
          >
            Add Relationship
          </Button>
        </Space>
      </div>

      {viewMode === 'table' ? (
        <Card>
          <Table
            columns={columns}
            dataSource={relationships}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} relationships`,
            }}
          />
        </Card>
      ) : (
        <Card>
          <div className="mb-4">
            <Title level={4}>Customer Hierarchy Tree</Title>
            <Text type="secondary">
              Expand nodes to view customer relationships and organizational structure
            </Text>
          </div>
          <Tree
            treeData={hierarchyData}
            defaultExpandAll
            showLine={{ showLeafIcon: false }}
            className="customer-hierarchy-tree"
          />
        </Card>
      )}

      <Modal
        title={editingRelationship ? 'Edit Customer Relationship' : 'Add Customer Relationship'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="parent_customer"
                label="Parent Customer"
                rules={[{ required: true, message: 'Please select parent customer' }]}
              >
                <Select
                  placeholder="Select parent customer"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="child_customer"
                label="Child Customer"
                rules={[{ required: true, message: 'Please select child customer' }]}
              >
                <Select
                  placeholder="Select child customer"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="relationship_type"
            label="Relationship Type"
            rules={[{ required: true, message: 'Please select relationship type' }]}
          >
            <Select placeholder="Select relationship type">
              <Option value="Subsidiary">Subsidiary</Option>
              <Option value="Branch">Branch</Option>
              <Option value="Division">Division</Option>
              <Option value="Partner">Partner</Option>
              <Option value="Contact Person">Contact Person</Option>
              <Option value="Billing Contact">Billing Contact</Option>
              <Option value="Technical Contact">Technical Contact</Option>
              <Option value="Parent Company">Parent Company</Option>
              <Option value="Sister Company">Sister Company</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter additional notes about this relationship"
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingRelationship ? 'Update' : 'Create'} Relationship
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerHierarchyPage;