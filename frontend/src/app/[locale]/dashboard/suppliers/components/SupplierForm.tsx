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
  Card,
  DatePicker,
  Upload,
  Tag,
  Tooltip,
} from 'antd';
import {
  SaveOutlined,
  ShopOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  DollarOutlined,
  FileTextOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  BankOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { 
  Supplier, 
  SupplierStatus, 
  SupplierType, 
  CreateSupplierDto, 
  UpdateSupplierDto 
} from '../../../../../lib/supplier-api';

const { Option } = Select;
const { TextArea } = Input;

interface SupplierFormData {
  supplierName: string;
  supplierCode?: string;
  supplierType: SupplierType;
  status: SupplierStatus;
  email?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  registrationNumber?: string;
  
  // Address Information
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  
  // Contact Person
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  contactPersonPosition?: string;
  
  // Financial Information
  creditLimit?: number;
  paymentTerms?: string;
  currency?: string;
  
  // Banking Information
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankSwiftCode?: string;
  bankIban?: string;
  
  // Additional Information
  notes?: string;
  tags?: string[];
  isPreferredSupplier?: boolean;
  leadTime?: number;
  minimumOrderValue?: number;
  
  // Compliance
  certifications?: string[];
  qualityRating?: number;
  deliveryRating?: number;
  serviceRating?: number;
}

interface SupplierFormProps {
  initialValues?: Partial<SupplierFormData>;
  onSubmit: (values: CreateSupplierDto | UpdateSupplierDto) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  submitText?: string;
  showCancelButton?: boolean;
  isEdit?: boolean;
}

export default function SupplierForm({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  submitText,
  showCancelButton = true,
  isEdit = false,
}: SupplierFormProps) {
  const [form] = Form.useForm();
  const t = useTranslations('suppliers');
  const [tags, setTags] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setTags(initialValues.tags || []);
      setCertifications(initialValues.certifications || []);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values: SupplierFormData) => {
    try {
      const formattedValues = {
        ...values,
        tags,
        certifications,
      };
      await onSubmit(formattedValues);
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error(isEdit ? t('messages.updateError') : t('messages.createError'));
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleTagRemove = (removedTag: string) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  const handleCertificationAdd = (cert: string) => {
    if (cert && !certifications.includes(cert)) {
      setCertifications([...certifications, cert]);
    }
  };

  const handleCertificationRemove = (removedCert: string) => {
    setCertifications(certifications.filter(cert => cert !== removedCert));
  };

  const defaultSubmitText = isEdit ? t('updateSupplier') : t('createSupplier');

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        supplierType: SupplierType.INDIVIDUAL,
        status: SupplierStatus.ACTIVE,
        currency: 'USD',
        creditLimit: 0,
        leadTime: 7,
        minimumOrderValue: 0,
        isPreferredSupplier: false,
        qualityRating: 0,
        deliveryRating: 0,
        serviceRating: 0,
        ...initialValues,
      }}
    >
      {/* Basic Information */}
      <Card title={
        <Space>
          <ShopOutlined />
          {t('basicInformation')}
        </Space>
      } style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="supplierName"
              label={t('supplierName')}
              rules={[{ required: true, message: t('validation.supplierNameRequired') }]}
            >
              <Input placeholder={t('placeholders.supplierName')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="supplierCode"
              label={t('supplierCode')}
            >
              <Input placeholder={t('placeholders.supplierCode')} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="supplierType"
              label={t('supplierType')}
              rules={[{ required: true, message: t('validation.supplierTypeRequired') }]}
            >
              <Select placeholder={t('placeholders.supplierType')}>
                <Option value={SupplierType.MANUFACTURER}>{t('supplierTypes.MANUFACTURER')}</Option>
                <Option value={SupplierType.DISTRIBUTOR}>{t('supplierTypes.DISTRIBUTOR')}</Option>
                <Option value={SupplierType.WHOLESALER}>{t('supplierTypes.WHOLESALER')}</Option>
                <Option value={SupplierType.RETAILER}>{t('supplierTypes.RETAILER')}</Option>
                <Option value={SupplierType.SERVICE_PROVIDER}>{t('supplierTypes.SERVICE_PROVIDER')}</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label={t('statusLabel')}
              rules={[{ required: true, message: t('validation.statusRequired') }]}
            >
              <Select placeholder={t('placeholders.status')}>
                <Option value={SupplierStatus.ACTIVE}>{t('status.active')}</Option>
                <Option value={SupplierStatus.DISABLED}>{t('status.disabled')}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="taxId"
              label={t('taxId')}
            >
              <Input placeholder={t('placeholders.taxId')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="registrationNumber"
              label={t('registrationNumber')}
            >
              <Input placeholder={t('placeholders.registrationNumber')} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Contact Information */}
      <Card title={
        <Space>
          <MailOutlined />
          {t('contactInformation')}
        </Space>
      } style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label={t('email')}
              rules={[{ type: 'email', message: t('validation.emailInvalid') }]}
            >
              <Input placeholder={t('placeholders.email')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label={t('phone')}
            >
              <Input placeholder={t('placeholders.phone')} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="website"
              label={t('website')}
            >
              <Input placeholder={t('placeholders.website')} />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider orientation="left">{t('contactPerson')}</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactPersonName"
              label={t('contactPersonName')}
            >
              <Input placeholder={t('placeholders.contactPersonName')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contactPersonPosition"
              label={t('contactPersonPosition')}
            >
              <Input placeholder={t('placeholders.contactPersonPosition')} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactPersonEmail"
              label={t('contactPersonEmail')}
              rules={[{ type: 'email', message: t('validation.emailInvalid') }]}
            >
              <Input placeholder={t('placeholders.contactPersonEmail')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contactPersonPhone"
              label={t('contactPersonPhone')}
            >
              <Input placeholder={t('placeholders.contactPersonPhone')} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Address Information */}
      <Card title={
        <Space>
          <HomeOutlined />
          {t('addressInformation')}
        </Space>
      } style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="addressLine1"
              label={t('addressLine1')}
            >
              <Input placeholder={t('placeholders.addressLine1')} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="addressLine2"
              label={t('addressLine2')}
            >
              <Input placeholder={t('placeholders.addressLine2')} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="city"
              label={t('city')}
            >
              <Input placeholder={t('placeholders.city')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="state"
              label={t('state')}
            >
              <Input placeholder={t('placeholders.state')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="postalCode"
              label={t('postalCode')}
            >
              <Input placeholder={t('placeholders.postalCode')} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="country"
              label={t('country')}
            >
              <Select
                placeholder={t('placeholders.country')}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option value="US">United States</Option>
                <Option value="CA">Canada</Option>
                <Option value="GB">United Kingdom</Option>
                <Option value="DE">Germany</Option>
                <Option value="FR">France</Option>
                <Option value="IT">Italy</Option>
                <Option value="ES">Spain</Option>
                <Option value="NL">Netherlands</Option>
                <Option value="BE">Belgium</Option>
                <Option value="CH">Switzerland</Option>
                <Option value="AT">Austria</Option>
                <Option value="SE">Sweden</Option>
                <Option value="NO">Norway</Option>
                <Option value="DK">Denmark</Option>
                <Option value="FI">Finland</Option>
                <Option value="JP">Japan</Option>
                <Option value="CN">China</Option>
                <Option value="IN">India</Option>
                <Option value="AU">Australia</Option>
                <Option value="BR">Brazil</Option>
                <Option value="MX">Mexico</Option>
                <Option value="ET">Ethiopia</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>
// Financial Information
<Card title={
  <Space>
    <DollarOutlined />
    {t('financialInformation')}
  </Space>
} style={{ marginBottom: 16 }}>
  <Row gutter={16}>
    <Col span={8}>
      <Form.Item
        name="creditLimit"
        label={t('creditLimit')}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          placeholder={t('placeholders.creditLimit')}
          prefix="$"
        />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item
        name="currency"
        label={t('currency')}
      >
        <Select placeholder={t('placeholders.currency')}>
          <Option value="USD">USD - US Dollar</Option>
          <Option value="EUR">EUR - Euro</Option>
          <Option value="GBP">GBP - British Pound</Option>
          <Option value="ETB">ETB - Ethiopian Birr</Option>
          <Option value="CAD">CAD - Canadian Dollar</Option>
          <Option value="JPY">JPY - Japanese Yen</Option>
          <Option value="CNY">CNY - Chinese Yuan</Option>
        </Select>
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item
        name="paymentTerms"
        label={t('paymentTerms')}
      >
        <Select placeholder={t('placeholders.paymentTerms')}>
          <Option value="NET_30">Net 30 Days</Option>
          <Option value="NET_60">Net 60 Days</Option>
          <Option value="NET_90">Net 90 Days</Option>
          <Option value="COD">Cash on Delivery</Option>
          <Option value="PREPAID">Prepaid</Option>
          <Option value="2_10_NET_30">2/10 Net 30</Option>
        </Select>
      </Form.Item>
    </Col>
  </Row>
  <Row gutter={16}>
    <Col span={12}>
      <Form.Item
        name="leadTime"
        label={
          <Space>
            {t('leadTime')}
            <Tooltip title={t('tooltips.leadTime')}>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        }
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          placeholder={t('placeholders.leadTime')}
          addonAfter="days"
        />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item
        name="minimumOrderValue"
        label={t('minimumOrderValue')}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          placeholder={t('placeholders.minimumOrderValue')}
          prefix="$"
        />
      </Form.Item>
    </Col>
  </Row>
</Card>
      {/* Banking Information */}
      <Card title={
        <Space>
          <BankOutlined />
          {t('bankingInformation')}
        </Space>
      } style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="bankName"
              label={t('bankName')}
            >
              <Input placeholder={t('placeholders.bankName')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="bankAccountName"
              label={t('bankAccountName')}
            >
              <Input placeholder={t('placeholders.bankAccountName')} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="bankAccountNumber"
              label={t('bankAccountNumber')}
            >
              <Input placeholder={t('placeholders.bankAccountNumber')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="bankSwiftCode"
              label={t('bankSwiftCode')}
            >
              <Input placeholder={t('placeholders.bankSwiftCode')} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="bankIban"
              label={t('bankIban')}
            >
              <Input placeholder={t('placeholders.bankIban')} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Additional Information */}
      <Card title={
        <Space>
          <FileTextOutlined />
          {t('additionalInformation')}
        </Space>
      } style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isPreferredSupplier"
              label={t('isPreferredSupplier')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="qualityRating"
              label={t('qualityRating')}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={5}
                step={0.1}
                placeholder={t('placeholders.rating')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="deliveryRating"
              label={t('deliveryRating')}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={5}
                step={0.1}
                placeholder={t('placeholders.rating')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="serviceRating"
              label={t('serviceRating')}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={5}
                step={0.1}
                placeholder={t('placeholders.rating')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="notes"
          label={t('notes')}
        >
          <TextArea
            rows={4}
            placeholder={t('placeholders.notes')}
          />
        </Form.Item>

        <Form.Item label={t('tags')}>
          <div style={{ marginBottom: 8 }}>
            {tags.map((tag) => (
              <Tag
                key={tag}
                closable
                onClose={() => handleTagRemove(tag)}
                style={{ marginBottom: 4 }}
              >
                {tag}
              </Tag>
            ))}
          </div>
          <Input
            placeholder={t('placeholders.addTag')}
            onPressEnter={(e) => {
              const value = (e.target as HTMLInputElement).value.trim();
              if (value) {
                handleTagAdd(value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </Form.Item>

        <Form.Item label={t('certifications')}>
          <div style={{ marginBottom: 8 }}>
            {certifications.map((cert) => (
              <Tag
                key={cert}
                closable
                onClose={() => handleCertificationRemove(cert)}
                style={{ marginBottom: 4 }}
                color="blue"
              >
                {cert}
              </Tag>
            ))}
          </div>
          <Input
            placeholder={t('placeholders.addCertification')}
            onPressEnter={(e) => {
              const value = (e.target as HTMLInputElement).value.trim();
              if (value) {
                handleCertificationAdd(value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </Form.Item>
      </Card>

      {/* Form Actions */}
      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Space>
          {showCancelButton && onCancel && (
            <Button onClick={onCancel} disabled={loading}>
              {t('cancel')}
            </Button>
          )}
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
          >
            {submitText || defaultSubmitText}
          </Button>
        </Space>
      </div>
    </Form>
  );
}