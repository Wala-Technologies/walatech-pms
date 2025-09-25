'use client';

import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  message,
  Spin,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import {
  hrApi,
  Employee,
  EmployeeStatus,
  Department,
  Designation,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from '../../../../../../lib/hr-api';

const { Option } = Select;
const { TextArea } = Input;

interface EmployeeFormProps {
  employee?: Employee;
  isEdit?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EmployeeForm({ employee, isEdit = false, onSuccess, onCancel }: EmployeeFormProps) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [filteredDesignations, setFilteredDesignations] = useState<Designation[]>([]);

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
    
    if (employee) {
      // Populate form with employee data
      form.setFieldsValue({
        ...employee,
        date_of_birth: employee.date_of_birth ? dayjs(employee.date_of_birth) : null,
        date_of_joining: dayjs(employee.date_of_joining),
      });
      
      // Filter designations based on employee's department
      if (employee.departmentId) {
        filterDesignationsByDepartment(employee.departmentId);
      }
    }
  }, [employee, form]);

  const fetchDepartments = async () => {
    try {
      const response = await hrApi.getDepartments({ limit: 1000, isActive: true });
      if (response.data) {
        setDepartments(response.data.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      message.error('Failed to load departments');
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await hrApi.getDesignations({ limit: 1000, isActive: true });
      if (response.data) {
        const allDesignations = response.data.designations || [];
        setDesignations(allDesignations);
        setFilteredDesignations(allDesignations);
      }
    } catch (error) {
      console.error('Error fetching designations:', error);
      message.error('Failed to load designations');
    }
  };

  const filterDesignationsByDepartment = (departmentId: string) => {
    const filtered = designations.filter(
      (designation) => !designation.departmentId || designation.departmentId === departmentId
    );
    setFilteredDesignations(filtered);
    
    // Clear designation if it doesn't belong to the selected department
    const currentDesignation = form.getFieldValue('designationId');
    if (currentDesignation && !filtered.find(d => d.id === currentDesignation)) {
      form.setFieldValue('designationId', undefined);
    }
  };

  const handleDepartmentChange = (departmentId: string) => {
    if (departmentId) {
      filterDesignationsByDepartment(departmentId);
    } else {
      setFilteredDesignations(designations);
    }
  };

  const generateEmployeeNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `EMP${timestamp}`;
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // Format dates
      const formattedValues = {
        ...values,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : undefined,
        date_of_joining: values.date_of_joining.format('YYYY-MM-DD'),
      };

      // Generate employee number if creating new employee
      if (!isEdit && !formattedValues.employee_number) {
        formattedValues.employee_number = generateEmployeeNumber();
      }

      if (isEdit && employee) {
        // Update existing employee
        const updateData: UpdateEmployeeDto = formattedValues;
        await hrApi.updateEmployee(employee.id, updateData);
        message.success('Employee updated successfully');
      } else {
        // Create new employee
        const createData: CreateEmployeeDto = {
          ...formattedValues,
          status: formattedValues.status || EmployeeStatus.ACTIVE,
          isActive: true,
        };
        await hrApi.createEmployee(createData);
        message.success('Employee created successfully');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      message.error(isEdit ? 'Failed to update employee' : 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error('Please check the form for errors');
  };

  return (
    <div>
      {!onSuccess && (
        <div style={{ marginBottom: '24px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            style={{ marginBottom: '16px' }}
          >
            Back
          </Button>
          <h2>{isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
        </div>
      )}

      <Card>
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            initialValues={{
              status: EmployeeStatus.ACTIVE,
              isActive: true,
            }}
          >
            <Row gutter={[16, 16]}>
              {/* Basic Information */}
              <Col span={24}>
                <h3>Basic Information</h3>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  label="Employee Number"
                  name="employee_number"
                  rules={[
                    { required: true, message: 'Please enter employee number' },
                  ]}
                >
                  <Input placeholder="Auto-generated if empty" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="System Name (ID)"
                  name="name"
                  rules={[
                    { required: true, message: 'Please enter system name' },
                  ]}
                >
                  <Input placeholder="e.g., john.doe" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Display Name"
                  name="employee_name"
                  rules={[
                    { required: true, message: 'Please enter employee name' },
                  ]}
                >
                  <Input placeholder="e.g., John Doe" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input placeholder="john.doe@company.com" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Phone"
                  name="phone"
                >
                  <Input placeholder="+1234567890" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Date of Birth"
                  name="date_of_birth"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  label="Address"
                  name="address"
                >
                  <TextArea rows={3} placeholder="Full address" />
                </Form.Item>
              </Col>

              {/* Employment Information */}
              <Col span={24}>
                <h3>Employment Information</h3>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Date of Joining"
                  name="date_of_joining"
                  rules={[
                    { required: true, message: 'Please select joining date' },
                  ]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Department"
                  name="departmentId"
                >
                  <Select
                    placeholder="Select department"
                    allowClear
                    onChange={handleDepartmentChange}
                  >
                    {departments.map((dept) => (
                      <Option key={dept.id} value={dept.id}>
                        {dept.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Designation"
                  name="designationId"
                >
                  <Select
                    placeholder="Select designation"
                    allowClear
                  >
                    {filteredDesignations.map((designation) => (
                      <Option key={designation.id} value={designation.id}>
                        {designation.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Salary"
                  name="salary"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Monthly salary"
                    min={0}
                    formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Status"
                  name="status"
                  rules={[
                    { required: true, message: 'Please select status' },
                  ]}
                >
                  <Select placeholder="Select status">
                    {Object.values(EmployeeStatus).map((status) => (
                      <Option key={status} value={status}>
                        {status}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Form Actions */}
              <Col span={24}>
                <Form.Item>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                      size="large"
                    >
                      {isEdit ? 'Update Employee' : 'Create Employee'}
                    </Button>
                    {onCancel && (
                      <Button
                        size="large"
                        onClick={onCancel}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}