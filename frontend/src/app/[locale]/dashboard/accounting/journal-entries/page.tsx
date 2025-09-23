'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Divider,
  Row,
  Col,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { use } from 'react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface JournalEntryLine {
  id: string;
  accountId: string;
  accountName: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
}

interface JournalEntry {
  id: string;
  entryNumber: string;
  postingDate: string;
  description: string;
  reference: string;
  totalDebit: number;
  totalCredit: number;
  status: 'Draft' | 'Posted';
  lines: JournalEntryLine[];
}

interface JournalEntriesPageProps {
  params: Promise<{ locale: string }>;
}

export default function JournalEntriesPage({
  params,
}: JournalEntriesPageProps) {
  const { locale } = use(params);
  const t = useTranslations('accounting');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [form] = Form.useForm();
  const [entryLines, setEntryLines] = useState<JournalEntryLine[]>([]);

  // Mock accounts data
  const mockAccounts = [
    { id: '1', code: '1110', name: 'Cash' },
    { id: '2', code: '1120', name: 'Accounts Receivable' },
    { id: '3', code: '2110', name: 'Accounts Payable' },
    { id: '4', code: '3100', name: "Owner's Equity" },
    { id: '5', code: '4100', name: 'Sales Revenue' },
    { id: '6', code: '5100', name: 'Cost of Goods Sold' },
  ];

  // Mock journal entries data
  const mockJournalEntries: JournalEntry[] = [
    {
      id: '1',
      entryNumber: 'JE-001',
      postingDate: '2024-01-15',
      description: 'Initial cash investment',
      reference: 'INV-001',
      totalDebit: 10000,
      totalCredit: 10000,
      status: 'Posted',
      lines: [
        {
          id: '1',
          accountId: '1',
          accountName: 'Cash',
          description: 'Initial investment',
          debitAmount: 10000,
          creditAmount: 0,
        },
        {
          id: '2',
          accountId: '4',
          accountName: "Owner's Equity",
          description: 'Initial investment',
          debitAmount: 0,
          creditAmount: 10000,
        },
      ],
    },
  ];

  useEffect(() => {
    setJournalEntries(mockJournalEntries);
  }, []);

  const addEntryLine = () => {
    const newLine: JournalEntryLine = {
      id: Date.now().toString(),
      accountId: '',
      accountName: '',
      description: '',
      debitAmount: 0,
      creditAmount: 0,
    };
    setEntryLines([...entryLines, newLine]);
  };

  const removeEntryLine = (lineId: string) => {
    setEntryLines(entryLines.filter((line) => line.id !== lineId));
  };

  const updateEntryLine = (lineId: string, field: string, value: any) => {
    setEntryLines(
      entryLines.map((line) => {
        if (line.id === lineId) {
          const updatedLine = { ...line, [field]: value };
          if (field === 'accountId') {
            const account = mockAccounts.find((acc) => acc.id === value);
            updatedLine.accountName = account ? account.name : '';
          }
          return updatedLine;
        }
        return line;
      })
    );
  };

  const getTotalDebits = () => {
    return entryLines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
  };

  const getTotalCredits = () => {
    return entryLines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
  };

  const isBalanced = () => {
    return getTotalDebits() === getTotalCredits() && getTotalDebits() > 0;
  };

  const handleAddJournalEntry = () => {
    setEntryLines([]);
    form.resetFields();
    setModalVisible(true);
    // Add initial empty lines
    addEntryLine();
    addEntryLine();
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setViewModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (!isBalanced()) {
        message.error('Journal entry must be balanced (debits = credits)');
        return;
      }

      if (entryLines.length < 2) {
        message.error('Journal entry must have at least 2 lines');
        return;
      }

      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        entryNumber: `JE-${String(journalEntries.length + 1).padStart(3, '0')}`,
        postingDate: values.postingDate.format('YYYY-MM-DD'),
        description: values.description,
        reference: values.reference || '',
        totalDebit: getTotalDebits(),
        totalCredit: getTotalCredits(),
        status: 'Draft',
        lines: entryLines.filter(line => line.accountId && (line.debitAmount > 0 || line.creditAmount > 0)),
      };

      setJournalEntries([newEntry, ...journalEntries]);
      message.success('Journal entry created successfully');
      setModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns = [
    {
      title: 'Entry Number',
      dataIndex: 'entryNumber',
      key: 'entryNumber',
      width: 120,
    },
    {
      title: 'Date',
      dataIndex: 'postingDate',
      key: 'postingDate',
      width: 120,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
      width: 120,
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalDebit',
      key: 'totalDebit',
      width: 120,
      align: 'right' as const,
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'Posted' ? 'green' : 'orange'}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: JournalEntry) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewEntry(record)}
          />
        </Space>
      ),
    },
  ];

  const entryLineColumns = [
    {
      title: 'Account',
      dataIndex: 'accountId',
      key: 'accountId',
      render: (accountId: string, record: JournalEntryLine, index: number) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Select account"
          value={accountId}
          onChange={(value) => updateEntryLine(record.id, 'accountId', value)}
        >
          {mockAccounts.map((account) => (
            <Option key={account.id} value={account.id}>
              {account.code} - {account.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string, record: JournalEntryLine) => (
        <Input
          placeholder="Line description"
          value={description}
          onChange={(e) =>
            updateEntryLine(record.id, 'description', e.target.value)
          }
        />
      ),
    },
    {
      title: 'Debit',
      dataIndex: 'debitAmount',
      key: 'debitAmount',
      width: 120,
      render: (amount: number, record: JournalEntryLine) => (
        <InputNumber
          style={{ width: '100%' }}
          placeholder="0.00"
          min={0}
          precision={2}
          value={amount}
          onChange={(value) =>
            updateEntryLine(record.id, 'debitAmount', value || 0)
          }
        />
      ),
    },
    {
      title: 'Credit',
      dataIndex: 'creditAmount',
      key: 'creditAmount',
      width: 120,
      render: (amount: number, record: JournalEntryLine) => (
        <InputNumber
          style={{ width: '100%' }}
          placeholder="0.00"
          min={0}
          precision={2}
          value={amount}
          onChange={(value) =>
            updateEntryLine(record.id, 'creditAmount', value || 0)
          }
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 60,
      render: (_: any, record: JournalEntryLine) => (
        <Button
          type="text"
          icon={<DeleteOutlined />}
          danger
          onClick={() => removeEntryLine(record.id)}
          disabled={entryLines.length <= 2}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          Journal Entries
        </Title>
      </div>

      <Card
        title="Journal Entries"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddJournalEntry}
          >
            New Journal Entry
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={journalEntries}
          loading={loading}
          rowKey="id"
        />
      </Card>

      {/* Create/Edit Journal Entry Modal */}
      <Modal
        title="Create Journal Entry"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={1000}
        okText="Save Entry"
        okButtonProps={{ disabled: !isBalanced() }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="postingDate"
                label="Posting Date"
                rules={[{ required: true, message: 'Please select posting date' }]}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reference" label="Reference">
                <Input placeholder="Reference number or document" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={2} placeholder="Journal entry description" />
          </Form.Item>
        </Form>

        <Divider>Entry Lines</Divider>

        <Table
          columns={entryLineColumns}
          dataSource={entryLines}
          pagination={false}
          rowKey="id"
          size="small"
          footer={() => (
            <div>
              <Row justify="space-between" align="middle">
                <Col>
                  <Button type="dashed" onClick={addEntryLine}>
                    Add Line
                  </Button>
                </Col>
                <Col>
                  <Space>
                    <Text>Total Debits: ${getTotalDebits().toLocaleString()}</Text>
                    <Text>Total Credits: ${getTotalCredits().toLocaleString()}</Text>
                    <Text
                      type={isBalanced() ? 'success' : 'danger'}
                      strong
                    >
                      {isBalanced() ? 'Balanced ✓' : 'Not Balanced ✗'}
                    </Text>
                  </Space>
                </Col>
              </Row>
            </div>
          )}
        />
      </Modal>

      {/* View Journal Entry Modal */}
      <Modal
        title={`Journal Entry: ${selectedEntry?.entryNumber}`}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedEntry && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>Date: </Text>
                <Text>{dayjs(selectedEntry.postingDate).format('MMM DD, YYYY')}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Reference: </Text>
                <Text>{selectedEntry.reference || 'N/A'}</Text>
              </Col>
            </Row>
            <Row style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Text strong>Description: </Text>
                <Text>{selectedEntry.description}</Text>
              </Col>
            </Row>
            <Table
              columns={[
                { title: 'Account', dataIndex: 'accountName', key: 'accountName' },
                { title: 'Description', dataIndex: 'description', key: 'description' },
                {
                  title: 'Debit',
                  dataIndex: 'debitAmount',
                  key: 'debitAmount',
                  align: 'right' as const,
                  render: (amount: number) =>
                    amount > 0 ? `$${amount.toLocaleString()}` : '',
                },
                {
                  title: 'Credit',
                  dataIndex: 'creditAmount',
                  key: 'creditAmount',
                  align: 'right' as const,
                  render: (amount: number) =>
                    amount > 0 ? `$${amount.toLocaleString()}` : '',
                },
              ]}
              dataSource={selectedEntry.lines}
              pagination={false}
              rowKey="id"
              size="small"
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Text strong>${selectedEntry.totalDebit.toLocaleString()}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <Text strong>${selectedEntry.totalCredit.toLocaleString()}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}