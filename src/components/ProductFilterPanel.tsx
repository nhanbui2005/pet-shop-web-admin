import React from 'react';
import { Card, Form, Row, Col, Select, Button, Slider } from 'antd';
const { Option } = Select;

interface ProductFilterPanelProps {
  filters: any;
  setFilters: (cb: any) => void;
  allCategories: any[];
  suppliers: any[];
  handleResetFilters: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const ProductFilterPanel: React.FC<ProductFilterPanelProps> = ({
  filters,
  setFilters,
  allCategories,
  suppliers,
  handleResetFilters,
  showFilters,
  setShowFilters,
}) => {
  if (!showFilters) return null;
  return (
    <Card style={{ marginBottom: 16 }}>
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Trạng thái">
              <Select
                placeholder="Chọn trạng thái"
                allowClear
                value={filters.status}
                onChange={(value) => setFilters((prev: any) => ({ ...prev, status: value }))}
              >
                <Option value={true}>Đang bán</Option>
                <Option value={false}>Ngừng bán</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Danh mục">
              <Select
                placeholder="Chọn danh mục"
                allowClear
                value={filters.category}
                onChange={(value) => setFilters((prev: any) => ({ ...prev, category: value }))}
                mode="multiple"
              >
                {allCategories.map((cat) => (
                  <Option key={cat._id} value={cat._id}>{cat.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Nhà cung cấp">
              <Select
                placeholder="Chọn nhà cung cấp"
                allowClear
                value={filters.supplier}
                onChange={(value) => setFilters((prev: any) => ({ ...prev, supplier: value }))}
              >
                {suppliers.map((supplier) => (
                  <Option key={supplier._id} value={supplier.name}>{supplier.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Khoảng giá">
              <Slider
                range
                min={0}
                max={10000000}
                step={100000}
                value={filters.priceRange}
                onChange={(value: number[]) => {
                  if (value.length === 2) {
                    setFilters((prev: any) => ({ ...prev, priceRange: value }));
                  }
                }}
                tipFormatter={(value) => `${value?.toLocaleString('vi-VN')} VNĐ`}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end" style={{ marginTop: 16 }}>
          <Col>
            <Button onClick={handleResetFilters}>
              Đặt lại bộ lọc
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default ProductFilterPanel; 