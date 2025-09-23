'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  DatePicker, 
  Space, 
  Typography, 
  Row,
  Col,
  Statistic,
  Alert,
  Divider
} from 'antd';
import { 
  DownloadOutlined,
  PrinterOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface TrialBalanceEntry {
  accountCode: string;
  accountName: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  debitBalance: number;
  creditBalance: number;
}

export default function TrialBalancePage() {
  const t = useTranslations('accounting');
  
  const [asOfDate, setAsOfDate] = useState<dayjs.Dayjs>(dayjs());
  const [loading, setLoading] = useState(false);

  // Mock trial balance data
  const mockTrialBalance: TrialBalanceEntry[] = [
    // Assets
    { accountCode: '1001', accountName: 'Cash', accountType: 'Asset', debitBalance: 15000, creditBalance: 0 },
    { accountCode: '1200', accountName: 'Accounts Receivable', accountType: 'Asset', debitBalance: 8500, creditBalance: 0 },
    { accountCode: '1300', accountName: 'Inventory', accountType: 'Asset', debitBalance: 12000, creditBalance: 0 },
    { accountCode: '1500', accountName: 'Equipment', accountType: 'Asset', debitBalance: 25000, creditBalance: 0 },
    { accountCode: '1510', accountName: 'Accumulated Depreciation - Equipment', accountType: 'Asset', debitBalance: 0, creditBalance: 5000 },
    
    // Liabilities
    { accountCode: '2001', accountName: 'Accounts Payable', accountType: 'Liability', debitBalance: 0, creditBalance: 6500 },
    { accountCode: '2100', accountName: 'Notes Payable', accountType: 'Liability', debitBalance: 0, creditBalance: 15000 },
    { accountCode: '2200', accountName: 'Accrued Expenses', accountType: 'Liability', debitBalance: 0, creditBalance: 2000 },
    
    // Equity
    { accountCode: '3001', accountName: 'Owner\'s Capital', accountType: 'Equity', debitBalance: 0, creditBalance: 20000 },
    { accountCode: '3200', accountName: 'Retained Earnings', accountType: 'Equity', debitBalance: 0, creditBalance: 8000 },
    
    // Revenue
    { accountCode: '4001', accountName: 'Service Revenue', accountType: 'Revenue', debitBalance: 0, creditBalance: 18000 },
    { accountCode: '4100', accountName: 'Sales Revenue', accountType: 'Revenue', debitBalance: 0, creditBalance: 12000 },
    
    // Expenses
    { accountCode: '5001', accountName: 'Rent Expense', accountType: 'Expense', debitBalance: 3600, creditBalance: 0 },
    { accountCode: '5100', accountName: 'Salaries Expense', accountType: 'Expense', debitBalance: 8000, creditBalance: 0 },
    { accountCode: '5200', accountName: 'Utilities Expense', accountType: 'Expense', debitBalance: 1200, creditBalance: 0 },
    { accountCode: '5300', accountName: 'Office Supplies Expense', accountType: 'Expense', debitBalance: 800, creditBalance: 0 },
    { accountCode: '5400', accountName: 'Depreciation Expense', accountType: 'Expense', debitBalance: 2500, creditBalance: 0 },
  ];

  const totalDebits = mockTrialBalance.reduce((sum, entry) => sum + entry.debitBalance, 0);
  const totalCredits = mockTrialBalance.reduce((sum, entry) => sum + entry.creditBalance, 0);
  const isBalanced = totalDebits === totalCredits;

  // Group accounts by type
  const groupedAccounts = mockTrialBalance.reduce((acc, entry) => {
    if (!acc[entry.accountType]) {
      acc[entry.accountType] = [];
    }
    acc[entry.accountType].push(entry);
    return acc;
  }, {} as Record<string, TrialBalanceEntry[]>);

  const columns = [
    {
      title: t('accountCode'),
      dataIndex: 'accountCode',
      key: 'accountCode',
      width: 120,
    },
    {
      title: t('accountName'),
      dataIndex: 'accountName',
      key: 'accountName',
      width: 250,
    },
    {
      title: t('debit'),
      dataIndex: 'debitBalance',
      key: 'debitBalance',
      align: 'right' as const,
      width: 150,
      render: (amount: number) => amount > 0 ? `$${amount.toLocaleString()}` : '-',
    },
    {
      title: t('credit'),
      dataIndex: 'creditBalance',
      key: 'creditBalance',
      align: 'right' as const,
      width: 150,
      render: (amount: number) => amount > 0 ? `$${amount.toLocaleString()}` : '-',
    },
  ];

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting trial balance...');
  };

  const renderAccountGroup = (type: string, accounts: TrialBalanceEntry[]) => {
    const groupDebits = accounts.reduce((sum, acc) => sum + acc.debitBalance, 0);
    const groupCredits = accounts.reduce((sum, acc) => sum + acc.creditBalance, 0);

    return (
      <div key={type} style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ color: '#1890ff', marginBottom: '12px' }}>
          {t(type.toLowerCase())}
        </Title>
        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="accountCode"
          pagination={false}
          size="small"
          summary={() => (
            <Table.Summary.Row style={{ backgroundColor: '#f0f0f0' }}>
              <Table.Summary.Cell index={0} colSpan={2}>
                <strong>{t('subtotal')} - {t(type.toLowerCase())}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <strong>${groupDebits.toLocaleString()}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">
                <strong>${groupCredits.toLocaleString()}</strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>{t('trialBalance')}</Title>
        <p style={{ color: '#666', marginBottom: 0 }}>
          {t('verifyAccountingEquationBalance')}
        </p>
      </div>

      {/* Header Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle" justify="space-between">
          <Col>
            <Space align="center">
              <Text strong>{t('asOfDate')}:</Text>
              <DatePicker
                value={asOfDate}
                onChange={(date) => date && setAsOfDate(date)}
                format="MMMM DD, YYYY"
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={loading}
              >
                {t('refresh')}
              </Button>
              <Button 
                icon={<PrinterOutlined />} 
                onClick={handlePrint}
              >
                {t('print')}
              </Button>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={handleExport}
                type="primary"
              >
                {t('export')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Balance Status Alert */}
      <Alert
        message={isBalanced ? t('trialBalanceIsBalanced') : t('trialBalanceIsNotBalanced')}
        description={
          isBalanced 
            ? t('debitsCreditsTotalMatch')
            : t('debitsCreditsTotalDoNotMatch')
        }
        type={isBalanced ? 'success' : 'error'}
        icon={isBalanced ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
        style={{ marginBottom: '24px' }}
        showIcon
      />

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
              title={t('difference')}
              value={Math.abs(totalDebits - totalCredits)}
              precision={2}
              prefix="$"
              valueStyle={{ color: isBalanced ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Trial Balance Report */}
      <Card title={`${t('trialBalance')} - ${asOfDate.format('MMMM DD, YYYY')}`}>
        {Object.entries(groupedAccounts).map(([type, accounts]) => 
          renderAccountGroup(type, accounts)
        )}
        
        <Divider />
        
        {/* Grand Total */}
        <Table
          columns={[
            { title: '', dataIndex: 'label', key: 'label', width: 370 },
            { 
              title: t('totalDebits'), 
              dataIndex: 'debits', 
              key: 'debits', 
              align: 'right' as const,
              width: 150,
              render: (value: number) => <strong>${value.toLocaleString()}</strong>
            },
            { 
              title: t('totalCredits'), 
              dataIndex: 'credits', 
              key: 'credits', 
              align: 'right' as const,
              width: 150,
              render: (value: number) => <strong>${value.toLocaleString()}</strong>
            },
          ]}
          dataSource={[
            {
              key: 'total',
              label: t('grandTotal'),
              debits: totalDebits,
              credits: totalCredits,
            }
          ]}
          pagination={false}
          size="small"
          style={{ 
            backgroundColor: isBalanced ? '#f6ffed' : '#fff2f0',
            border: `2px solid ${isBalanced ? '#52c41a' : '#ff4d4f'}`
          }}
        />
      </Card>
    </div>
  );
}