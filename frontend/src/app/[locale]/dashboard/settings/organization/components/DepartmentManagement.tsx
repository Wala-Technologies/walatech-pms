'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Tag,
  Typography,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../../../../../lib/api-client';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Department {
  id: string;
  name: string;
  department_name: string;
  description?: string;
  manager_id?: string;
  parent_department?: string;
  disabled: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  employees?: any[];
  parentDepartment?: Department;
  childDepartments?: Department[];
}

interface DepartmentFormData {
  name: string;
  code: string;
  department_name: string;
  company: string;
  description?: string;
  manager_id?: string;
  parent_department?: string;
}

interface DepartmentManagementProps {
  tenantId?: string;
  tenantSubdomain?: string;
  departments?: Department[];
  onDepartmentsChange?: (departments: Department[]) => void;
}

export default function DepartmentManagement({ 
  tenantId, 
  tenantSubdomain,
  departments: propDepartments, 
  onDepartmentsChange 
}: DepartmentManagementProps = {}) {
  const [departments, setDepartments] = useState<Department[]>(propDepartments || []);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    console.log('DepartmentManagement useEffect triggered');
    console.log('propDepartments:', propDepartments);
    console.log('tenantSubdomain:', tenantSubdomain);
    
    // Always fetch fresh data to avoid stale data issues
    console.log('Always calling fetchDepartments to ensure fresh data');
    fetchDepartments();
  }, [tenantSubdomain]);

  // Helper function to make API calls with specific tenant context
  const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
    console.log('makeApiCall called with:', { endpoint, method: options.method, tenantSubdomain });
    
    // If no specific tenant subdomain is provided, use the regular API client
    if (!tenantSubdomain) {
      console.log('Using regular API client (no tenant subdomain)');
      const method = options.method || 'GET';
      const body = options.body ? JSON.parse(options.body as string) : undefined;
      
      switch (method.toUpperCase()) {
        case 'GET':
          const response = await apiClient.get(endpoint);
          return response.data;
        case 'POST':
          const postResponse = await apiClient.post(endpoint, body);
          return postResponse.data;
        case 'PATCH':
          const patchResponse = await apiClient.patch(endpoint, body);
          return patchResponse.data;
        case 'DELETE':
          console.log('Making DELETE request via apiClient to:', endpoint);
          const deleteResponse = await apiClient.delete(endpoint);
          console.log('DELETE response:', deleteResponse);
          return deleteResponse.data;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    }
    
    // Use custom fetch with tenant subdomain header for cross-tenant access
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const url = `${baseUrl}/api${endpoint}`;
    
    // Get auth token
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Use specific tenant subdomain for cross-tenant access
    headers['x-tenant-subdomain'] = tenantSubdomain;
    
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Handle 204 No Content responses (like DELETE operations)
    if (response.status === 204) {
      return null;
    }
    
    // Only try to parse JSON if there's content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return null;
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      console.log('Fetching departments for tenant:', tenantSubdomain);
      const data = await makeApiCall('/hr/departments');
      const fetchedDepartments = data || [];
      console.log('Fetched departments:', fetchedDepartments);
      console.log('Department IDs:', fetchedDepartments.map((d: any) => d.id));
      setDepartments(fetchedDepartments);
      onDepartmentsChange?.(fetchedDepartments);
    } catch (error) {
      message.error('Failed to fetch departments');
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    form.setFieldsValue({
      name: department.name,
      code: department.name, // Use name as code for existing departments
      department_name: department.department_name,
      company: 'WalaTech Manufacturing', // Default company
      description: department.description,
      manager_id: department.manager_id,
      parent_department: department.parent_department,
    });
    setModalVisible(true);
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    try {
      console.log('Attempting to delete department:', departmentId);
      console.log('Using tenant subdomain:', tenantSubdomain);
      
      const result = await makeApiCall(`/hr/departments/${departmentId}`, { method: 'DELETE' });
      console.log('Delete result:', result);
      
      message.success('Department deleted successfully');
      fetchDepartments();
    } catch (error: any) {
      console.error('Error deleting department:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        departmentId,
        tenantSubdomain
      });
      message.error(error.message || 'Failed to delete department');
    }
  };

  const handleSubmit = async (values: DepartmentFormData) => {
    try {
      if (editingDepartment) {
        await makeApiCall(`/hr/departments/${editingDepartment.id}`, {
          method: 'PATCH',
          body: JSON.stringify(values),
        });
        message.success('Department updated successfully');
      } else {
        await makeApiCall('/hr/departments', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        message.success('Department created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchDepartments();
    } catch (error: any) {
      message.error(error.message || 'Failed to save department');
      console.error('Error saving department:', error);
    }
  };

  const columns = [
    {
      title: 'Department Name',
      dataIndex: 'department_name',
      key: 'department_name',
      render: (text: string, record: Department) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Code: {record.name}
          </Text>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Parent Department',
      dataIndex: 'parentDepartment',
      key: 'parentDepartment',
      render: (parent: Department) => parent?.department_name || '-',
    },
    {
      title: 'Status',
      dataIndex: 'disabled',
      key: 'disabled',
      render: (disabled: boolean) => (
        <Tag color={disabled ? 'red' : 'green'}>
          {disabled ? 'Inactive' : 'Active'}
        </Tag>
      ),
    },
    {
      title: 'Employees',
      dataIndex: 'employees',
      key: 'employees',
      render: (employees: any[]) => (
        <Tag icon={<TeamOutlined />} color="blue">
          {employees?.length || 0}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Department) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditDepartment(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this department?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteDepartment(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Get parent department options (exclude current department when editing)
  const getParentDepartmentOptions = () => {
    return departments.filter(dept => 
      editingDepartment ? dept.id !== editingDepartment.id : true
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            <BranchesOutlined style={{ marginRight: '8px' }} />
            Department Management
          </Title>
          <Text type="secondary">
            Create and manage organizational departments
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateDepartment}
        >
          Add Department
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={departments}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} departments`,
        }}
        scroll={{ x: 800 }}
      />

      <Modal
        title={editingDepartment ? 'Edit Department' : 'Create New Department'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width="90%"
        style={{ maxWidth: '800px', minWidth: '400px' }}
        styles={{
          body: { maxHeight: '70vh', overflowY: 'auto' }
        }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            company: 'WalaTech Manufacturing'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <Form.Item
              name="name"
              label="Department ID"
              rules={[
                { required: true, message: 'Please enter department ID' },
                { pattern: /^[A-Z0-9_]+$/, message: 'ID must be uppercase letters, numbers, and underscores only' },
              ]}
            >
              <Input placeholder="e.g., ENGINEERING, HR, SALES" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Department Code"
              rules={[
                { required: true, message: 'Please enter department code' },
                { pattern: /^[A-Z0-9_]+$/, message: 'Code must be uppercase letters, numbers, and underscores only' },
              ]}
            >
              <Input placeholder="e.g., ENG, HR, SAL" />
            </Form.Item>

            <Form.Item
              name="department_name"
              label="Department Name"
              rules={[
                { required: true, message: 'Please enter department name' },
              ]}
              style={{ gridColumn: '1 / -1' }}
            >
              <Input placeholder="e.g., Engineering Department" />
            </Form.Item>

            <Form.Item
              name="company"
              label="Company"
              rules={[
                { required: true, message: 'Please enter company name' },
              ]}
            >
              <Input placeholder="Company name" />
            </Form.Item>

            <Form.Item
              name="parent_department"
              label="Parent Department"
            >
              <Select
                placeholder="Select parent department (optional)"
                allowClear
              >
                {getParentDepartmentOptions().map(dept => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.department_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={3}
              placeholder="Brief description of the department"
            />
          </Form.Item>

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingDepartment ? 'Update' : 'Create'} Department
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}