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
  Tag,
  Select
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CrownOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { hrApi, Designation, Department, PaginatedResponse, CreateDesignationDto, UpdateDesignationDto } from '../../../../../lib/hr-api';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { TextArea } = Input;

export default function DesignationsPage() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, [pagination.current, pagination.pageSize, searchTerm, departmentFilter]);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: pagination.current,
        limit: pagination.pageSize,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (departmentFilter) {
        params.departmentId = departmentFilter;
      }
      
      const response: PaginatedResponse<Designation> = await hrApi.getDesignations(params);
      
      setDesignations(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      console.error('Error fetching designations:', error);
      message.error('Failed to fetch designations');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await hrApi.getDepartments({ limit: 1000 });
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleCreateDesignation = () => {
    setEditingDesignation(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEditDesignation = (designation: Designation) => {
    setEditingDesignation(designation);
    setModalVisible(true);
    form.setFieldsValue({
      title: designation.title,
      description: designation.description,
      departmentId: designation.department?.id,
    });
  };

  const handleDeleteDesignation = async (id: string) => {
    try {
      await hrApi.deleteDesignation(id);
      message.success('Designation deleted successfully');
      fetchDesignations();
    } catch (error) {
      console.error('Error deleting designation:', error);
      message.error('Failed to delete designation');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingDesignation) {
        // Update existing designation
        const updateData: UpdateDesignationDto = {
          title: values.title,
          description: values.description,
          departmentId: values.departmentId,
        };
        await hrApi.updateDesignation(editingDesignation.id, updateData);
        message.success('Designation updated successfully');
      } else {
        // Create new designation
        const createData: CreateDesignationDto = {
          title: values.title,
          description: values.description,
          departmentId: values.departmentId,
        };
        await hrApi.createDesignation(createData);
        message.success('Designation created successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchDesignations();
    } catch (error) {
      console.error('Error saving designation:', error);
      message.error('Failed to save designation');
    }
  };

  const columns: ColumnsType<Designation> = [
    {
      title: 'Designation Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CrownOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>{title}</span>
        </div>
      ),
    },
    {
      title: 'Department',
      key: 'department',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TeamOutlined style={{ marginRight: '4px' }} />
          <span>{record.department?.name || 'N/A'}</span>
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
          <Tooltip title="Edit Designation">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditDesignation(record)}
            />
          </Tooltip>
          
          <Popconfirm
            title="Delete Designation"
            description="Are you sure you want to delete this designation? This action cannot be undone."
            onConfirm={() => handleDeleteDesignation(record.id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
          >
            <Tooltip title="Delete Designation">
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

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>Designations</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateDesignation}
          >
            Add Designation
          </Button>
        </Col>
      </Row>

      <Card>
        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Search designations..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Filter by department"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              allowClear
              style={{ width: '100%' }}
            >
              {departments.map(department => (
                <Select.Option key={department.id} value={department.id}>
                  {department.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Space>
              <Button onClick={fetchDesignations}>
                Search
              </Button>
              <Button onClick={clearFilters}>
                Clear
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={designations}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} designations`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Create/Edit Designation Modal */}
      <Modal
        title={editingDesignation ? 'Edit Designation' : 'Create New Designation'}
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
            label="Designation Title"
            name="title"
            rules={[
              { required: true, message: 'Please enter designation title' },
              { min: 2, message: 'Designation title must be at least 2 characters' },
              { max: 100, message: 'Designation title must not exceed 100 characters' }
            ]}
          >
            <Input
              placeholder="Enter designation title"
              prefix={<CrownOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Department"
            name="departmentId"
            rules={[
              { required: true, message: 'Please select a department' }
            ]}
          >
            <Select
              placeholder="Select department"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  ?.includes(input.toLowerCase())
              }
            >
              {departments.map(department => (
                <Select.Option key={department.id} value={department.id}>
                  {department.name}
                </Select.Option>
              ))}
            </Select>
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
              placeholder="Enter designation description (optional)"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingDesignation ? 'Update Designation' : 'Create Designation'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}