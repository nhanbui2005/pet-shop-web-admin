import React from 'react';
import { Table } from 'antd';

const ProductTable = ({ columns, dataSource, loading, pagination, handleTableChange }) => (
  <Table
    columns={columns}
    dataSource={dataSource}
    rowKey="_id"
    loading={loading}
    bordered
    onChange={handleTableChange}
    style={{ backgroundColor: '#f0f2f5' }}
    className="custom-table product-table-header"
    pagination={pagination}
  />
);

export default ProductTable; 