'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  Table,
  Button,
  Switch,
  Space,
  message,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  SecurityScanOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../../../../lib/api-client';

const { Title, Text } = Typography;
const { Option } = Select;

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
  resource: string;
  enabled: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

export default function PermissionsPage() {
  const t = useTranslations('settings');
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<'permissions' | 'roles'>(
    'permissions'
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPermissions();
    fetchRoles();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      // For now, use mock data since the endpoint doesn't exist yet
      const mockPermissions: Permission[] = [
        {
          id: '1',
          name: 'View Users',
          description: 'Can view user list and details',
          module: 'User Management',
          action: 'read',
          resource: 'users',
          enabled: true,
        },
        {
          id: '2',
          name: 'Create Users',
          description: 'Can create new users',
          module: 'User Management',
          action: 'create',
          resource: 'users',
          enabled: true,
        },
        {
          id: '3',
          name: 'Edit Users',
          description: 'Can edit existing users',
          module: 'User Management',
          action: 'update',
          resource: 'users',
          enabled: true,
        },
        {
          id: '4',
          name: 'Delete Users',
          description: 'Can delete users',
          module: 'User Management',
          action: 'delete',
          resource: 'users',
          enabled: false,
        },
        {
          id: '5',
          name: 'View Projects',
          description: 'Can view project list and details',
          module: 'Project Management',
          action: 'read',
          resource: 'projects',
          enabled: true,
        },
        {
          id: '6',
          name: 'Create Projects',
          description: 'Can create new projects',
          module: 'Project Management',
          action: 'create',
          resource: 'projects',
          enabled: true,
        },
        {
          id: '7',
          name: 'View Inventory',
          description: 'Can view inventory items',
          module: 'Inventory',
          action: 'read',
          resource: 'inventory',
          enabled: true,
        },
        {
          id: '8',
          name: 'Manage Inventory',
          description: 'Can create, edit, and delete inventory items',
          module: 'Inventory',
          action: 'manage',
          resource: 'inventory',
          enabled: true,
        },
      ];

      setPermissions(mockPermissions);

      // Group permissions by module
      const groups = mockPermissions.reduce((acc, permission) => {
        const existingGroup = acc.find((g) => g.module === permission.module);
        if (existingGroup) {
          existingGroup.permissions.push(permission);
        } else {
          acc.push({
            module: permission.module,
            permissions: [permission],
          });
        }
        return acc;
      }, [] as PermissionGroup[]);

      setPermissionGroups(groups);
    } catch (error) {
      message.error('Failed to fetch permissions');
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      // For now, use mock data since the endpoint doesn't exist yet
      const mockRoles: Role[] = [
        {
          id: '1',
          name: 'Administrator',
          description: 'Full system access',
          permissions: ['1', '2', '3', '5', '6', '7', '8'],
          userCount: 2,
        },
        {
          id: '2',
          name: 'Project Manager',
          description: 'Can manage projects and view users',
          permissions: ['1', '5', '6', '7'],
          userCount: 5,
        },
        {
          id: '3',
          name: 'Inventory Manager',
          description: 'Can manage inventory and view projects',
          permissions: ['1', '5', '7', '8'],
          userCount: 3,
        },
        {
          id: '4',
          name: 'Viewer',
          description: 'Read-only access to most modules',
          permissions: ['1', '5', '7'],
          userCount: 10,
        },
      ];

      setRoles(mockRoles);
    } catch (error) {
      message.error('Failed to fetch roles');
      console.error('Error fetching roles:', error);
    }
  };

  const handlePermissionToggle = async (
    permissionId: string,
    enabled: boolean
  ) => {
    try {
      // TODO: Implement actual API call when backend endpoint is ready
      // await apiClient.patch(`/permissions/${permissionId}`, { enabled });

      setPermissions((prev) =>
        prev.map((p) => (p.id === permissionId ? { ...p, enabled } : p))
      );

      // Update permission groups
      setPermissionGroups((prev) =>
        prev.map((group) => ({
          ...group,
          permissions: group.permissions.map((p) =>
            p.id === permissionId ? { ...p, enabled } : p
          ),
        }))
      );

      message.success(
        `Permission ${enabled ? 'enabled' : 'disabled'} successfully`
      );
    } catch (error) {
      message.error('Failed to update permission');
      console.error('Error updating permission:', error);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setModalVisible(true);
  };

  const handleSaveRole = async (values: any) => {
    try {
      const roleData = {
        name: values.name,
        description: values.description,
        permissions: values.permissions || [],
      };

      if (editingRole) {
        // TODO: Implement actual API call when backend endpoint is ready
        // await apiClient.patch(`/roles/${editingRole.id}`, roleData);

        setRoles((prev) =>
          prev.map((r) => (r.id === editingRole.id ? { ...r, ...roleData } : r))
        );
        message.success('Role updated successfully');
      } else {
        // TODO: Implement actual API call when backend endpoint is ready
        // const response = await apiClient.post('/roles', roleData);

        const newRole: Role = {
          id: Date.now().toString(),
          ...roleData,
          userCount: 0,
        };

        setRoles((prev) => [...prev, newRole]);
        message.success('Role created successfully');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save role');
      console.error('Error saving role:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      // TODO: Implement actual API call when backend endpoint is ready
      // await apiClient.delete(`/roles/${roleId}`);

      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      message.success('Role deleted successfully');
    } catch (error) {
      message.error('Failed to delete role');
      console.error('Error deleting role:', error);
    }
  };

  const permissionColumns = [
    {
      title: 'Permission',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Permission) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text: string) => <Tag color="green">{text}</Tag>,
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      render: (text: string) => <Tag color="orange">{text}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: Permission) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handlePermissionToggle(record.id, checked)}
        />
      ),
    },
  ];

  const roleColumns = [
    {
      title: 'Role',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Role) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissionIds: string[]) => (
        <div className="flex flex-wrap gap-1">
          {permissionIds.slice(0, 3).map((id) => {
            const permission = permissions.find((p) => p.id === id);
            return permission ? <Tag key={id}>{permission.name}</Tag> : null;
          })}
          {permissionIds.length > 3 && (
            <Tag>+{permissionIds.length - 3} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => (
        <div className="flex items-center gap-1">
          <UserOutlined />
          <span>{count}</span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (value: unknown, record: Role) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Delete Role',
                content: `Are you sure you want to delete the role "${record.name}"?`,
                onOk: () => handleDeleteRole(record.id),
              });
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2} className="flex items-center gap-2">
          <SecurityScanOutlined />
          Permissions & Roles
        </Title>
        <Text type="secondary">
          Manage user permissions and role-based access control
        </Text>
      </div>

      <div className="mb-6">
        <Space>
          <Button
            type={activeTab === 'permissions' ? 'primary' : 'default'}
            onClick={() => setActiveTab('permissions')}
          >
            Permissions
          </Button>
          <Button
            type={activeTab === 'roles' ? 'primary' : 'default'}
            onClick={() => setActiveTab('roles')}
          >
            Roles
          </Button>
        </Space>
      </div>

      {activeTab === 'permissions' && (
        <div>
          {permissionGroups.map((group) => (
            <Card key={group.module} title={group.module} className="mb-4">
              <Table
                dataSource={group.permissions}
                columns={permissionColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'roles' && (
        <Card
          title="Roles"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateRole}
            >
              Create Role
            </Button>
          }
        >
          <Table
            dataSource={roles}
            columns={roleColumns}
            rowKey="id"
            loading={loading}
          />
        </Card>
      )}

      <Modal
        title={editingRole ? 'Edit Role' : 'Create Role'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveRole}>
          <Form.Item
            label="Role Name"
            name="name"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea placeholder="Enter role description" rows={3} />
          </Form.Item>

          <Form.Item label="Permissions" name="permissions">
            <div className="max-h-60 overflow-y-auto border rounded p-3">
              {permissionGroups.map((group) => (
                <div key={group.module} className="mb-4">
                  <Title level={5}>{group.module}</Title>
                  <Row gutter={[16, 8]}>
                    {group.permissions.map((permission) => (
                      <Col span={12} key={permission.id}>
                        <Form.Item
                          name={['permissions', permission.id]}
                          valuePropName="checked"
                          noStyle
                        >
                          <Checkbox value={permission.id}>
                            {permission.name}
                          </Checkbox>
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                  <Divider />
                </div>
              ))}
            </div>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingRole ? 'Update' : 'Create'} Role
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
