'use client';

import React from 'react';
import { Card, Table, Tag, Space, Button, Input, Select } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

interface StockItem {
  key: string;
  itemCode: string;
  itemName: string;
  warehouse: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

const mockData: StockItem[] = [
  {
    key: '1',
    itemCode: 'ITM001',
    itemName: 'Steel Rod 10mm',
    warehouse: 'Main Warehouse',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unit: 'pcs',
    status: 'In Stock',
    lastUpdated: '2024-01-15 10:30:00',
  },
  {
    key: '2',
    itemCode: 'ITM002',
    itemName: 'Aluminum Sheet',
    warehouse: 'Secondary Warehouse',
    currentStock: 25,
    minStock: 30,
    maxStock: 200,
    unit: 'sheets',
    status: 'Low Stock',
    lastUpdated: '2024-01-15 09:15:00',
  },
  {
    key: '3',
    itemCode: 'ITM003',
    itemName: 'Copper Wire',
    warehouse: 'Main Warehouse',
    currentStock: 0,
    minStock: 20,
    maxStock: 100,
    unit: 'meters',
    status: 'Out of Stock',
    lastUpdated: '2024-01-14 16:45:00',
  },
];

export default function StockLevelsPage() {
  const [loading, setLoading] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'green';
      case 'Low Stock':
        return 'orange';
      case 'Out of Stock':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      sorter: (a: StockItem, b: StockItem) => a.itemCode.localeCompare(b.itemCode),
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      sorter: (a: StockItem, b: StockItem) => a.itemName.localeCompare(b.itemName),
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      sorter: (a: StockItem, b: StockItem) => a.currentStock - b.currentStock,
      render: (value: number, record: StockItem) => `${value} ${record.unit}`,
    },
    {
      title: 'Min Stock',
      dataIndex: 'minStock',
      key: 'minStock',
      render: (value: number, record: StockItem) => `${value} ${record.unit}`,
    },
    {
      title: 'Max Stock',
      dataIndex: 'maxStock',
      key: 'maxStock',
      render: (value: number, record: StockItem) => `${value} ${record.unit}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      sorter: (a: StockItem, b: StockItem) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
    },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const filteredData = mockData.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Stock Levels</h2>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              Refresh
            </Button>
            <Button icon={<ExportOutlined />} type="primary">
              Export
            </Button>
          </Space>
        </div>
        
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
          <Search
            placeholder="Search items..."
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">All Status</Option>
            <Option value="In Stock">In Stock</Option>
            <Option value="Low Stock">Low Stock</Option>
            <Option value="Out of Stock">Out of Stock</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}