'use client';

import React from 'react';
import { Card, Table, Tag, Space, Button, Input, Modal, Form, Select, InputNumber, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

interface BOMItem {
  key: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  cost: number;
  supplier: string;
  leadTime: number;
}

interface BOM {
  key: string;
  bomCode: string;
  productName: string;
  version: string;
  status: 'Active' | 'Draft' | 'Obsolete';
  totalCost: number;
  items: BOMItem[];
  createdDate: string;
  createdBy: string;
}

const mockData: BOM[] = [
  {
    key: '1',
    bomCode: 'BOM001',
    productName: 'Steel Frame Assembly',
    version: '1.0',
    status: 'Active',
    totalCost: 250.50,
    items: [
      {
        key: '1-1',
        itemCode: 'STL001',
        itemName: 'Steel Rod 10mm',
        quantity: 4,
        unit: 'pcs',
        cost: 15.25,
        supplier: 'Steel Corp',
        leadTime: 7,
      },
      {
        key: '1-2',
        itemCode: 'WLD001',
        itemName: 'Welding Rod',
        quantity: 2,
        unit: 'kg',
        cost: 8.75,
        supplier: 'Welding Supplies',
        leadTime: 3,
      },
    ],
    createdDate: '2024-01-10',
    createdBy: 'John Engineer',
  },
  {
    key: '2',
    bomCode: 'BOM002',
    productName: 'Aluminum Panel',
    version: '2.1',
    status: 'Active',
    totalCost: 180.75,
    items: [
      {
        key: '2-1',
        itemCode: 'ALU001',
        itemName: 'Aluminum Sheet 2mm',
        quantity: 1,
        unit: 'sheet',
        cost: 45.50,
        supplier: 'Metal Works',
        leadTime: 5,
      },
    ],
    createdDate: '2024-01-08',
    createdBy: 'Jane Designer',
  },
  {
    key: '3',
    bomCode: 'BOM003',
    productName: 'Motor Housing',
    version: '1.5',
    status: 'Draft',
    totalCost: 320.00,
    items: [],
    createdDate: '2024-01-12',
    createdBy: 'Mike Engineer',
  },
];

export default function BOMPage() {
  const [loading, setLoading] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isItemsModalVisible, setIsItemsModalVisible] = React.useState(false);
  const [editingBOM, setEditingBOM] = React.useState<BOM | null>(null);
  const [viewingBOM, setViewingBOM] = React.useState<BOM | null>(null);
  const [form] = Form.useForm();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'green';
      case 'Draft':
        return 'orange';
      case 'Obsolete':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'BOM Code',
      dataIndex: 'bomCode',
      key: 'bomCode',
      sorter: (a: BOM, b: BOM) => a.bomCode.localeCompare(b.bomCode),
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a: BOM, b: BOM) => a.productName.localeCompare(b.productName),
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
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
      title: 'Total Cost',
      dataIndex: 'totalCost',
      key: 'totalCost',
      sorter: (a: BOM, b: BOM) => a.totalCost - b.totalCost,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: 'Items Count',
      key: 'itemsCount',
      render: (record: BOM) => record.items.length,
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      sorter: (a: BOM, b: BOM) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: BOM) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewItems(record)}
          >
            View Items
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.key)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const itemsColumns = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value: number, record: BOMItem) => `${value} ${record.unit}`,
    },
    {
      title: 'Unit Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: 'Total Cost',
      key: 'totalCost',
      render: (record: BOMItem) => `$${(record.quantity * record.cost).toFixed(2)}`,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Lead Time (days)',
      dataIndex: 'leadTime',
      key: 'leadTime',
    },
  ];

  const handleEdit = (bom: BOM) => {
    setEditingBOM(bom);
    form.setFieldsValue(bom);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this BOM?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        message.success('BOM deleted successfully');
      },
    });
  };

  const handleAdd = () => {
    setEditingBOM(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleViewItems = (bom: BOM) => {
    setViewingBOM(bom);
    setIsItemsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(() => {
      setIsModalVisible(false);
      message.success(editingBOM ? 'BOM updated successfully' : 'BOM created successfully');
    });
  };

  const filteredData = mockData.filter(bom => {
    const matchesSearch = bom.productName.toLowerCase().includes(searchText.toLowerCase()) ||
                         bom.bomCode.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bom.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Bill of Materials (BOM)</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Create BOM
          </Button>
        </div>
        
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
          <Search
            placeholder="Search BOMs..."
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
            <Option value="Active">Active</Option>
            <Option value="Draft">Draft</Option>
            <Option value="Obsolete">Obsolete</Option>
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} BOMs`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* BOM Form Modal */}
      <Modal
        title={editingBOM ? 'Edit BOM' : 'Create New BOM'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="bomCode"
            label="BOM Code"
            rules={[{ required: true, message: 'Please enter BOM code' }]}
          >
            <Input placeholder="e.g., BOM001" />
          </Form.Item>
          <Form.Item
            name="productName"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="e.g., Steel Frame Assembly" />
          </Form.Item>
          <Form.Item
            name="version"
            label="Version"
            rules={[{ required: true, message: 'Please enter version' }]}
          >
            <Input placeholder="e.g., 1.0" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="Active">Active</Option>
              <Option value="Draft">Draft</Option>
              <Option value="Obsolete">Obsolete</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="totalCost"
            label="Total Cost"
            rules={[{ required: true, message: 'Please enter total cost' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0.00"
              min={0}
              precision={2}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => (parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0) as any}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* BOM Items Modal */}
      <Modal
        title={`BOM Items - ${viewingBOM?.bomCode} (${viewingBOM?.productName})`}
        open={isItemsModalVisible}
        onCancel={() => setIsItemsModalVisible(false)}
        footer={null}
        width={1000}
      >
        {viewingBOM && (
          <Table
            columns={itemsColumns}
            dataSource={viewingBOM.items}
            pagination={false}
            size="small"
          />
        )}
      </Modal>
    </div>
  );
}