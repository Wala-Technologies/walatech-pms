'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  Switch,
  Avatar,
  Tooltip,
  Dropdown,
  Badge,
  Row,
  Col,
  message
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  MoreOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { hrApi, Department } from '@/lib/hr-api';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  department_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export default function UsersPage() {
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await hrApi.getDepartments({ limit: 1000 });
      if (response.data) {
        setDepartments(response.data.departments || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      message.error('Failed to load departments');
    }
  };

  // Mock data
  const users: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@walatech.com',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'System Admin',
      department: 'IT',
      department_id: 'dept-it-001',
      status: 'active',
      lastLogin: '2024-01-14 09:30:00',
      createdAt: '2023-01-01',
      permissions: ['all']
    },
    {
      id: '2',
      username: 'prod_manager',
      email: 'manager@walatech.com',
      firstName: 'Alemayehu',
      lastName: 'Tadesse',
      role: 'Production Manager',
      department: 'Production',
      department_id: 'dept-prod-001',
      status: 'active',
      lastLogin: '2024-01-14 08:15:00',
      createdAt: '2023-02-15',
      permissions: ['production.read', 'production.write', 'inventory.read']
    },
    {
      id: '3',
      username: 'quality_lead',
      email: 'quality@walatech.com',
      firstName: 'Tigist',
      lastName: 'Bekele',
      role: 'Quality Lead',
      department: 'Quality Control',
      department_id: 'dept-qc-001',
      status: 'active',
      lastLogin: '2024-01-13 16:45:00',
      createdAt: '2023-03-10',
      permissions: ['quality.read', 'quality.write', 'production.read']
    },
    {
      id: '4',
      username: 'operator1',
      email: 'operator1@walatech.com',
      firstName: 'Dawit',
      lastName: 'Haile',
      role: 'Machine Operator',
      department: 'Production',
      department_id: 'dept-prod-001',
      status: 'inactive',
      lastLogin: '2024-01-10 17:30:00',
      createdAt: '2023-06-20',
      permissions: ['production.read']
    },
    {
      id: '5',
      username: 'inventory_clerk',
      email: 'inventory@walatech.com',
      firstName: 'Meron',
      lastName: 'Girma',
      role: 'Inventory Clerk',
      department: 'Warehouse',
      status: 'suspended',
      lastLogin: '2024-01-08 14:20:00',
      createdAt: '2023-04-05',
      permissions: ['inventory.read', 'inventory.write']
    }
  ];

  const roles: Role[] = [
    {
      id: '1',
      name: 'System Admin',
      description: 'Full system access and administration',
      permissions: ['all'],
      userCount: 1
    },
    {
      id: '2',
      name: 'Production Manager',
      description: 'Manage production operations and planning',
      permissions: ['production.read', 'production.write', 'inventory.read', 'reports.read'],
      userCount: 3
    },
    {
      id: '3',
      name: 'Quality Lead',
      description: 'Quality control and assurance management',
      permissions: ['quality.read', 'quality.write', 'production.read', 'reports.read'],
      userCount: 2
    },
    {
      id: '4',
      name: 'Machine Operator',
      description: 'Basic production operations',
      permissions: ['production.read'],
      userCount: 8
    },
    {
      id: '5',
      name: 'Inventory Clerk',
      description: 'Inventory management and tracking',
      permissions: ['inventory.read', 'inventory.write'],
      userCount: 4
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'green',
      inactive: 'orange',
      suspended: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'System Admin': 'red',
      'Production Manager': 'blue',
      'Quality Lead': 'purple',
      'Machine Operator': 'green',
      'Inventory Clerk': 'orange'
    };
    return colors[role as keyof typeof colors] || 'default';
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      console.log('Form values:', values);
      // Here you would typically call an API to save the user
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const userActionItems = (user: User) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View Details',
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit User',
      onClick: () => handleEditUser(user),
    },
    {
      key: 'toggle-status',
      icon: user.status === 'active' ? <LockOutlined /> : <UnlockOutlined />,
      label: user.status === 'active' ? 'Deactivate' : 'Activate',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete User',
      danger: true,
    },
  ];

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: unknown, record: User) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            src={record.avatar} 
            icon={<UserOutlined />}
            size="large"
          />
          <div>
            <div className="font-medium text-gray-900">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-sm text-gray-500">@{record.username}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
      width: 250,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>{role}</Tag>
      ),
      filters: roles.map(role => ({ text: role.name, value: role.name })),
      width: 150,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={getStatusColor(status) as 'success' | 'processing' | 'default' | 'error' | 'warning'} 
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Suspended', value: 'suspended' },
      ],
      width: 100,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      sorter: true,
      width: 150,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      width: 120,
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => {
        // Map permission IDs to display names without prefixes
        const permissionNames = permissions.map(permId => {
          // Remove prefix and convert to readable format
          const cleanName = permId.split('.').pop() || permId;
          return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).replace(/([A-Z])/g, ' $1');
        });
        
        return (
          <Tooltip title={permissionNames.join(', ')}>
            <Tag>{permissions.length} permissions</Tag>
          </Tooltip>
        );
      },
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: User) => (
        <Dropdown
          menu={{ items: userActionItems(record) }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
      width: 80,
      fixed: 'right' as const,
    },
  ];

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchText === '' || 
      user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.username.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || user.department_id === departmentFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  // Calculate summary statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'active').length;
  const inactiveUsers = users.filter(user => user.status === 'inactive').length;
  const suspendedUsers = users.filter(user => user.status === 'suspended').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users, roles, and permissions</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
            Add New User
          </Button>
        </div>

        {/* Summary Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={6}>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
                <div className="text-gray-600">Total Users</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
                <div className="text-gray-600">Active Users</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{inactiveUsers}</div>
                <div className="text-gray-600">Inactive Users</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{suspendedUsers}</div>
                <div className="text-gray-600">Suspended Users</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mb-4">
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
            />
            <Select
              placeholder="Filter by role"
              value={roleFilter}
              onChange={setRoleFilter}
              className="w-48"
            >
              <Select.Option value="all">All Roles</Select.Option>
              {roles.map(role => (
                <Select.Option key={role.id} value={role.name}>{role.name}</Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-48"
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
              <Select.Option value="suspended">Suspended</Select.Option>
            </Select>
            <Select
              placeholder="Filter by department"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              className="w-48"
            >
              <Select.Option value="all">All Departments</Select.Option>
              {departments.map(dept => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
            <Button icon={<FilterOutlined />}>More Filters</Button>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{
            total: users.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add New User'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'active' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select>
                  {roles.map(role => (
                    <Select.Option key={role.id} value={role.name}>
                      {role.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department_id"
                label="Department"
                rules={[{ required: true, message: 'Please select department' }]}
              >
                <Select placeholder="Select department">
                  {departments.map(dept => (
                    <Select.Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="status"
            label="Status"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}