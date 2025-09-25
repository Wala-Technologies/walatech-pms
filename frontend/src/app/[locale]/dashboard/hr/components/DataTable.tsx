'use client';

import { Table, Input, Button, Space, Dropdown, Menu } from 'antd';
import { SearchOutlined, FilterOutlined, DownloadOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';

interface DataTableProps<T = any> {
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filterable?: boolean;
  filterOptions?: Array<{
    key: string;
    label: string;
    onClick: () => void;
  }>;
  exportable?: boolean;
  onExport?: () => void;
  rowSelection?: any;
  className?: string;
  title?: string;
  extra?: React.ReactNode;
}

export const DataTable = <T extends Record<string, any>>({
  columns,
  dataSource,
  loading = false,
  pagination,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  filterable = false,
  filterOptions = [],
  exportable = false,
  onExport,
  rowSelection,
  className,
  title,
  extra,
}: DataTableProps<T>) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const filterMenu = (
    <Menu>
      {filterOptions.map((option) => (
        <Menu.Item key={option.key} onClick={option.onClick}>
          {option.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  const tableTitle = () => (
    <div className="flex justify-between items-center mb-4">
      <div>
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
      </div>
      <div className="flex items-center gap-2">
        {searchable && (
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
        )}
        {filterable && filterOptions.length > 0 && (
          <Dropdown overlay={filterMenu} trigger={['click']}>
            <Button icon={<FilterOutlined />}>
              Filter
            </Button>
          </Dropdown>
        )}
        {exportable && (
          <Button 
            icon={<DownloadOutlined />} 
            onClick={onExport}
          >
            Export
          </Button>
        )}
        {extra}
      </div>
    </div>
  );

  return (
    <div className={className}>
      {(title || searchable || filterable || exportable || extra) && tableTitle()}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination ? {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: pagination.onChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} items`,
        } : false}
        rowSelection={rowSelection}
        scroll={{ x: 'max-content' }}
        size="middle"
      />
    </div>
  );
};

export default DataTable;