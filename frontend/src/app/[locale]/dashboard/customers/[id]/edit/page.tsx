'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  message,
  Breadcrumb,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import CustomerForm from '../../components/CustomerForm';
import { customerApi } from '../../../../../../lib/customer-api';

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

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const customerId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [customerData, setCustomerData] = useState<Partial<CustomerFormData> | undefined>(undefined);

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setInitialLoading(true);
      const response = await customerApi.getCustomer(customerId);
      if (response.error) {
        throw new Error(response.error);
      }
      setCustomerData(response.data as CustomerFormData);
    } catch (error) {
      console.error('Failed to fetch customer:', error);
      message.error('Failed to fetch customer data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (values: CustomerFormData) => {
    setLoading(true);
    try {
      const response = await customerApi.updateCustomer(customerId, values);
      if (response.error) {
        throw new Error(response.error);
      }
      message.success('Customer updated successfully');
      router.push(`/${locale}/dashboard/customers/${customerId}`);
    } catch (error) {
      console.error('Failed to update customer:', error);
      message.error('Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/dashboard/customers/${customerId}`);
  };

  if (initialLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

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
          <Breadcrumb.Item>
            <a onClick={() => router.push(`/${locale}/dashboard/customers/${customerId}`)}>
              {customerData?.customer_name || 'Customer'}
            </a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Edit</Breadcrumb.Item>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
            <p className="text-gray-600">Update customer information</p>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
          >
            Back to Customer
          </Button>
        </div>
      </div>

      <CustomerForm
        initialValues={customerData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        submitText="Update Customer"
        showCancelButton={true}
      />
    </div>
  );
}