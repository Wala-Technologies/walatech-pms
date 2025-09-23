'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  DatePicker, 
  Select, 
  Input, 
  Space, 
  Typography, 
  Tag,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  DownloadOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface GLEntry {
  id: string;
  date: string;
  account: string;
  accountCode: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function GeneralLedgerPage() {
  const t = useTranslations('accounting');
  
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for GL entries
  const mockGLEntries: GLEntry[] = [
    {
      id: '1',
      date: '2024-01-15',
      account: 'Cash',
      accountCode: '1001',
      description: 'Initial cash deposit',
      reference: 'JE-001',
      debit: 10000,
      credit: 0,
      balance: 10000
    },
    {
      id: '2',
      date: '2024-01-16',
      account: 'Cash',
      accountCode: '1001',
      description: 'Office supplies purchase',
      reference: 'JE-002',
      debit: 0,
      credit: 500,
      balance: 9500
    },
    {
      id: '3',
      date: '2024-01-17',
      account: 'Cash',
      accountCode: '1001',
      description: 'Service revenue',
      reference: 'JE-003',
      debit: 2000,
      credit: 0,
      balance: 11500
    },
    {
      id: '4',
      date: '2024-01-18',
      account: 'Accounts Receivable',
      accountCode: '1200',
      description: 'Sales on credit',
      reference: 'JE-004',
      debit: 3000,
      credit: 0,
      balance: 3000
    },
    {
      id: '5',
      date: '2024-01-19',
      account: 'Accounts Receivable',
      accountCode: '1200',
      description: 'Payment received',
      reference: 'JE-005',
      debit: 0,
      credit: 1500,
      balance: 1500
    }
  ];

  // Mock accounts for filter
  const accounts = [
    { code: '1001', name: 'Cash' },
    { code: '1200', name: 'Accounts Receivable' },
    { code: '2001', name: 'Accounts Payable' },
    { code: '3001', name: 'Owner\'s Equity' },
    { code: '4001', name: 'Service Revenue' },
    { code: '5001', name: 'Office Supplies Expense' }
  ];

  const filteredEntries = mockGLEntries.filter(entry => {
    const matchesAccount = !selectedAccount || entry.accountCode === selectedAccount;
    const matchesSearch = !searchText || 
      entry.description.toLowerCase().includes(searchText.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchText.toLowerCase());
    
    let matchesDate = true;
    if (dateRange) {
      const entryDate = dayjs(entry.date);
      matchesDate = entryDate.isAfter(dateRange[0].subtract(1, 'day')) && 
                   entryDate.isBefore(dateRange[1].add(1, 'day'));
    }
    
    return matchesAccount && matchesSearch && matchesDate;
  });

  const totalDebits = filteredEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredits = filteredEntries.reduce((sum, entry) => sum + entry.credit, 0);

  const columns = [
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: GLEntry, b: GLEntry) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: t('account'),
      key: 'account',
      render: (record: GLEntry) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.account}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.accountCode}</div>
        </div>
      ),
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('reference'),
      dataIndex: 'reference',
      key: 'reference',
      render: (reference: string) => (
        <Tag color="blue">{reference}</Tag>
      ),
    },
    {
      title: t('debit'),
      dataIndex: 'debit',
      key: 'debit',
      align: 'right' as const,
      render: (amount: number) => amount > 0 ? `$${amount.toLocaleString()}` : '-',
    },
    {
      title: t('credit'),
      dataIndex: 'credit',
      key: 'credit',
      align: 'right' as const,
      render: (amount: number) => amount > 0 ? `$${amount.toLocaleString()}` : '-',
    },
    {
      title: t('balance'),
      dataIndex: 'balance',
      key: 'balance',
      align: 'right' as const,
      render: (balance: number) => (
        <span style={{ 
          color: balance >= 0 ? '#52c41a' : '#ff4d4f',
          fontWeight: 500 
        }}>
          ${balance.toLocaleString()}
        </span>
      ),
    },
  ];

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting GL entries...');
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>{t('generalLedger')}</Title>
        <p style={{ color: '#666', marginBottom: 0 }}>
          {t('viewDetailedTransactionHistory')}
        </p>
      </div>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('totalDebits')}
              value={totalDebits}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('totalCredits')}
              value={totalCredits}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('netAmount')}
              value={totalDebits - totalCredits}
              precision={2}
              prefix="$"
              valueStyle={{ color: totalDebits - totalCredits >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Select
              placeholder={t('selectAccount')}
              style={{ width: '100%' }}
              value={selectedAccount}
              onChange={setSelectedAccount}
              allowClear
            >
              {accounts.map(account => (
                <Option key={account.code} value={account.code}>
                  {account.code} - {account.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              placeholder={[t('startDate'), t('endDate')]}
            />
          </Col>
          <Col span={6}>
            <Input
              placeholder={t('searchDescriptionOrReference')}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={loading}
              >
                {t('refresh')}
              </Button>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={handleExport}
              >
                {t('export')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* General Ledger Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredEntries}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} entries`,
          }}
          scroll={{ x: 800 }}
          summary={() => (
            <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
              <Table.Summary.Cell index={0} colSpan={4}>
                <strong>{t('totals')}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">
                <strong>${totalDebits.toLocaleString()}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">
                <strong>${totalCredits.toLocaleString()}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                <strong style={{ 
                  color: totalDebits - totalCredits >= 0 ? '#52c41a' : '#ff4d4f' 
                }}>
                  ${(totalDebits - totalCredits).toLocaleString()}
                </strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
}