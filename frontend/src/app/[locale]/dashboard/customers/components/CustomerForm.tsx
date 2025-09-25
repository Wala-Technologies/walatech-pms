'use client';

import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  Switch,
  InputNumber,
  message,
  Divider,
  Space,
} from 'antd';
import {
  SaveOutlined,
  UserOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
} from '@ant-design/icons';

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

interface CustomerFormProps {
  initialValues?: Partial<CustomerFormData>;
  onSubmit: (values: CustomerFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  submitText?: string;
  showCancelButton?: boolean;
}

export default function CustomerForm({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  submitText = 'Save Customer',
  showCancelButton = true,
}: CustomerFormProps) {
  const [form] = Form.useForm();
  const [sameAsBilling, setSameAsBilling] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values: CustomerFormData) => {
    try {
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      // Error handling is done in the parent component
    }
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
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        customer_type: 'Individual',
        credit_limit: 0,
        is_frozen: false,
        disabled: false,
        ...initialValues,
      }}
    >
      {/* Basic Information */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <UserOutlined className="mr-2" />
          Basic Information
        </h3>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customer_name"
              label="Customer Name"
              rules={[{ required: true, message: 'Please enter customer name' }]}
            >
              <Input placeholder="Enter customer name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="customer_code"
              label="Customer Code"
            >
              <Input placeholder="Enter customer code (optional)" />
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
              <Select placeholder="Select customer type">
                <Option value="Individual">Individual</Option>
                <Option value="Company">Company</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tax_id"
              label="Tax ID"
            >
              <Input placeholder="Enter tax ID" />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Contact Information */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <MailOutlined className="mr-2" />
          Contact Information
        </h3>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="mobile_no"
              label="Mobile Number"
            >
              <Input placeholder="Enter mobile number" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="website"
              label="Website"
            >
              <Input placeholder="Enter website URL" />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Billing Address */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <HomeOutlined className="mr-2" />
          Billing Address
        </h3>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="billing_address_line1"
              label="Address Line 1"
            >
              <Input placeholder="Enter address line 1" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="billing_address_line2"
              label="Address Line 2"
            >
              <Input placeholder="Enter address line 2" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="billing_city"
              label="City"
            >
              <Input placeholder="Enter city" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="billing_state"
              label="State/Province"
            >
              <Input placeholder="Enter state/province" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="billing_country"
              label="Country"
            >
              <Select placeholder="Select country">
                <Option value="USA">United States</Option>
                <Option value="Canada">Canada</Option>
                <Option value="UK">United Kingdom</Option>
                <Option value="Germany">Germany</Option>
                <Option value="France">France</Option>
                <Option value="Ethiopia">Ethiopia</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="billing_pincode"
              label="Postal Code"
            >
              <Input placeholder="Enter postal code" />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Shipping Address */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <HomeOutlined className="mr-2" />
            Shipping Address
          </h3>
          <Form.Item name="same_as_billing" valuePropName="checked" className="mb-0">
            <Switch
              checked={sameAsBilling}
              onChange={handleSameAsBillingChange}
              checkedChildren="Same as billing"
              unCheckedChildren="Different address"
            />
          </Form.Item>
        </div>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="shipping_address_line1"
              label="Address Line 1"
            >
              <Input placeholder="Enter address line 1" disabled={sameAsBilling} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="shipping_address_line2"
              label="Address Line 2"
            >
              <Input placeholder="Enter address line 2" disabled={sameAsBilling} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="shipping_city"
              label="City"
            >
              <Input placeholder="Enter city" disabled={sameAsBilling} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="shipping_state"
              label="State/Province"
            >
              <Input placeholder="Enter state/province" disabled={sameAsBilling} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="shipping_country"
              label="Country"
            >
              <Select placeholder="Select country" disabled={sameAsBilling}>
                <Option value="USA">United States</Option>
                <Option value="Canada">Canada</Option>
                <Option value="UK">United Kingdom</Option>
                <Option value="Germany">Germany</Option>
                <Option value="France">France</Option>
                <Option value="Ethiopia">Ethiopia</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="shipping_pincode"
              label="Postal Code"
            >
              <Input placeholder="Enter postal code" disabled={sameAsBilling} />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Financial Information */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <TeamOutlined className="mr-2" />
          Financial Information
        </h3>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="credit_limit"
              label="Credit Limit"
              rules={[{ required: true, message: 'Please enter credit limit' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter credit limit"
                min={0}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => (parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0) as any}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="payment_terms"
              label="Payment Terms"
            >
              <Select placeholder="Select payment terms">
                <Option value="Net 15">Net 15</Option>
                <Option value="Net 30">Net 30</Option>
                <Option value="Net 45">Net 45</Option>
                <Option value="Net 60">Net 60</Option>
                <Option value="Cash on Delivery">Cash on Delivery</Option>
                <Option value="Prepaid">Prepaid</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Status and Notes */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Status & Notes</h3>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="is_frozen" valuePropName="checked">
              <Switch checkedChildren="Frozen" unCheckedChildren="Active" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="disabled" valuePropName="checked">
              <Switch checkedChildren="Disabled" unCheckedChildren="Enabled" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="notes"
          label="Notes"
        >
          <TextArea
            rows={4}
            placeholder="Enter any additional notes about the customer"
          />
        </Form.Item>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        {showCancelButton && onCancel && (
          <Button onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<SaveOutlined />}
        >
          {submitText}
        </Button>
      </div>
    </Form>
  );
}