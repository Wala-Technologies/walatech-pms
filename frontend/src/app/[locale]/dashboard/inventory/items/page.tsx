'use client';

import { Card, Table, Button, Tag, Space, Input, Select, Badge, Progress } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, WarningOutlined } from '@ant-design/icons';
import { useState } from 'react';

interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstock';
  lastUpdated: string;
}

export default function InventoryItemsPage() {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data
  const inventoryItems: InventoryItem[] = [
    {
      id: '1',
      itemCode: 'STL-001',
      itemName: 'Steel Rod 10mm',
      category: 'Raw Materials',
      unit: 'kg',
      currentStock: 500,
      minStock: 100,
      maxStock: 1000,
      unitPrice: 85.50,
      totalValue: 42750,
      status: 'in-stock',
      lastUpdated: '2024-01-14'
    },
    {
      id: '2',
      itemCode: 'MTR-002',
      itemName: 'Electric Motor 5HP',
      category: 'Components',
      unit: 'pcs',
      currentStock: 15,
      minStock: 20,
      maxStock: 50,
      unitPrice: 2500.00,
      totalValue: 37500,
      status: 'low-stock',
      lastUpdated: '2024-01-13'
    },
    {
      id: '3',
      itemCode: 'BLT-003',
      itemName: 'Hex Bolt M12x50',
      category: 'Fasteners',
      unit: 'pcs',
      currentStock: 0,
      minStock: 500,
      maxStock: 2000,
      unitPrice: 2.50,
      totalValue: 0,
      status: 'out-of-stock',
      lastUpdated: '2024-01-12'
    },
    {
      id: '4',
      itemCode: 'PLT-004',
      itemName: 'Steel Plate 5mm',
      category: 'Raw Materials',
      unit: 'sqm',
      currentStock: 1200,
      minStock: 200,
      maxStock: 800,
      unitPrice: 150.00,
      totalValue: 180000,
      status: 'overstock',
      lastUpdated: '2024-01-14'
    },
    {
      id: '5',
      itemCode: 'WLD-005',
      itemName: 'Welding Rod 3.2mm',
      category: 'Consumables',
      unit: 'kg',
      currentStock: 75,
      minStock: 50,
      maxStock: 200,
      unitPrice: 12.00,
      totalValue: 900,
      status: 'in-stock',
      lastUpdated: '2024-01-13'
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'in-stock': 'green',
      'low-stock': 'orange',
      'out-of-stock': 'red',
      'overstock': 'blue'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStockLevel = (current: number, min: number, max: number) => {
    const percentage = (current / max) * 100;
    let status: 'success' | 'normal' | 'exception' = 'normal';
    
    if (current === 0) status = 'exception';
    else if (current < min) status = 'exception';
    else if (current > max) status = 'normal';
    else status = 'success';
    
    return { percentage: Math.min(percentage, 100), status };
  };

  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      sorter: true,
      width: 120,
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      sorter: true,
      width: 200,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Raw Materials', value: 'Raw Materials' },
        { text: 'Components', value: 'Components' },
        { text: 'Fasteners', value: 'Fasteners' },
        { text: 'Consumables', value: 'Consumables' },
      ],
      width: 150,
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      sorter: true,
      render: (stock: number, record: InventoryItem) => (
        <div>
          <div className="flex items-center gap-2">
            <span>{stock} {record.unit}</span>
            {record.status === 'low-stock' && <WarningOutlined className="text-orange-500" />}
            {record.status === 'out-of-stock' && <WarningOutlined className="text-red-500" />}
          </div>
        </div>
      ),
      width: 120,
    },
    {
      title: 'Stock Level',
      key: 'stockLevel',
      render: (_: any, record: InventoryItem) => {
        const { percentage, status } = getStockLevel(record.currentStock, record.minStock, record.maxStock);
        return (
          <div className="w-24">
            <Progress 
              percent={percentage} 
              status={status}
              size="small"
              showInfo={false}
            />
            <div className="text-xs text-gray-500 mt-1">
              Min: {record.minStock} | Max: {record.maxStock}
            </div>
          </div>
        );
      },
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase().replace('-', ' ')}
        </Tag>
      ),
      filters: [
        { text: 'In Stock', value: 'in-stock' },
        { text: 'Low Stock', value: 'low-stock' },
        { text: 'Out of Stock', value: 'out-of-stock' },
        { text: 'Overstock', value: 'overstock' },
      ],
      width: 120,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      sorter: true,
      render: (price: number) => `$${price.toFixed(2)}`,
      width: 100,
    },
    {
      title: 'Total Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
      sorter: true,
      render: (value: number) => `$${value.toLocaleString()}`,
      width: 120,
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      sorter: true,
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: InventoryItem) => (
        <Space size="middle">
          <Button type="link" size="small">View</Button>
          <Button type="link" size="small">Edit</Button>
          <Button type="link" size="small">Adjust Stock</Button>
        </Space>
      ),
      width: 150,
      fixed: 'right' as const,
    },
  ];

  // Calculate summary statistics
  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter(item => item.status === 'low-stock').length;
  const outOfStockItems = inventoryItems.filter(item => item.status === 'out-of-stock').length;
  const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Items</h1>
            <p className="text-gray-600">Manage inventory items and stock levels</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />}>
            Add New Item
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
              <div className="text-gray-600">Total Items</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                <Badge count={lowStockItems} showZero>
                  {lowStockItems}
                </Badge>
              </div>
              <div className="text-gray-600">Low Stock</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                <Badge count={outOfStockItems} showZero>
                  {outOfStockItems}
                </Badge>
              </div>
              <div className="text-gray-600">Out of Stock</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</div>
              <div className="text-gray-600">Total Value</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Search items..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
            />
            <Select
              placeholder="Filter by category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              className="w-48"
            >
              <Select.Option value="all">All Categories</Select.Option>
              <Select.Option value="raw-materials">Raw Materials</Select.Option>
              <Select.Option value="components">Components</Select.Option>
              <Select.Option value="fasteners">Fasteners</Select.Option>
              <Select.Option value="consumables">Consumables</Select.Option>
            </Select>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-48"
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="in-stock">In Stock</Select.Option>
              <Select.Option value="low-stock">Low Stock</Select.Option>
              <Select.Option value="out-of-stock">Out of Stock</Select.Option>
              <Select.Option value="overstock">Overstock</Select.Option>
            </Select>
            <Button icon={<FilterOutlined />}>More Filters</Button>
          </div>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={inventoryItems}
          rowKey="id"
          pagination={{
            total: inventoryItems.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1400 }}
          rowClassName={(record) => {
            if (record.status === 'out-of-stock') return 'bg-red-50';
            if (record.status === 'low-stock') return 'bg-orange-50';
            return '';
          }}
        />
      </Card>
    </div>
  );
}