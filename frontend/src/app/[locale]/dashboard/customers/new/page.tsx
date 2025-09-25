'use client';

import { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  Switch,
  InputNumber,
  DatePicker,
  message,
  Divider,
  Space,
  Breadcrumb,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

const { Option } = Select;
const { TextArea } = Input;

interface CustomerFormData {
  customer_name: string;
  customer_code?: string;
  customer_type: string;
  email?: string;
  mobile_no?: string;
  phone?: string;
  website?: string;
  tax_id?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_country?: string;
  billing_pincode?: string;
  shipping_address_line1?: string;
  shipping_address_line2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_pincode?: string;
  credit_limit: number;
  payment_terms?: string;
  is_frozen: boolean;
  disabled: boolean;
  notes?: string;
}

export default function NewCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(false);

  const handleSubmit = async (values: CustomerFormData) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/customers', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values),
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Customer created successfully');
      router.push(`/${locale}/dashboard/customers`);
    } catch (error) {
      message.error('Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/dashboard/customers`);
  };

  const copyBillingToShipping = () => {
    const billingValues = form.getFieldsValue([
      'billing_address_line1',
      'billing_address_line2',
      'billing_city',
      'billing_state',
      'billing_country',
      'billing_pincode',
    ]);

    form.setFieldsValue({
      shipping_address_line1: billingValues.billing_address_line1,
      shipping_address_line2: billingValues.billing_address_line2,
      shipping_city: billingValues.billing_city,
      shipping_state: billingValues.billing_state,
      shipping_country: billingValues.billing_country,
      shipping_pincode: billingValues.billing_pincode,
    });
  };

  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked) {
      copyBillingToShipping();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a onClick={() => router.push(`/${locale}/dashboard/customers`)}>
              Customers
            </a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Add Customer</Breadcrumb.Item>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
            <p className="text-gray-600">Create a new customer record</p>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
          >
            Back to Customers
          </Button>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          customer_type: 'Individual',
          credit_limit: 0,
          is_frozen: false,
          disabled: false,
        }}
      >
        <Row gutter={24}>
          <Col span={16}>
            {/* Basic Information */}
            <Card title="Basic Information" className="mb-6">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="customer_name"
                    label="Customer Name"
                    rules={[
                      { required: true, message: 'Please enter customer name' },
                      { min: 2, message: 'Name must be at least 2 characters' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Enter customer name"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="customer_code"
                    label="Customer Code"
                  >
                    <Input placeholder="Auto-generated if empty" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="customer_type"
                    label="Customer Type"
                    rules={[{ required: true, message: 'Please select customer type' }]}
                  >
                    <Select>
                      <Option value="Individual">
                        <UserOutlined /> Individual
                      </Option>
                      <Option value="Company">
                        <TeamOutlined /> Company
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="tax_id"
                    label="Tax ID"
                  >
                    <Input placeholder="Tax identification number" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Contact Information */}
            <Card title="Contact Information" className="mb-6">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { type: 'email', message: 'Please enter a valid email' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="customer@example.com"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="mobile_no"
                    label="Mobile Number"
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="+1234567890"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="+1234567890"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="website"
                    label="Website"
                  >
                    <Input placeholder="https://example.com" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Billing Address */}
            <Card title="Billing Address" className="mb-6">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="billing_address_line1"
                    label="Address Line 1"
                  >
                    <Input placeholder="Street address" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="billing_address_line2"
                    label="Address Line 2"
                  >
                    <Input placeholder="Apartment, suite, etc. (optional)" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="billing_city"
                    label="City"
                  >
                    <Input placeholder="City" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="billing_state"
                    label="State/Province"
                  >
                    <Input placeholder="State or Province" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="billing_pincode"
                    label="ZIP/Postal Code"
                  >
                    <Input placeholder="ZIP or Postal Code" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="billing_country"
                    label="Country"
                  >
                    <Select
                      showSearch
                      placeholder="Select country"
                      optionFilterProp="children"
                    >
                      <Option value="USA">United States</Option>
                      <Option value="Canada">Canada</Option>
                      <Option value="UK">United Kingdom</Option>
                      <Option value="Germany">Germany</Option>
                      <Option value="France">France</Option>
                      <Option value="Australia">Australia</Option>
                      <Option value="India">India</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Shipping Address */}
            <Card 
              title={
                <div className="flex justify-between items-center">
                  <span>Shipping Address</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Same as billing</span>
                    <Switch
                      checked={sameAsBilling}
                      onChange={handleSameAsBillingChange}
                      size="small"
                    />
                  </div>
                </div>
              }
              className="mb-6"
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="shipping_address_line1"
                    label="Address Line 1"
                  >
                    <Input placeholder="Street address" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="shipping_address_line2"
                    label="Address Line 2"
                  >
                    <Input placeholder="Apartment, suite, etc. (optional)" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="shipping_city"
                    label="City"
                  >
                    <Input placeholder="City" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="shipping_state"
                    label="State/Province"
                  >
                    <Input placeholder="State or Province" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="shipping_pincode"
                    label="ZIP/Postal Code"
                  >
                    <Input placeholder="ZIP or Postal Code" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="shipping_country"
                    label="Country"
                  >
                    <Select
                      showSearch
                      placeholder="Select country"
                      optionFilterProp="children"
                    >
                      <Option value="USA">United States</Option>
                      <Option value="Canada">Canada</Option>
                      <Option value="UK">United Kingdom</Option>
                      <Option value="Germany">Germany</Option>
                      <Option value="France">France</Option>
                      <Option value="Australia">Australia</Option>
                      <Option value="India">India</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Additional Notes */}
            <Card title="Additional Notes" className="mb-6">
              <Form.Item
                name="notes"
                label="Notes"
              >
                <TextArea
                  rows={4}
                  placeholder="Any additional notes about the customer..."
                />
              </Form.Item>
            </Card>
          </Col>

          <Col span={8}>
            {/* Financial Information */}
            <Card title="Financial Information" className="mb-6">
              <Form.Item
                name="credit_limit"
                label="Credit Limit"
                rules={[
                  { required: true, message: 'Please enter credit limit' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => (parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0) as any}
                  placeholder="0.00"
                />
              </Form.Item>

              <Form.Item
                name="payment_terms"
                label="Payment Terms"
              >
                <Select placeholder="Select payment terms">
                  <Option value="Net 30">Net 30</Option>
                  <Option value="Net 15">Net 15</Option>
                  <Option value="Net 60">Net 60</Option>
                  <Option value="Due on Receipt">Due on Receipt</Option>
                  <Option value="Cash on Delivery">Cash on Delivery</Option>
                </Select>
              </Form.Item>
            </Card>

            {/* Status Settings */}
            <Card title="Status Settings" className="mb-6">
              <Form.Item
                name="is_frozen"
                label="Frozen Account"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <p className="text-sm text-gray-500 mb-4">
                Frozen accounts cannot place new orders
              </p>

              <Form.Item
                name="disabled"
                label="Disabled Account"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <p className="text-sm text-gray-500">
                Disabled accounts are hidden from most views
              </p>
            </Card>

            {/* Action Buttons */}
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  block
                  size="large"
                >
                  Create Customer
                </Button>
                <Button
                  onClick={handleCancel}
                  block
                  size="large"
                >
                  Cancel
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}