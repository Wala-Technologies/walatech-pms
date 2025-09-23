'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { use } from 'react';

const { Title } = Typography;
const { Option } = Select;

interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  parentAccountId?: string;
  isActive: boolean;
  balance: number;
  children?: Account[];
}

interface ChartOfAccountsPageProps {
  params: Promise<{ locale: string }>;
}

export default function ChartOfAccountsPage({
  params,
}: ChartOfAccountsPageProps) {
  const { locale } = use(params);
  const t = useTranslations('accounting');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form] = Form.useForm();

  // Mock data for demonstration
  const mockAccounts: Account[] = [
    {
      id: '1',
      accountCode: '1000',
      accountName: 'Assets',
      accountType: 'Asset',
      isActive: true,
      balance: 0,
      children: [
        {
          id: '2',
          accountCode: '1100',
          accountName: 'Current Assets',
          accountType: 'Asset',
          parentAccountId: '1',
          isActive: true,
          balance: 0,
          children: [
            {
              id: '3',
              accountCode: '1110',
              accountName: 'Cash',
              accountType: 'Asset',
              parentAccountId: '2',
              isActive: true,
              balance: 10000,
            },
            {
              id: '4',
              accountCode: '1120',
              accountName: 'Accounts Receivable',
              accountType: 'Asset',
              parentAccountId: '2',
              isActive: true,
              balance: 5000,
            },
          ],
        },
      ],
    },
    {
      id: '5',
      accountCode: '2000',
      accountName: 'Liabilities',
      accountType: 'Liability',
      isActive: true,
      balance: 0,
      children: [
        {
          id: '6',
          accountCode: '2100',
          accountName: 'Current Liabilities',
          accountType: 'Liability',
          parentAccountId: '5',
          isActive: true,
          balance: 0,
          children: [
            {
              id: '7',
              accountCode: '2110',
              accountName: 'Accounts Payable',
              accountType: 'Liability',
              parentAccountId: '6',
              isActive: true,
              balance: 3000,
            },
          ],
        },
      ],
    },
    {
      id: '8',
      accountCode: '3000',
      accountName: 'Equity',
      accountType: 'Equity',
      isActive: true,
      balance: 0,
      children: [
        {
          id: '9',
          accountCode: '3100',
          accountName: 'Owner\'s Equity',
          accountType: 'Equity',
          parentAccountId: '8',
          isActive: true,
          balance: 12000,
        },
      ],
    },
  ];

  useEffect(() => {
    setAccounts(mockAccounts);
  }, []);

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'Asset':
        return 'green';
      case 'Liability':
        return 'red';
      case 'Equity':
        return 'blue';
      case 'Revenue':
        return 'purple';
      case 'Expense':
        return 'orange';
      default:
        return 'default';
    }
  };

  const flattenAccounts = (accounts: Account[], level = 0): any[] => {
    const result: any[] = [];
    accounts.forEach((account) => {
      result.push({
        ...account,
        level,
        key: account.id,
      });
      if (account.children) {
        result.push(...flattenAccounts(account.children, level + 1));
      }
    });
    return result;
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    form.setFieldsValue(account);
    setModalVisible(true);
  };

  const handleDeleteAccount = (accountId: string) => {
    message.success('Account deleted successfully');
    // In real implementation, call API to delete account
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingAccount) {
        message.success('Account updated successfully');
      } else {
        message.success('Account created successfully');
      }
      setModalVisible(false);
      // In real implementation, call API to save account
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns = [
    {
      title: 'Account Code',
      dataIndex: 'accountCode',
      key: 'accountCode',
      width: 120,
      render: (text: string, record: any) => (
        <span style={{ marginLeft: record.level * 20 }}>{text}</span>
      ),
    },
    {
      title: 'Account Name',
      dataIndex: 'accountName',
      key: 'accountName',
      render: (text: string, record: any) => (
        <span style={{ marginLeft: record.level * 20 }}>{text}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'accountType',
      key: 'accountType',
      width: 100,
      render: (type: string) => (
        <Tag color={getAccountTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      align: 'right' as const,
      render: (balance: number) => (
        <span style={{ color: balance >= 0 ? '#52c41a' : '#ff4d4f' }}>
          ${balance.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Account) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditAccount(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this account?"
            onConfirm={() => handleDeleteAccount(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BankOutlined style={{ marginRight: 8 }} />
          Chart of Accounts
        </Title>
      </div>

      <Card
        title="Account Hierarchy"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAccount}>
            Add Account
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={flattenAccounts(accounts)}
          pagination={false}
          loading={loading}
          size="small"
        />
      </Card>

      <Modal
        title={editingAccount ? 'Edit Account' : 'Add New Account'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="accountCode"
            label="Account Code"
            rules={[{ required: true, message: 'Please enter account code' }]}
          >
            <Input placeholder="e.g., 1110" />
          </Form.Item>
          <Form.Item
            name="accountName"
            label="Account Name"
            rules={[{ required: true, message: 'Please enter account name' }]}
          >
            <Input placeholder="e.g., Cash" />
          </Form.Item>
          <Form.Item
            name="accountType"
            label="Account Type"
            rules={[{ required: true, message: 'Please select account type' }]}
          >
            <Select placeholder="Select account type">
              <Option value="Asset">Asset</Option>
              <Option value="Liability">Liability</Option>
              <Option value="Equity">Equity</Option>
              <Option value="Revenue">Revenue</Option>
              <Option value="Expense">Expense</Option>
            </Select>
          </Form.Item>
          <Form.Item name="parentAccountId" label="Parent Account">
            <Select placeholder="Select parent account (optional)" allowClear>
              {flattenAccounts(accounts).map((account) => (
                <Option key={account.id} value={account.id}>
                  {account.accountCode} - {account.accountName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="isActive" label="Status" initialValue={true}>
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}