'use client';

import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Modal,
  Form,
  Checkbox,
  Tooltip,
  Dropdown,
  Badge,
  Row,
  Col,
  Divider,
  Typography,
  Alert
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  UserOutlined,
  SafetyOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RolesPage() {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  // Mock permissions data
  const permissions: Permission[] = [
    // Production permissions
    { id: 'production.read', name: 'View Production', description: 'View production data and reports', category: 'Production' },
    { id: 'production.write', name: 'Manage Production', description: 'Create and modify production orders', category: 'Production' },
    { id: 'production.delete', name: 'Delete Production', description: 'Delete production records', category: 'Production' },
    
    // Inventory permissions
    { id: 'inventory.read', name: 'View Inventory', description: 'View inventory levels and items', category: 'Inventory' },
    { id: 'inventory.write', name: 'Manage Inventory', description: 'Update inventory levels and items', category: 'Inventory' },
    { id: 'inventory.delete', name: 'Delete Inventory', description: 'Delete inventory records', category: 'Inventory' },
    
    // Quality permissions
    { id: 'quality.read', name: 'View Quality', description: 'View quality control data', category: 'Quality' },
    { id: 'quality.write', name: 'Manage Quality', description: 'Create and update quality records', category: 'Quality' },
    { id: 'quality.approve', name: 'Approve Quality', description: 'Approve quality control decisions', category: 'Quality' },
    
    // User management permissions
    { id: 'users.read', name: 'View Users', description: 'View user accounts and profiles', category: 'User Management' },
    { id: 'users.write', name: 'Manage Users', description: 'Create and modify user accounts', category: 'User Management' },
    { id: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', category: 'User Management' },
    
    // Reports permissions
    { id: 'reports.read', name: 'View Reports', description: 'Access system reports', category: 'Reports' },
    { id: 'reports.export', name: 'Export Reports', description: 'Export reports to various formats', category: 'Reports' },
    
    // System permissions
    { id: 'system.settings', name: 'System Settings', description: 'Modify system configuration', category: 'System' },
    { id: 'system.backup', name: 'System Backup', description: 'Perform system backups', category: 'System' },
    { id: 'system.audit', name: 'Audit Logs', description: 'View system audit logs', category: 'System' }
  ];

  // Mock roles data
  const roles: Role[] = [
    {
      id: '1',
      name: 'System Administrator',
      description: 'Full system access with all permissions',
      permissions: permissions.map(p => p.id),
      userCount: 1,
      isSystemRole: true,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    },
    {
      id: '2',
      name: 'Production Manager',
      description: 'Manage production operations and planning',
      permissions: [
        'production.read', 'production.write',
        'inventory.read', 'quality.read',
        'reports.read', 'reports.export'
      ],
      userCount: 3,
      isSystemRole: false,
      createdAt: '2023-02-15',
      updatedAt: '2024-01-10'
    },
    {
      id: '3',
      name: 'Quality Lead',
      description: 'Quality control and assurance management',
      permissions: [
        'quality.read', 'quality.write', 'quality.approve',
        'production.read', 'reports.read'
      ],
      userCount: 2,
      isSystemRole: false,
      createdAt: '2023-03-10',
      updatedAt: '2023-12-05'
    },
    {
      id: '4',
      name: 'Machine Operator',
      description: 'Basic production operations access',
      permissions: ['production.read'],
      userCount: 8,
      isSystemRole: false,
      createdAt: '2023-04-20',
      updatedAt: '2023-11-15'
    },
    {
      id: '5',
      name: 'Inventory Clerk',
      description: 'Inventory management and tracking',
      permissions: ['inventory.read', 'inventory.write'],
      userCount: 4,
      isSystemRole: false,
      createdAt: '2023-05-05',
      updatedAt: '2023-10-20'
    },
    {
      id: '6',
      name: 'Viewer',
      description: 'Read-only access to basic information',
      permissions: ['production.read', 'inventory.read', 'reports.read'],
      userCount: 12,
      isSystemRole: false,
      createdAt: '2023-06-01',
      updatedAt: '2023-09-30'
    }
  ];

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const handleAddRole = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      ...role,
      permissions: role.permissions
    });
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      console.log('Form values:', values);
      // Here you would typically call an API to save the role
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const roleActionItems = (role: Role) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View Details',
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Role',
      onClick: () => handleEditRole(role),
      disabled: role.isSystemRole,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete Role',
      danger: true,
      disabled: role.isSystemRole || role.userCount > 0,
    },
  ];

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => (
        <div>
          <div className="flex items-center space-x-2">
            <Text strong>{name}</Text>
            {record.isSystemRole && (
              <Tag color="red" icon={<SafetyOutlined />}>System</Tag>
            )}
          </div>
          <Text type="secondary" className="text-sm">{record.description}</Text>
        </div>
      ),
      width: 300,
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => (
        <div className="text-center">
          <Badge count={count} showZero color="blue" />
          <div className="text-xs text-gray-500 mt-1">assigned</div>
        </div>
      ),
      width: 100,
      sorter: (a: Role, b: Role) => a.userCount - b.userCount,
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => {
        const permissionsByCategory = getPermissionsByCategory();
        const categories = Object.keys(permissionsByCategory);
        const roleCategories = new Set();
        
        permissions.forEach(permId => {
          const perm = permissionsByCategory[categories.find(cat => 
            permissionsByCategory[cat].some(p => p.id === permId)
          ) || ''];
          if (perm) {
            roleCategories.add(perm[0]?.category);
          }
        });

        return (
          <div>
            <div className="flex flex-wrap gap-1 mb-1">
              {(Array.from(roleCategories) as string[]).slice(0, 3).map((category: string) => (
                <Tag key={category}>{category}</Tag>
              ))}
              {roleCategories.size > 3 && (
                <Tag>+{roleCategories.size - 3} more</Tag>
              )}
            </div>
            <Text type="secondary" className="text-xs">
              {permissions.length} permissions
            </Text>
          </div>
        );
      },
      width: 200,
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Role) => (
        <Dropdown
          menu={{ items: roleActionItems(record) }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
      width: 80,
      fixed: 'right' as const,
    },
  ];

  const permissionsByCategory = getPermissionsByCategory();

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600">Define roles and assign permissions to control system access</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRole}>
            Create New Role
          </Button>
        </div>

        {/* Summary Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={6}>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{roles.length}</div>
                <div className="text-gray-600">Total Roles</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {roles.filter(r => !r.isSystemRole).length}
                </div>
                <div className="text-gray-600">Custom Roles</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{permissions.length}</div>
                <div className="text-gray-600">Total Permissions</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {roles.reduce((sum, role) => sum + role.userCount, 0)}
                </div>
                <div className="text-gray-600">Users Assigned</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Search */}
        <Card className="mb-4">
          <Input
            placeholder="Search roles..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
        </Card>
      </div>

      {/* Roles Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          pagination={{
            total: roles.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} roles`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add/Edit Role Modal */}
      <Modal
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter role description' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Describe the role and its responsibilities"
            />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[{ required: true, message: 'Please select at least one permission' }]}
          >
            <div className="max-h-96 overflow-y-auto border rounded p-4">
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <div key={category} className="mb-4">
                  <Title level={5} className="mb-2 text-gray-700">
                    <SettingOutlined className="mr-2" />
                    {category}
                  </Title>
                  <div className="grid grid-cols-1 gap-2 ml-6">
                    {perms.map(permission => (
                      <Checkbox
                        key={permission.id}
                        value={permission.id}
                        className="w-full"
                      >
                        <div>
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-gray-500">{permission.description}</div>
                        </div>
                      </Checkbox>
                    ))}
                  </div>
                  <Divider className="my-3" />
                </div>
              ))}
            </div>
          </Form.Item>

          {editingRole?.isSystemRole && (
            <Alert
              message="System Role"
              description="This is a system role and cannot be modified."
              type="warning"
              showIcon
              className="mb-4"
            />
          )}
        </Form>
      </Modal>
    </div>
  );
}