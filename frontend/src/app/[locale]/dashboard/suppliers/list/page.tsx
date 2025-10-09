'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Dropdown,
  Modal,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Tooltip,
  Avatar,
  DatePicker,
  Breadcrumb,
  Divider,
  Typography,
} from 'antd';

const { Text } = Typography;
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ShopOutlined,
  TeamOutlined,
  ExportOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  DollarOutlined,
  TrophyOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { 
  supplierApi, 
  Supplier, 
  SupplierStatus,
  SupplierType,
  HoldType,
  SupplierQueryParams 
} from '../../../../../lib/supplier-api';

const { Search } = Input;
const { Option } = Select;

interface SupplierStats {
  total: number;
  active: number;
  disabled: number;
  onHold: number;
  byType: { [key: string]: number };
  byCountry: { [key: string]: number };
}

export default function SuppliersPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('suppliers');

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    supplierType: '',
    status: '',
    country: '',
    holdType: '',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Mock data for development
  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'Global Manufacturing Co.',
      code: 'GM001',
      isActive: true,
      type: SupplierType.MANUFACTURER,
      email: 'contact@globalmanufacturing.com',
      phone: '+1234567890',
      address: '123 Industrial Ave',
      city: 'Detroit',
      region: 'Michigan',
      country: 'USA',
      postalCode: '48201',
      status: SupplierStatus.ACTIVE,
      creditLimit: 100000,
      paymentTerms: 'Net 30',
      taxId: 'TAX123456',
      website: 'https://globalmanufacturing.com',
      contactPerson: 'John Manager',
      contactEmail: 'john@globalmanufacturing.com',
      contactPhone: '+1234567891',
      bankName: 'First National Bank',
      bankAccount: '1234567890',
      routingNumber: '123456789',
      groupId: 'group1',
      notes: 'Reliable supplier for manufacturing components',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Tech Solutions Ltd.',
      code: 'TS001',
      isActive: true,
      type: SupplierType.DISTRIBUTOR,
      email: 'info@techsolutions.com',
      phone: '+44123456789',
      address: '456 Tech Park',
      city: 'London',
      country: 'UK',
      postalCode: 'SW1A 1AA',
      status: SupplierStatus.ACTIVE,
      creditLimit: 75000,
      paymentTerms: 'Net 15',
      taxId: 'UK123456789',
      website: 'https://techsolutions.com',
      contactPerson: 'Sarah Tech',
      contactEmail: 'sarah@techsolutions.com',
      contactPhone: '+44123456790',
      bankName: 'Barclays Bank',
      bankAccount: '9876543210',
      groupId: 'group2',
      notes: 'Technology equipment distributor',
      createdAt: '2024-01-20T14:15:00Z',
      updatedAt: '2024-01-20T14:15:00Z',
    },
    {
      id: '3',
      name: 'Local Services Inc.',
      code: 'LS001',
      isActive: false,
      type: SupplierType.SERVICE_PROVIDER,
      email: 'contact@localservices.com',
      phone: '+1987654321',
      address: '789 Service St',
      city: 'Chicago',
      region: 'Illinois',
      country: 'USA',
      postalCode: '60601',
      status: SupplierStatus.DISABLED,
      creditLimit: 25000,
      paymentTerms: 'Net 45',
      taxId: 'TAX789012',
      contactPerson: 'Mike Service',
      bankName: 'Chase Bank',
      bankAccount: '5555666677',
      routingNumber: '987654321',
      groupId: 'group3',
      notes: 'Local maintenance and repair services',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-25T16:30:00Z',
    },
  ];

  const mockStats: SupplierStats = {
    total: 3,
    active: 2,
    disabled: 1,
    onHold: 0,
    byType: { 
      [SupplierType.MANUFACTURER]: 1, 
      [SupplierType.DISTRIBUTOR]: 1, 
      [SupplierType.SERVICE_PROVIDER]: 1 
    },
    byCountry: { USA: 2, UK: 1 },
  };

  useEffect(() => {
    fetchSuppliers();
    fetchStats();
  }, [pagination.current, pagination.pageSize, searchTerm, filters]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const queryParams: SupplierQueryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchTerm || undefined,
        type: (filters.supplierType || undefined) as SupplierType | undefined,
        status: (filters.status || undefined) as SupplierStatus | undefined,
        country: filters.country || undefined,
      };
      const response = await supplierApi.getSuppliers(queryParams);
      const list = response.data?.suppliers || [];
      const total = response.data?.total || 0;
      setSuppliers(list);
      setPagination(prev => ({ ...prev, total }));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      message.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await supplierApi.getSupplierStats();
      const s = response.data;
      if (s) {
        const total = s.totalSuppliers || 0;
        const active = s.activeSuppliers || 0;
        const onHold = s.suppliersOnHold || 0;
        const disabled = Math.max(total - active - onHold, 0);
        setStats({ total, active, disabled, onHold, byType: {}, byCountry: {} });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (paginationConfig: any) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));
  };

  const handleActivateSupplier = async (supplierId: string) => {
    try {
      await supplierApi.activateSupplier(supplierId);
      message.success(t('messages.supplierActivated'));
      fetchSuppliers();
    } catch (error) {
      message.error(t('messages.activationFailed'));
    }
  };

  const handleDeactivateSupplier = async (supplierId: string) => {
    try {
      await supplierApi.deactivateSupplier(supplierId);
      message.success(t('messages.supplierDeactivated'));
      fetchSuppliers();
    } catch (error) {
      message.error(t('messages.deactivationFailed'));
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    Modal.confirm({
      title: t('confirmDelete'),
      content: t('deleteWarning'),
      okText: t('delete'),
      okType: 'danger',
      cancelText: t('cancel'),
      onOk: async () => {
        try {
          await supplierApi.deleteSupplier(supplierId);
          message.success(t('messages.supplierDeleted'));
          fetchSuppliers();
        } catch (error) {
          message.error(t('messages.deleteFailed'));
        }
      },
    });
  };

  const handleBulkActivate = async () => {
    try {
      await Promise.all(selectedRowKeys.map(id => supplierApi.activateSupplier(id)));
      message.success(t('messages.supplierActivated'));
      setSelectedRowKeys([]);
      fetchSuppliers();
    } catch (error) {
      message.error(t('messages.activationFailed'));
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await Promise.all(selectedRowKeys.map(id => supplierApi.deactivateSupplier(id)));
      message.success(t('messages.supplierDeactivated'));
      setSelectedRowKeys([]);
      fetchSuppliers();
    } catch (error) {
      message.error(t('messages.deactivationFailed'));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map(id => supplierApi.deleteSupplier(id)));
      message.success(t('messages.supplierDeleted'));
      setSelectedRowKeys([]);
      fetchSuppliers();
    } catch (error) {
      message.error(t('messages.deleteFailed'));
    }
  };

  const getStatusColor = (status: SupplierStatus) => {
    switch (status) {
      case SupplierStatus.ACTIVE:
        return 'green';
      case SupplierStatus.DISABLED:
        return 'red';
      default:
        return 'default';
    }
  };

  const getActionItems = (supplier: Supplier): MenuProps['items'] => [
    {
      key: 'view',
      label: t('view'),
      icon: <EyeOutlined />,
      onClick: () => router.push(`/${locale}/dashboard/suppliers/${supplier.id}`),
    },
    {
      key: 'edit',
      label: t('edit'),
      icon: <EditOutlined />,
      onClick: () => router.push(`/${locale}/dashboard/suppliers/${supplier.id}/edit`),
    },
    {
      type: 'divider',
    },
    ...(supplier.status === SupplierStatus.ACTIVE
      ? [
          {
            key: 'deactivate',
            label: t('deactivate'),
            icon: <StopOutlined />,
            onClick: () => handleDeactivateSupplier(supplier.id),
          },
        ]
      : [
          {
            key: 'activate',
            label: t('activate'),
            icon: <CheckCircleOutlined />,
            onClick: () => handleActivateSupplier(supplier.id),
          },
        ]),
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: t('delete'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteSupplier(supplier.id),
    },
  ];

  const columns: ColumnsType<Supplier> = [
    {
      title: t('supplierCode'),
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => (
        <Text strong>{code}</Text>
      ),
    },
    {
      title: t('supplierName'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Supplier) => (
        <Space>
          <Avatar icon={<ShopOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: t('supplierType'),
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: SupplierType) => (
        <Tag color="blue">{t(`supplierTypes.${type}`)}</Tag>
      ),
    },
    {
      title: t('location'),
      key: 'location',
      width: 150,
      render: (_, record: Supplier) => (
        <div>
          <div>{record.city}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.country}</div>
        </div>
      ),
    },
    {
      title: t('contactInfo'),
      key: 'contact',
      width: 200,
      render: (_, record: Supplier) => (
        <div>
          <div>{record.contactPerson}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: t('creditLimit'),
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      width: 120,
      render: (amount: number) => (
        <span>${amount?.toLocaleString() || 0}</span>
      ),
    },
    {
      title: t('statusLabel'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: SupplierStatus) => (
        <Tag color={getStatusColor(status)}>
          {t(`statuses.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('actionsColumn'),
      key: 'actions',
      width: 80,
      render: (_, record: Supplier) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
  };

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb
        style={{ marginBottom: '16px' }}
        items={[
          {
            title: t('dashboard'),
          },
          {
            title: t('suppliers'),
          },
        ]}
      />

      {/* Statistics Cards */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title={t('totalSuppliers')}
                value={stats.total}
                prefix={<ShopOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title={t('activeSuppliers')}
                value={stats.active}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title={t('disabledSuppliers')}
                value={stats.disabled}
                prefix={<StopOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title={t('onHoldSuppliers')}
                value={stats.onHold}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Content */}
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{t('supplierList')}</h2>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push(`/${locale}/dashboard/suppliers/new`)}
            >
              {t('addSupplier')}
            </Button>
            <Button icon={<ExportOutlined />}>
              {t('export')}
            </Button>
          </Space>
        </div>

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={8} md={6}>
            <Search
              placeholder={t('searchSuppliers')}
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder={t('supplierType')}
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('supplierType', value || '')}
            >
              <Option value={SupplierType.MANUFACTURER}>{t(`supplierTypes.${SupplierType.MANUFACTURER}`)}</Option>
              <Option value={SupplierType.DISTRIBUTOR}>{t(`supplierTypes.${SupplierType.DISTRIBUTOR}`)}</Option>
              <Option value={SupplierType.SERVICE_PROVIDER}>{t(`supplierTypes.${SupplierType.SERVICE_PROVIDER}`)}</Option>
              <Option value={SupplierType.CONTRACTOR}>{t(`supplierTypes.${SupplierType.CONTRACTOR}`)}</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder={t('statusLabel')}
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('status', value || '')}
            >
              <Option value={SupplierStatus.ACTIVE}>{t(`statuses.${SupplierStatus.ACTIVE}`)}</Option>
              <Option value={SupplierStatus.DISABLED}>{t(`statuses.${SupplierStatus.DISABLED}`)}</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder={t('country')}
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('country', value || '')}
            >
              <Option value="USA">USA</Option>
              <Option value="UK">UK</Option>
              <Option value="Canada">Canada</Option>
              <Option value="Germany">Germany</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Space>
              <Button icon={<FilterOutlined />}>
                {t('advancedFilters')}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchSuppliers}>
                {t('refresh')}
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Bulk Actions */}
        {selectedRowKeys.length > 0 && (
          <div style={{ marginBottom: '16px', padding: '8px', background: '#f0f2f5', borderRadius: '4px' }}>
            <Space>
              <span>{t('selectedItems', { count: selectedRowKeys.length })}</span>
              <Button size="small" onClick={handleBulkActivate}>{t('bulkActivate')}</Button>
              <Button size="small" onClick={handleBulkDeactivate}>{t('bulkDeactivate')}</Button>
              <Button size="small" danger onClick={handleBulkDelete}>{t('bulkDelete')}</Button>
            </Space>
          </div>
        )}

        {/* Table */}
        <Table
          columns={columns}
          dataSource={suppliers}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} suppliers`,
          }}
          rowSelection={rowSelection}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}