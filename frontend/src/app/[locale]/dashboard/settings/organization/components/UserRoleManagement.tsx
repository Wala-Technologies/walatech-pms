'use client';
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select,
  Tag, 
  Space, 
  Tabs, 
  Row, 
  Col,
  Statistic,
  Avatar,
  Switch,
  Popconfirm,
  message,
  Dropdown,
  Upload,
  Progress,
  Alert,
  Checkbox,
  Collapse,
  Typography,
  DatePicker,
  Form,
  Badge
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

// User interfaces matching backend
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_profile_name?: string;
  department_id?: string;
  enabled: boolean;
  mobile_no?: string;
  modified?: string;
  creation?: string;
  tenant_id: string;
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
  const [saving, setSaving] = useState(false);
  
  const [userForm] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  // Fetch data from API
  useEffect(() => {
    console.log('UserRoleManagement useEffect triggered');
    console.log('managedTenant:', managedTenant);
    fetchUsers();
    fetchDepartments();
    fetchRoles();
  }, [managedTenant]);

  // API helper with tenant support
  const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
    console.log('makeApiCall called with:', { endpoint, method: options.method, managedTenant: managedTenant?.subdomain });
    
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : undefined;
    const tenantSubdomain = managedTenant?.subdomain;
    
    let response;
    
    switch (method.toUpperCase()) {
      case 'GET':
        response = tenantSubdomain 
          ? await apiClient.getWithTenant(endpoint, tenantSubdomain)
          : await apiClient.get(endpoint);
        break;
      case 'POST':
        response = tenantSubdomain
          ? await apiClient.postWithTenant(endpoint, body, tenantSubdomain)
          : await apiClient.post(endpoint, body);
        break;
      case 'PATCH':
        response = tenantSubdomain
          ? await apiClient.patchWithTenant(endpoint, body, tenantSubdomain)
          : await apiClient.patch(endpoint, body);
        break;
      case 'DELETE':
        response = tenantSubdomain
          ? await apiClient.deleteWithTenant(endpoint, tenantSubdomain)
          : await apiClient.delete(endpoint);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    // Check for API errors
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users with proper tenant isolation');
      const data = await makeApiCall('/users');
      const fetchedUsers = data?.users || data || [];
      console.log('Fetched users:', fetchedUsers);
      setUsers(fetchedUsers);
    } catch (error) {
      message.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments');
      const data = await makeApiCall('/hr/departments');
      const fetchedDepartments = data || [];
      console.log('Fetched departments:', fetchedDepartments);
      setDepartments(fetchedDepartments.map((d: any) => ({
        id: d.id,
        name: d.department_name || d.name
      })));
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchRoles = async () => {
    // Roles matching backend UserRole enum
    setRoles([
      {
        id: 'super_admin',
        name: 'super_admin',
        description: 'Super Administrator - Full system access',
        permissions: ['all'],
        userCount: 0
      },
      {
        id: 'hr',
        name: 'hr',
        description: 'HR - Human Resources management',
        permissions: ['hr:manage', 'users:view'],
        userCount: 0
      },
      {
        id: 'manager',
        name: 'manager',
        description: 'Manager - Department management',
        permissions: ['department:manage', 'users:view'],
        userCount: 0
      },
      {
        id: 'department_head',
        name: 'department_head',
        description: 'Department Head - Department leadership',
        permissions: ['department:view', 'users:view'],
        userCount: 0
      },
      {
        id: 'sales',
        name: 'sales',
        description: 'Sales - Sales operations',
        permissions: ['sales:manage'],
        userCount: 0
      },
      {
        id: 'purchasing',
        name: 'purchasing',
        description: 'Purchasing - Procurement operations',
        permissions: ['purchasing:manage'],
        userCount: 0
      },
      {
        id: 'production',
        name: 'production',
        description: 'Production - Manufacturing operations',
        permissions: ['production:manage'],
        userCount: 0
      },
      {
        id: 'accounting',
        name: 'accounting',
        description: 'Accounting - Financial operations',
        permissions: ['accounting:manage'],
        userCount: 0
      },
      {
        id: 'regular_user',
        name: 'regular_user',
        description: 'Regular User - Basic access',
        permissions: ['dashboard:view', 'profile:edit'],
        userCount: 0
      }
    ]);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    userForm.resetFields();
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    console.log('[UserRoleManagement] handleEditUser - Editing user:', user);

    // Use the form instance directly
    userForm.setFieldsValue({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role_profile_name,
      department_id: user.department_id,
      phone: user.mobile_no
    });
    setShowUserForm(true);
  };

  const handleSaveUser = async () => {
    if (saving) return; // Prevent double submission

    try {
      setSaving(true);
      const values = await userForm.validateFields();
      
      console.log('[UserRoleManagement] handleSaveUser - Form values:', values);
      console.log('[UserRoleManagement] handleSaveUser - Editing user:', editingUser);
      console.log('[UserRoleManagement] handleSaveUser - Managed tenant:', managedTenant);
      
      // Map form values to API format
      const userData: any = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        department_id: values.department_id,
        phone: values.phone
      };

      // Only include role if it's provided and valid
      if (values.role && values.role.trim() !== '') {
        userData.role = values.role;
      }

      // Only include password for new users
      if (!editingUser && values.password) {
        userData.password = values.password;
      }
      
      console.log('[UserRoleManagement] handleSaveUser - User data to send:', userData);
      console.log('[UserRoleManagement] handleSaveUser - Role value:', userData.role);
      console.log('[UserRoleManagement] handleSaveUser - Department ID:', userData.department_id);
      console.log('[UserRoleManagement] handleSaveUser - Available roles:', roles.map(r => r.name));
      
      if (editingUser) {
        // Update user
        const result = await makeApiCall(`/users/${editingUser.id}`, {
          method: 'PATCH',
          body: JSON.stringify(userData)
        });
        console.log('[UserRoleManagement] handleSaveUser - Update result:', result);
        message.success('User updated successfully');
      } else {
        // Create new user
        const result = await makeApiCall('/users', {
          method: 'POST',
          body: JSON.stringify(userData)
        });
        console.log('[UserRoleManagement] handleSaveUser - Create result:', result);
        message.success('User created successfully');
      }
      
      setShowUserForm(false);
      userForm.resetFields();
      await fetchUsers();
    } catch (error: any) {
      console.error('[UserRoleManagement] handleSaveUser - Error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save user';
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await makeApiCall(`/users/${userId}`, { method: 'DELETE' });
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      message.error(error.message || 'Failed to delete user');
      console.error('Error deleting user:', error);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await makeApiCall(`/users/${userId}/toggle-status`, { method: 'PATCH' });
      message.success('User status updated successfully');
      fetchUsers();
    } catch (error: any) {
      message.error(error.message || 'Failed to update user status');
      console.error('Error toggling user status:', error);
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
      dataIndex: 'first_name',
      key: 'name',
      render: (_: string, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{`${record.first_name} ${record.last_name}`}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role_profile_name',
      key: 'role',
      render: (role: string) => role ? <Tag color="blue">{role}</Tag> : <Text type="secondary">No Role</Text>,
    },
    {
      title: 'Department',
      dataIndex: 'department_id',
      key: 'department',
      render: (deptId: string) => {
        const dept = departments.find(d => d.id === deptId);
        return dept ? dept.name : <Text type="secondary">No Department</Text>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'status',
      render: (enabled: boolean, record: User) => (
        <Switch 
          checked={enabled} 
          onChange={() => handleToggleUserStatus(record.id)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'mobile_no',
      key: 'phone',
      render: (phone: string) => phone || <Text type="secondary">-</Text>,
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
            size="small"
          >
            Edit
          </Button>
          <Popconfirm 
            title="Are you sure you want to delete this user?" 
            description="This action cannot be undone."
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" icon={<DeleteOutlined />} danger size="small">
              Delete
            </Button>
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
                <Statistic title="Active Users" value={users.filter(u => u.enabled).length} prefix={<CheckCircleOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Inactive" value={users.filter(u => !u.enabled).length} prefix={<ExclamationCircleOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="With Departments" value={users.filter(u => u.department_id).length} prefix={<TeamOutlined />} />
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
                    <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
                      <Input placeholder="Enter first name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
                      <Input placeholder="Enter last name" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                      <Input placeholder="Enter email address" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="phone" label="Phone Number">
                      <Input placeholder="Enter phone number" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="role" label="Role">
                      <Select placeholder="Select role" allowClear>
                        {roles.map(role => (
                          <Option key={role.id} value={role.name}>{role.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="department_id" label="Department">
                      <Select placeholder="Select department" allowClear>
                        {departments.map(dept => (
                          <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                {!editingUser && (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item 
                        name="password" 
                        label="Password" 
                        rules={[{ required: true, min: 6 }]}
                      >
                        <Input.Password placeholder="Enter password" />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                <Form.Item>
                  <Space>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveUser} loading={saving}>
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
                    <Form.Item name="department_id" label="Department">
                      <Select placeholder="Select department" allowClear>
                        {departments.map(dept => (
                          <Option key={dept.id} value={dept.id}>{dept.name}</Option>
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