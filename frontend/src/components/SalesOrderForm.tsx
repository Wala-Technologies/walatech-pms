'use client';

import React, { useState, useEffect } from 'react';
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
  Table,
  Space,
  Divider,
  Typography,
  message,
  Popconfirm,
  Tag,
  Tooltip,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { SalesOrder, SalesOrderItem, CreateSalesOrderData, UpdateSalesOrderData } from '../lib/sales-order-api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface SalesOrderFormProps {
  initialValues?: SalesOrder;
  onSubmit: (data: CreateSalesOrderData | UpdateSalesOrderData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  customers?: Array<{ id: string; name: string; email?: string }>;
  items?: Array<{ code: string; name: string; rate: number; uom?: string }>;
}

interface FormItem extends Omit<SalesOrderItem, 'id'> {
  key: string;
}

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  customers = [],
  items = [],
}) => {
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState<FormItem[]>([]);
  const [totals, setTotals] = useState({
    totalQty: 0,
    baseTotal: 0,
    grandTotal: 0,
  });

  const isEditing = !!initialValues;

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        customer_id: initialValues.customer_id,
        transaction_date: dayjs(initialValues.transaction_date),
        delivery_date: dayjs(initialValues.delivery_date),
        order_type: initialValues.order_type,
        currency: initialValues.currency,
        conversion_rate: initialValues.conversion_rate,
        selling_price_list: initialValues.selling_price_list,
        customer_po_no: initialValues.customer_po_no,
        customer_po_date: initialValues.customer_po_date ? dayjs(initialValues.customer_po_date) : null,
        terms: initialValues.terms,
        remarks: initialValues.remarks,
        territory: initialValues.territory,
        sales_person: initialValues.sales_person,
        commission_rate: initialValues.commission_rate,
        company_address: initialValues.company_address,
        customer_address: initialValues.customer_address,
        shipping_address: initialValues.shipping_address,
        contact_person: initialValues.contact_person,
        contact_email: initialValues.contact_email,
        contact_mobile: initialValues.contact_mobile,
      });

      const formattedItems = initialValues.items.map((item, index) => ({
        ...item,
        key: `item-${index}`,
        delivery_date: item.delivery_date,
      }));
      setOrderItems(formattedItems);
    }
  }, [initialValues, form]);

  useEffect(() => {
    calculateTotals();
  }, [orderItems]);

  const calculateTotals = () => {
    const totalQty = orderItems.reduce((sum, item) => sum + (item.qty || 0), 0);
    const baseTotal = orderItems.reduce((sum, item) => sum + ((item.qty || 0) * (item.rate || 0)), 0);
    
    setTotals({
      totalQty,
      baseTotal,
      grandTotal: baseTotal, // Simplified - in real app, add taxes and charges
    });
  };

  const addItem = () => {
    const newItem: FormItem = {
      key: `item-${Date.now()}`,
      item_code: '',
      item_name: '',
      description: '',
      qty: 1,
      rate: 0,
      delivery_date: dayjs().add(7, 'days').format('YYYY-MM-DD'),
      uom: 'Nos',
      stock_uom: 'Nos',
      conversion_factor: 1,
      delivered_qty: 0,
      billed_qty: 0,
      returned_qty: 0,
      discount_percentage: 0,
      discount_amount: 0,
      is_free_item: false,
      is_stock_item: true,
      supplier_delivers_to_customer: false,
    };
    setOrderItems([...orderItems, newItem]);
  };

  const removeItem = (key: string) => {
    setOrderItems(orderItems.filter(item => item.key !== key));
  };

  const updateItem = (key: string, field: keyof FormItem, value: any) => {
    setOrderItems(orderItems.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-calculate amount when qty or rate changes
        if (field === 'qty' || field === 'rate') {
          updatedItem.amount = (updatedItem.qty || 0) * (updatedItem.rate || 0);
          updatedItem.net_amount = updatedItem.amount - (updatedItem.discount_amount || 0);
        }
        
        // Auto-populate item details when item_code is selected
        if (field === 'item_code') {
          const selectedItem = items.find(i => i.code === value);
          if (selectedItem) {
            updatedItem.item_name = selectedItem.name;
            updatedItem.rate = selectedItem.rate;
            updatedItem.uom = selectedItem.uom || 'Nos';
            updatedItem.amount = (updatedItem.qty || 0) * selectedItem.rate;
            updatedItem.net_amount = updatedItem.amount;
          }
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSubmit = async (values: any) => {
    if (orderItems.length === 0) {
      message.error('Please add at least one item');
      return;
    }

    try {
      const formData = {
        ...values,
        transaction_date: values.transaction_date.format('YYYY-MM-DD'),
        delivery_date: values.delivery_date.format('YYYY-MM-DD'),
        customer_po_date: values.customer_po_date?.format('YYYY-MM-DD'),
        items: orderItems.map(({ key, ...item }) => ({
          ...item,
          amount: (item.qty || 0) * (item.rate || 0),
          net_amount: ((item.qty || 0) * (item.rate || 0)) - (item.discount_amount || 0),
        })),
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const itemColumns = [
    {
      title: 'Item Code',
      dataIndex: 'item_code',
      key: 'item_code',
      width: 150,
      render: (value: string, record: FormItem) => (
        <Select
          value={value}
          onChange={(val) => updateItem(record.key, 'item_code', val)}
          placeholder="Select item"
          showSearch
          style={{ width: '100%' }}
        >
          {items.map(item => (
            <Option key={item.code} value={item.code}>
              {item.code} - {item.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Item Name',
      dataIndex: 'item_name',
      key: 'item_name',
      width: 200,
      render: (value: string, record: FormItem) => (
        <Input
          value={value}
          onChange={(e) => updateItem(record.key, 'item_name', e.target.value)}
          placeholder="Item name"
        />
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      width: 80,
      render: (value: number, record: FormItem) => (
        <InputNumber
          value={value}
          onChange={(val) => updateItem(record.key, 'qty', val || 0)}
          min={0}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      width: 100,
      render: (value: number, record: FormItem) => (
        <InputNumber
          value={value}
          onChange={(val) => updateItem(record.key, 'rate', val || 0)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (value: number, record: FormItem) => (
        <Text strong>{((record.qty || 0) * (record.rate || 0)).toFixed(2)}</Text>
      ),
    },
    {
      title: 'Delivery Date',
      dataIndex: 'delivery_date',
      key: 'delivery_date',
      width: 120,
      render: (value: string, record: FormItem) => (
        <DatePicker
          value={value ? dayjs(value) : null}
          onChange={(date) => updateItem(record.key, 'delivery_date', date?.format('YYYY-MM-DD'))}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'UOM',
      dataIndex: 'uom',
      key: 'uom',
      width: 80,
      render: (value: string, record: FormItem) => (
        <Select
          value={value}
          onChange={(val) => updateItem(record.key, 'uom', val)}
          style={{ width: '100%' }}
        >
          <Option value="Nos">Nos</Option>
          <Option value="Kg">Kg</Option>
          <Option value="Meter">Meter</Option>
          <Option value="Liter">Liter</Option>
        </Select>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 60,
      render: (_: any, record: FormItem) => (
        <Popconfirm
          title="Are you sure you want to remove this item?"
          onConfirm={() => removeItem(record.key)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>
          {isEditing ? 'Edit Sales Order' : 'Create Sales Order'}
        </Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            order_type: 'Sales',
            currency: 'USD',
            conversion_rate: 1,
            commission_rate: 0,
            transaction_date: dayjs(),
            delivery_date: dayjs().add(7, 'days'),
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="customer_id"
                label="Customer"
                rules={[{ required: true, message: 'Please select a customer' }]}
              >
                <Select placeholder="Select customer" showSearch>
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name} {customer.email && `(${customer.email})`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="transaction_date"
                label="Transaction Date"
                rules={[{ required: true, message: 'Please select transaction date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="delivery_date"
                label="Delivery Date"
                rules={[{ required: true, message: 'Please select delivery date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="order_type" label="Order Type">
                <Select>
                  <Option value="Sales">Sales</Option>
                  <Option value="Maintenance">Maintenance</Option>
                  <Option value="Shopping Cart">Shopping Cart</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="currency" label="Currency">
                <Select>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                  <Option value="GBP">GBP</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="conversion_rate" label="Conversion Rate">
                <InputNumber min={0} precision={4} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customer_po_no" label="Customer PO No">
                <Input placeholder="Customer purchase order number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customer_po_date" label="Customer PO Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sales_person" label="Sales Person">
                <Input placeholder="Sales person name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="territory" label="Territory">
                <Input placeholder="Territory" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Items</Divider>
          
          <div style={{ marginBottom: 16 }}>
            <Button type="dashed" onClick={addItem} icon={<PlusOutlined />}>
              Add Item
            </Button>
          </div>

          <Table
            dataSource={orderItems}
            columns={itemColumns}
            pagination={false}
            scroll={{ x: 1000 }}
            size="small"
          />

          <Card style={{ marginTop: 16 }}>
            <Row justify="end">
              <Col span={8}>
                <div style={{ textAlign: 'right' }}>
                  <div>
                    <Text>Total Qty: </Text>
                    <Text strong>{totals.totalQty}</Text>
                  </div>
                  <div>
                    <Text>Total: </Text>
                    <Text strong>${totals.baseTotal.toFixed(2)}</Text>
                  </div>
                  <div style={{ fontSize: '16px', marginTop: '8px' }}>
                    <Text>Grand Total: </Text>
                    <Text strong>${totals.grandTotal.toFixed(2)}</Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Form.Item name="terms" label="Terms and Conditions">
                <TextArea rows={3} placeholder="Terms and conditions" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="remarks" label="Remarks">
                <TextArea rows={3} placeholder="Additional remarks" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row justify="end">
            <Space>
              <Button onClick={onCancel} icon={<CloseOutlined />}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                {isEditing ? 'Update' : 'Create'} Sales Order
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default SalesOrderForm;