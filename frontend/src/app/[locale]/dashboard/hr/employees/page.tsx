'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Select,
  Modal,
  message,
  Popconfirm,
  Typography,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { hrApi, Employee, EmployeeStatus, Department, Designation } from '../../../../../lib/hr-api';
import EmployeeForm from './components/EmployeeForm';

const { Title } = Typography;
const { Option } = Select;

export default function EmployeesPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>();
  const [selectedDesignation, setSelectedDesignation] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<EmployeeStatus | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchDesignations();
  }, [currentPage, pageSize, searchText, selectedDepartment, selectedDesignation, selectedStatus]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await hrApi.getEmployees({
        search: searchText || undefined,
        departmentId: selectedDepartment,
        designationId: selectedDesignation,
        status: selectedStatus,
        page: currentPage,
        limit: pageSize,
      });

      if (response.data) {
        setEmployees(response.data.employees || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees. Please try again.');
      setEmployees([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await hrApi.getDepartments({ limit: 1000 });
      if (response.data) {
        setDepartments(response.data.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await hrApi.getDesignations({ limit: 1000 });
      if (response.data) {
        setDesignations(response.data.designations || []);
      }
    } catch (error) {
      console.error('Error fetching designations:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await hrApi.deleteEmployee(id);
      message.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      message.error('Failed to delete employee');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedDepartment(undefined);
    setSelectedDesignation(undefined);
    setSelectedStatus(undefined);
    setCurrentPage(1);
  };

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE:
        return 'green';
      case EmployeeStatus.INACTIVE:
        return 'orange';
      case EmployeeStatus.TERMINATED:
        return 'red';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employee_number',
      key: 'employee_number',
      width: 120,
    },
    {
      title: 'Name',
      dataIndex: 'employee_name',
      key: 'employee_name',
      render: (text: string, record: Employee) => (
        <Link href={`/${locale}/dashboard/hr/employees/${record.id}`}>
          <Button type="link" style={{ padding: 0 }}>
            {text}
          </Button>
        </Link>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Department',
      dataIndex: ['department', 'name'],
      key: 'department',
      render: (text: string) => text || '-',
    },
    {
      title: 'Designation',
      dataIndex: ['designation', 'title'],
      key: 'designation',
      render: (text: string) => text || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: EmployeeStatus) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Joining Date',
      dataIndex: 'date_of_joining',
      key: 'date_of_joining',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (record: Employee) => (
        <Space>
          <Link href={`/${locale}/dashboard/hr/employees/${record.id}`}>
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Link>
          <Link href={`/${locale}/dashboard/hr/employees/${record.id}/edit`}>
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Link>
          <Popconfirm
            title="Are you sure you want to delete this employee?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchEmployees}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>Employees</Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchEmployees}>
                Refresh
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalVisible(true)}
              >
                Add Employee
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input.Search
              placeholder="Search employees..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by Department"
              allowClear
              value={selectedDepartment}
              onChange={(value) => {
                setSelectedDepartment(value);
                handleFilterChange();
              }}
              style={{ width: '100%' }}
            >
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by Designation"
              allowClear
              value={selectedDesignation}
              onChange={(value) => {
                setSelectedDesignation(value);
                handleFilterChange();
              }}
              style={{ width: '100%' }}
            >
              {designations.map((designation) => (
                <Option key={designation.id} value={designation.id}>
                  {designation.title}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by Status"
              allowClear
              value={selectedStatus}
              onChange={(value) => {
                setSelectedStatus(value);
                handleFilterChange();
              }}
              style={{ width: '100%' }}
            >
              {Object.values(EmployeeStatus).map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row style={{ marginTop: '16px' }}>
          <Col>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={employees}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} employees`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add Employee Modal */}
      <Modal
        title="Add Employee"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <EmployeeForm 
          onSuccess={() => {
            setIsAddModalVisible(false);
            fetchEmployees();
          }}
          onCancel={() => setIsAddModalVisible(false)}
        />
      </Modal>
    </div>
  );
}