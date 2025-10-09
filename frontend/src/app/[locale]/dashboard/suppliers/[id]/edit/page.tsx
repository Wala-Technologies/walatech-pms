'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Breadcrumb, message, Card, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, HomeOutlined, ShopOutlined, EditOutlined } from '@ant-design/icons';
import Link from 'next/link';
import SupplierForm from '../../components/SupplierForm';
import { supplierApi, Supplier, UpdateSupplierDto, SupplierStatus, SupplierType } from '../../../../../../lib/supplier-api';

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const supplierId = params.id as string;
  const t = useTranslations('suppliers');

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplier = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierApi.getSupplier(supplierId);
      setSupplier(response.data || null);
    } catch (error) {
      console.error('Error fetching supplier:', error);
      setError(t('messages.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [supplierId, t]);

  useEffect(() => {
    fetchSupplier();
  }, [fetchSupplier]);

  const handleSubmit = useCallback(async (values: UpdateSupplierDto) => {
    try {
      setSubmitLoading(true);
      await supplierApi.updateSupplier(supplierId, values);

      message.success(t('messages.updateSuccess'));
      router.push(`/${locale}/dashboard/suppliers/list`);
    } catch (error) {
      console.error('Error updating supplier:', error);
      message.error(t('messages.updateError'));
    } finally {
      setSubmitLoading(false);
    }
  }, [t, locale, router, supplierId]);

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message={t('error')}
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchSupplier}>
              {t('retry')}
            </Button>
          }
        />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message={t('notFound')}
          description={t('supplierNotFound')}
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => router.push(`/${locale}/dashboard/suppliers/list`)}>
              {t('backToList')}
            </Button>
          }
        />
      </div>
    );
  }

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
                <Link href={`/${locale}/dashboard/suppliers/${supplierId}`}>
                  {supplier.name}
                </Link>
              ),
            },
            {
              title: (
                <>
                  <EditOutlined /> {t('edit')}
                </>
              ),
            },
          ]}
        />

        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
          {t('editSupplier')}: {supplier.name}
        </h1>
        <p style={{ color: '#666', margin: '8px 0 0 0' }}>
          {t('editSupplierDescription')}
        </p>
      </div>

      {/* Form */}
      <Card>
        <SupplierForm
          initialValues={supplier}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={submitLoading}
          submitText={t('updateSupplier')}
          showCancelButton={true}
          isEdit={true}
        />
      </Card>
    </div>
  );
}