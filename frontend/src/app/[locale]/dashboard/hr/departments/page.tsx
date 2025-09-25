'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  message, 
  Row, 
  Col, 
  Typography,
  Modal,
  Form,
  Popconfirm,
  Tooltip,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import { hrApi, Department, PaginatedResponse, CreateDepartmentDto, UpdateDepartmentDto } from '../../../../../lib/hr-api';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { TextArea } = Input;

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, [pagination.current, pagination.pageSize, searchTerm]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: pagination.current,
        limit: pagination.pageSize,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response: PaginatedResponse<Department> = await hrApi.getDepartments(params);
      
      setDepartments(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      console.error('Error fetching departments:', error);
      message.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setModalVisible(true);
    form.setFieldsValue({
      name: department.name,
      description: department.description,
    });
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await hrApi.deleteDepartment(id);
      message.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      message.error('Failed to delete department');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingDepartment) {
        // Update existing department
        const updateData: UpdateDepartmentDto = {
          name: values.name,
          description: values.description,
        };
        await hrApi.updateDepartment(editingDepartment.id, updateData);
        message.success('Department updated successfully');
      } else {
        // Create new department
        const createData: CreateDepartmentDto = {
          name: values.name,
          description: values.description,
        };
        await hrApi.createDepartment(createData);
        message.success('Department created successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      message.error('Failed to save department');
    }
  };

  const columns: ColumnsType<Department> = [
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description || 'N/A',
    },
    {
      title: 'Employees',
      key: 'employeeCount',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ marginRight: '4px' }} />
          <span>{record.employees?.length || 0}</span>
        </div>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Department">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditDepartment(record)}
            />
          </Tooltip>
          
          <Popconfirm
            title="Delete Department"
            description="Are you sure you want to delete this department? This action cannot be undone."
            onConfirm={() => handleDeleteDepartment(record.id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
          >
            <Tooltip title="Delete Department">
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

  const handleTableChange = (paginationConfig: any) => {
    setPagination({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      total: pagination.total,
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>Departments</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateDepartment}
          >
            Add Department
          </Button>
        </Col>
      </Row>

      <Card>
        {/* Search */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search departments..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button onClick={fetchDepartments}>
              Search
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={departments}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} departments`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Create/Edit Department Modal */}
      <Modal
        title={editingDepartment ? 'Edit Department' : 'Create New Department'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label="Department Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter department name' },
              { min: 2, message: 'Department name must be at least 2 characters' },
              { max: 100, message: 'Department name must not exceed 100 characters' }
            ]}
          >
            <Input
              placeholder="Enter department name"
              prefix={<TeamOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { max: 500, message: 'Description must not exceed 500 characters' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter department description (optional)"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingDepartment ? 'Update Department' : 'Create Department'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}