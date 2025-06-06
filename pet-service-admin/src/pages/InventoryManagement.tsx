import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Modal,
  Form,
  InputNumber,
  Select,
  Tag,
  message,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';

const { Option } = Select;

interface InventoryItem {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form] = Form.useForm();
  const [showFilters, setShowFilters] = useState(false);

  const columns: TableProps<InventoryItem>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Số lượng tối thiểu',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
    },
    {
      title: 'Số lượng tối đa',
      dataIndex: 'maxQuantity',
      key: 'maxQuantity',
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          in_stock: { color: 'green', text: 'Còn hàng' },
          low_stock: { color: 'orange', text: 'Sắp hết' },
          out_of_stock: { color: 'red', text: 'Hết hàng' },
        };
        const { color, text } = statusMap[status as keyof typeof statusMap];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    // Implement delete logic
    message.success('Xóa sản phẩm thành công');
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      // Implement save logic
      message.success(editingItem ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
      setIsModalVisible(false);
      form.resetFields();
      setEditingItem(null);
    });
  };

  return (
    <div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm sản phẩm"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingItem(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Thêm sản phẩm
          </Button>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </Button>
        </Space>

        {showFilters && (
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Danh mục">
                  <Select placeholder="Chọn danh mục" style={{ width: '100%' }}>
                    <Option value="Food">Thức ăn</Option>
                    <Option value="Grooming">Chăm sóc</Option>
                    <Option value="Toys">Đồ chơi</Option>
                    <Option value="Accessories">Phụ kiện</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Trạng thái">
                  <Select placeholder="Chọn trạng thái" style={{ width: '100%' }}>
                    <Option value="in_stock">Còn hàng</Option>
                    <Option value="low_stock">Sắp hết</Option>
                    <Option value="out_of_stock">Hết hàng</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )}

        <Table
          columns={columns}
          dataSource={inventory}
          rowKey="id"
          className="custom-table"
          components={{
            header: {
              cell: (props: any) => (
                <th
                  {...props}
                  style={{
                    background: '#E0FFFF',
                    color: '#555555',
                    fontWeight: 600,
                    padding: '16px',
                  }}
                />
              ),
            },
          }}
        />
      </Card>

      <Modal
        title={editingItem ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingItem(null);
        }}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'in_stock' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productName"
                label="Tên sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select>
                  <Option value="Food">Thức ăn</Option>
                  <Option value="Grooming">Chăm sóc</Option>
                  <Option value="Toys">Đồ chơi</Option>
                  <Option value="Accessories">Phụ kiện</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="minQuantity"
                label="Số lượng tối thiểu"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng tối thiểu' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxQuantity"
                label="Số lượng tối đa"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng tối đa' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="in_stock">Còn hàng</Option>
              <Option value="low_stock">Sắp hết</Option>
              <Option value="out_of_stock">Hết hàng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryManagement; 