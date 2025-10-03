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
  BankOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  StarOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

interface CustomerFormData {
  customer_name: string;
  customer_code?: string;
  customer_type: string;
  customer_group?: string;
  territory?: string;
  market_segment?: string;
  industry?: string;
  lead_source?: string;
  account_manager?: string;
  default_currency?: string;
  default_price_list?: string;
  language?: string;
  email?: string;
  mobile_no?: string;
  phone?: string;
  website?: string;
  tax_id?: string;
  tax_category?: string;
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
  credit_days?: number;
  payment_terms?: string;
  default_bank_account?: string;
  loyalty_program?: string;
  loyalty_points?: number;
  customer_portal_access?: boolean;
  portal_username?: string;
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="industry"
              label="Industry"
            >
              <Select placeholder="Select industry">
                <Option value="Technology">Technology</Option>
                <Option value="Healthcare">Healthcare</Option>
                <Option value="Finance">Finance</Option>
                <Option value="Manufacturing">Manufacturing</Option>
                <Option value="Retail">Retail</Option>
                <Option value="Education">Education</Option>
                <Option value="Real Estate">Real Estate</Option>
                <Option value="Consulting">Consulting</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tax_category"
              label="Tax Category"
            >
              <Select placeholder="Select tax category">
                <Option value="Standard">Standard</Option>
                <Option value="Exempt">Tax Exempt</Option>
                <Option value="Zero Rated">Zero Rated</Option>
                <Option value="Out of Scope">Out of Scope</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Customer Classification */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <TrophyOutlined className="mr-2" />
          Customer Classification
        </h3>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="customer_group"
              label="Customer Group"
            >
              <Select placeholder="Select customer group">
                <Option value="Enterprise">Enterprise</Option>
                <Option value="SMB">Small & Medium Business</Option>
                <Option value="Individual">Individual</Option>
                <Option value="Government">Government</Option>
                <Option value="Non-Profit">Non-Profit</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="territory"
              label="Territory"
            >
              <Select placeholder="Select territory">
                <Option value="North America">North America</Option>
                <Option value="Europe">Europe</Option>
                <Option value="Asia Pacific">Asia Pacific</Option>
                <Option value="Latin America">Latin America</Option>
                <Option value="Middle East & Africa">Middle East & Africa</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="market_segment"
              label="Market Segment"
            >
              <Select placeholder="Select market segment">
                <Option value="Enterprise Clients">Enterprise Clients</Option>
                <Option value="SMB Technology">SMB Technology</Option>
                <Option value="Early Adopters">Early Adopters</Option>
                <Option value="Cost-Conscious">Cost-Conscious</Option>
                <Option value="Premium">Premium</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="lead_source"
              label="Lead Source"
            >
              <Select placeholder="Select lead source">
                <Option value="Website">Website</Option>
                <Option value="Referral">Referral</Option>
                <Option value="Social Media">Social Media</Option>
                <Option value="Trade Show">Trade Show</Option>
                <Option value="Cold Call">Cold Call</Option>
                <Option value="Email Campaign">Email Campaign</Option>
                <Option value="Partner">Partner</Option>
                <Option value="Advertisement">Advertisement</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="account_manager"
              label="Account Manager"
            >
              <Select placeholder="Select account manager">
                <Option value="John Smith">John Smith</Option>
                <Option value="Sarah Johnson">Sarah Johnson</Option>
                <Option value="Mike Davis">Mike Davis</Option>
                <Option value="Lisa Wilson">Lisa Wilson</Option>
                <Option value="Robert Brown">Robert Brown</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Defaults & Preferences */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <GlobalOutlined className="mr-2" />
          Defaults & Preferences
        </h3>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="default_currency"
              label="Default Currency"
            >
              <Select placeholder="Select currency">
                <Option value="USD">USD - US Dollar</Option>
                <Option value="EUR">EUR - Euro</Option>
                <Option value="GBP">GBP - British Pound</Option>
                <Option value="CAD">CAD - Canadian Dollar</Option>
                <Option value="AUD">AUD - Australian Dollar</Option>
                <Option value="ETB">ETB - Ethiopian Birr</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="default_price_list"
              label="Default Price List"
            >
              <Select placeholder="Select price list">
                <Option value="Standard">Standard Selling</Option>
                <Option value="Wholesale">Wholesale</Option>
                <Option value="Retail">Retail</Option>
                <Option value="Premium">Premium</Option>
                <Option value="Discount">Discount</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="language"
              label="Language"
            >
              <Select placeholder="Select language">
                <Option value="en">English</Option>
                <Option value="es">Spanish</Option>
                <Option value="fr">French</Option>
                <Option value="de">German</Option>
                <Option value="zh">Chinese</Option>
                <Option value="am">Amharic</Option>
              </Select>
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="credit_days"
              label="Credit Days"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter credit days"
                min={0}
                max={365}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="default_bank_account"
              label="Default Bank Account"
            >
              <Select placeholder="Select bank account">
                <Option value="Primary Checking">Primary Checking - ****1234</Option>
                <Option value="Business Savings">Business Savings - ****5678</Option>
                <Option value="USD Account">USD Account - ****9012</Option>
                <Option value="EUR Account">EUR Account - ****3456</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Loyalty & Portal */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <StarOutlined className="mr-2" />
          Loyalty & Portal Access
        </h3>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="loyalty_program"
              label="Loyalty Program"
            >
              <Select placeholder="Select loyalty program">
                <Option value="Gold">Gold Tier</Option>
                <Option value="Silver">Silver Tier</Option>
                <Option value="Bronze">Bronze Tier</Option>
                <Option value="Platinum">Platinum Tier</Option>
                <Option value="None">No Program</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="loyalty_points"
              label="Loyalty Points"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Current points"
                min={0}
                disabled
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="customer_portal_access"
              label="Portal Access"
              valuePropName="checked"
            >
              <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="portal_username"
              label="Portal Username"
            >
              <Input placeholder="Enter portal username" />
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