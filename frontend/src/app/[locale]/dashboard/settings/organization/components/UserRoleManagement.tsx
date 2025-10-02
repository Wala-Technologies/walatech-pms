'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Form, 
  Input, 
  Select,
  Tag, 
  Space, 
  Tabs, 
  Divider,
  Avatar,
  Tooltip,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Badge,
  Dropdown,
  Upload,
  Switch,
  DatePicker,
  Progress,
  Alert,
  Typography,
  Checkbox,
  Collapse
} from 'antd';
import { 
  UserAddOutlined, 
  TeamOutlined, 
  MailOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  CrownOutlined,
  SafetyOutlined,
  DownloadOutlined,
  UploadOutlined,
  FilterOutlined,
  ReloadOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  SendOutlined,
  SettingOutlined,
  HistoryOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { apiClient } from '../../../../../../lib/api-client';

const { Option } = Select;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

// Mock data interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  avatar?: string;
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface Department {
  id: string;
  name: string;
}

interface UserRoleManagementProps {
  managedTenant?: any;
}

export default function UserRoleManagement({ managedTenant }: UserRoleManagementProps) {
  const t = useTranslations('organization.users');
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const [userForm] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  // Mock data
  useEffect(() => {
    setUsers([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        department: 'Head Quarter',
        status: 'active',
        lastLogin: '2024-01-15 10:30:00'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Manager',
        department: 'Coffee Export',
        status: 'active',
        lastLogin: '2024-01-14 15:45:00'
      }
    ]);

    setRoles([
      {
        id: '1',
        name: 'Admin',
        description: 'Full system access',
        permissions: ['all'],
        userCount: 2
      },
      {
        id: '2',
        name: 'Manager',
        description: 'Department management access',
        permissions: ['department:manage', 'users:view'],
        userCount: 5
      }
    ]);

    setDepartments([
      { id: '1', name: 'Head Quarter' },
      { id: '2', name: 'Coffee Export' },
      { id: '3', name: 'Sack Manufacturing' }
    ]);
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    userForm.resetFields();
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    userForm.setFieldsValue(user);
    setShowUserForm(true);
  };

  const handleSaveUser = async () => {
    try {
      const values = await userForm.validateFields();
      if (editingUser) {
        // Update user
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...values } : u));
        message.success('User updated successfully');
      } else {
        // Add new user
        const newUser: User = {
          id: Date.now().toString(),
          ...values,
          status: 'active',
          lastLogin: new Date().toISOString()
        };
        setUsers([...users, newUser]);
        message.success('User created successfully');
      }
      setShowUserForm(false);
      userForm.resetFields();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleSaveInvite = async () => {
    try {
      const values = await inviteForm.validateFields();
      message.success('Invitation sent successfully');
      setShowInviteForm(false);
      inviteForm.resetFields();
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  const handleAddRole = () => {
    setEditingRole(null);
    roleForm.resetFields();
    setShowRoleForm(true);
  };

  const handleEditRole = (role: UserRole) => {
    setEditingRole(role);
    roleForm.setFieldsValue(role);
    setShowRoleForm(true);
  };

  const handleSaveRole = async () => {
    try {
      const values = await roleForm.validateFields();
      if (editingRole) {
        setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...values } : r));
        message.success('Role updated successfully');
      } else {
        const newRole: UserRole = {
          id: Date.now().toString(),
          ...values,
          userCount: 0
        };
        setRoles([...roles, newRole]);
        message.success('Role created successfully');
      }
      setShowRoleForm(false);
      roleForm.resetFields();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const userColumns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditUser(record)}
          />
          <Popconfirm title="Are you sure?" onConfirm={() => {}}>
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const roleColumns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <CrownOutlined />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => <Badge count={count} showZero />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UserRole) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditRole(record)}
          />
          <Popconfirm title="Are you sure?" onConfirm={() => {}}>
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'users',
      label: (
        <Space>
          <UserOutlined />
          Users
        </Space>
      ),
      children: (
        <div>
          {/* User Management Header */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic title="Total Users" value={users.length} prefix={<UserOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Active Users" value={users.filter(u => u.status === 'active').length} prefix={<CheckCircleOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Pending" value={users.filter(u => u.status === 'pending').length} prefix={<ClockCircleOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Inactive" value={users.filter(u => u.status === 'inactive').length} prefix={<ExclamationCircleOutlined />} />
              </Card>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col>
              <Button type="primary" icon={<UserAddOutlined />} onClick={handleAddUser}>
                Add User
              </Button>
            </Col>
            <Col>
              <Button icon={<MailOutlined />} onClick={() => setShowInviteForm(true)}>
                Send Invitation
              </Button>
            </Col>
            <Col>
              <Button icon={<UploadOutlined />}>
                Bulk Import
              </Button>
            </Col>
            <Col>
              <Button icon={<DownloadOutlined />}>
                Export Users
              </Button>
            </Col>
          </Row>

          {/* User Form */}
          {showUserForm && (
            <Card title={editingUser ? "Edit User" : "Add New User"} style={{ marginBottom: 24 }}>
              <Form form={userForm} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                      <Input placeholder="Enter full name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                      <Input placeholder="Enter email address" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                      <Select placeholder="Select role">
                        {roles.map(role => (
                          <Option key={role.id} value={role.name}>{role.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                      <Select placeholder="Select department">
                        {departments.map(dept => (
                          <Option key={dept.id} value={dept.name}>{dept.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Space>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveUser}>
                      {editingUser ? 'Update User' : 'Create User'}
                    </Button>
                    <Button icon={<CloseOutlined />} onClick={() => setShowUserForm(false)}>
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          )}

          {/* Invitation Form */}
          {showInviteForm && (
            <Card title="Send User Invitation" style={{ marginBottom: 24 }}>
              <Form form={inviteForm} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                      <Input placeholder="Enter email address" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                      <Select placeholder="Select role">
                        {roles.map(role => (
                          <Option key={role.id} value={role.name}>{role.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                      <Select placeholder="Select department">
                        {departments.map(dept => (
                          <Option key={dept.id} value={dept.name}>{dept.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="message" label="Invitation Message">
                  <Input.TextArea placeholder="Optional invitation message" rows={3} />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" icon={<SendOutlined />} onClick={handleSaveInvite}>
                      Send Invitation
                    </Button>
                    <Button icon={<CloseOutlined />} onClick={() => setShowInviteForm(false)}>
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          )}

          {/* Users Table */}
          <Card title="Users List">
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              pagination={{
                total: users.length,
                pageSize: 10,
                showSizeChanger: true,
              }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'roles',
      label: (
        <Space>
          <CrownOutlined />
          Roles
        </Space>
      ),
      children: (
        <div>
          {/* Role Management Header */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card>
                <Statistic title="Total Roles" value={roles.length} prefix={<CrownOutlined />} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Custom Roles" value={roles.filter(r => r.name !== 'Admin').length} prefix={<SettingOutlined />} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Total Permissions" value={15} prefix={<SafetyOutlined />} />
              </Card>
            </Col>
          </Row>

          {/* Role Actions */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRole}>
                Create Role
              </Button>
            </Col>
          </Row>

          {/* Role Form */}
          {showRoleForm && (
            <Card title={editingRole ? "Edit Role" : "Create New Role"} style={{ marginBottom: 24 }}>
              <Form form={roleForm} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="name" label="Role Name" rules={[{ required: true }]}>
                      <Input placeholder="Enter role name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="description" label="Description">
                      <Input placeholder="Enter role description" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="permissions" label="Permissions">
                  <Select mode="multiple" placeholder="Select permissions">
                    <Option value="dashboard:view">Dashboard View</Option>
                    <Option value="inventory:view">Inventory View</Option>
                    <Option value="inventory:manage">Inventory Manage</Option>
                    <Option value="users:view">Users View</Option>
                    <Option value="users:manage">Users Manage</Option>
                    <Option value="reports:view">Reports View</Option>
                    <Option value="settings:manage">Settings Manage</Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveRole}>
                      {editingRole ? 'Update Role' : 'Create Role'}
                    </Button>
                    <Button icon={<CloseOutlined />} onClick={() => setShowRoleForm(false)}>
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          )}

          {/* Roles Table */}
          <Card title="Roles List">
            <Table
              columns={roleColumns}
              dataSource={roles}
              rowKey="id"
              pagination={{
                total: roles.length,
                pageSize: 10,
                showSizeChanger: true,
              }}
            />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={3}>
          <TeamOutlined style={{ marginRight: '8px' }} />
          User & Role Management
        </Title>
        <Text type="secondary">
          Manage users, roles, and permissions for your organization
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />
    </div>
  );
}