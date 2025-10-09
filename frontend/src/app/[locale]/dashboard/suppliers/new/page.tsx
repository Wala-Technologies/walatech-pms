'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Breadcrumb, message, Card } from 'antd';
import { ArrowLeftOutlined, HomeOutlined, ShopOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import SupplierForm from '../components/SupplierForm';
import { supplierApi, CreateSupplierDto, UpdateSupplierDto } from '../../../../../lib/supplier-api';

export default function NewSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('suppliers');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: CreateSupplierDto) => {
    try {
      setLoading(true);
      await supplierApi.createSupplier(values);
      
      message.success(t('messages.createSuccess'));
      router.push(`/${locale}/dashboard/suppliers/list`);
    } catch (error) {
      console.error('Error creating supplier:', error);
      message.error(t('messages.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: '16px' }}
        >
          {t('back')}
        </Button>
        
        <Breadcrumb
          style={{ marginBottom: '16px' }}
          items={[
            {
              title: (
                <Link href={`/${locale}/dashboard`}>
                  <HomeOutlined /> {t('dashboard')}
                </Link>
              ),
            },
            {
              title: (
                <Link href={`/${locale}/dashboard/suppliers`}>
                  <ShopOutlined /> {t('suppliers')}
                </Link>
              ),
            },
            {
              title: (
                <>
                  <PlusOutlined /> {t('addSupplier')}
                </>
              ),
            },
          ]}
        />
        
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
          {t('addSupplier')}
        </h1>
        <p style={{ color: '#666', margin: '8px 0 0 0' }}>
          {t('addSupplierDescription')}
        </p>
      </div>

      {/* Form */}
      <Card>
        <SupplierForm
          onSubmit={handleSubmit as (values: CreateSupplierDto | UpdateSupplierDto) => Promise<void>}
          onCancel={handleCancel}
          loading={loading}
          submitText={t('createSupplier')}
          showCancelButton={true}
          isEdit={false}
        />
      </Card>
    </div>
  );
}