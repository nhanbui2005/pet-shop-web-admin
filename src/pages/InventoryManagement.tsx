import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Modal,
  Form,
  InputNumber,
  Tag,
  message,
  Row,
  Col,
  Typography,
} from 'antd';
import { getVariantsWithStockHistory, increaseStock, decreaseStock } from '../api/product.api';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchProducts } from '../features/product/productSlice';
import { SearchOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Title } = Typography;

// --- TYPES (Không đổi) ---
interface Variant {
  _id: string;
  name: string;
}
interface StockHistoryResDto {
  id: string;
  productId: string;
  variantId: string;
  oldStock: number;
  newStock: number;
  action: string;
  note?: string;
  createdAt: string;
}
interface VariantWithStockHistory {
  variant: Variant;
  stockHistory: StockHistoryResDto[];
  currentStock: number; // Thêm trường tồn kho hiện tại
}

// =================================================================
// == COMPONENT CON: Bảng quản lý kho cho từng Variant (MỚI)      ==
// =================================================================
interface VariantStockTableProps {
  productId: string;
}

const VariantStockTable: React.FC<VariantStockTableProps> = ({ productId }) => {
  const [variants, setVariants] = useState<VariantWithStockHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [stockModal, setStockModal] = useState<{ open: boolean; variantId?: string; variantName?: string; type?: 'increase' | 'decrease' }>({ open: false });
  const [historyModal, setHistoryModal] = useState<{ open: boolean; history: StockHistoryResDto[]; variantName?: string }>({ open: false, history: [] });
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    getVariantsWithStockHistory(productId)
      .then(res => {
        const data = res.data || [];
        // Tính toán tồn kho hiện tại cho mỗi variant
        const variantsWithCurrentStock = data.map((v: any) => ({
          ...v,
          currentStock: v.stockHistory[0]?.newStock ?? 0,
        }));
        setVariants(variantsWithCurrentStock);
      })
      .catch(() => message.error('Không thể tải chi tiết tồn kho'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [productId]);

  const handleStockAction = async () => {
    try {
      const values = await form.validateFields();
      if (!stockModal.variantId || !stockModal.type) return;
      
      setLoading(true);
      if (stockModal.type === 'increase') {
        await increaseStock(stockModal.variantId, values);
        message.success('Nhập kho thành công');
      } else {
        await decreaseStock(stockModal.variantId, values);
        message.success('Xuất kho thành công');
      }
      setStockModal({ open: false });
      form.resetFields();
      fetchData(); // Tải lại dữ liệu
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
        setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tên phiên bản (Variant)',
      dataIndex: ['variant', 'name'],
      key: 'name',
    },
    {
        title: 'Tồn kho hiện tại',
        dataIndex: 'currentStock',
        key: 'currentStock',
        render: (stock: number) => <Tag color={stock > 0 ? 'blue' : 'orange'}>{stock}</Tag>,
        sorter: (a: VariantWithStockHistory, b: VariantWithStockHistory) => a.currentStock - b.currentStock,
    },
    {
      title: 'Lịch sử kho',
      key: 'stockHistory',
      render: (_: any, record: VariantWithStockHistory) => (
        <Button onClick={() => setHistoryModal({ open: true, history: record.stockHistory, variantName: record.variant.name })}>
          Xem ({record.stockHistory?.length || 0})
        </Button>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: VariantWithStockHistory) => (
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setStockModal({ open: true, variantId: record.variant._id, variantName: record.variant.name, type: 'increase' })}
          >
            Nhập kho
          </Button>
          <Button
            danger
            icon={<MinusOutlined />}
            onClick={() => setStockModal({ open: true, variantId: record.variant._id, variantName: record.variant.name, type: 'decrease' })}
          >
            Xuất kho
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px', backgroundColor: '#fafafa' }}>
      <Table
        columns={columns}
        dataSource={variants}
        rowKey={(record) => record.variant._id}
        loading={loading}
        pagination={false}
        size="small"
      />
      {/* Stock Modal */}
      <Modal
        title={`${stockModal.type === 'increase' ? 'Nhập' : 'Xuất'} kho cho: ${stockModal.variantName}`}
        open={stockModal.open}
        onOk={handleStockAction}
        onCancel={() => { setStockModal({ open: false }); form.resetFields(); }}
        okText={stockModal.type === 'increase' ? 'Nhập kho' : 'Xuất kho'}
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>
          {/* Bạn có thể thêm người thực hiện từ Redux state thay vì input */}
        </Form>
      </Modal>

      {/* History Modal */}
      <Modal
        title={`Lịch sử tồn kho cho: ${historyModal.variantName}`}
        open={historyModal.open}
        onCancel={() => setHistoryModal({ open: false, history: [] })}
        footer={null}
        width={800}
      >
        <Table
          dataSource={historyModal.history}
          columns={[
            { title: 'Thời gian', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('vi-VN') },
            { title: 'Tồn kho cũ', dataIndex: 'oldStock' },
            { title: 'Thay đổi', render: (_, record: StockHistoryResDto) => {
                const change = record.newStock - record.oldStock;
                const color = change > 0 ? 'green' : 'red';
                const prefix = change > 0 ? '+' : '';
                return <span style={{ color, fontWeight: 'bold' }}>{prefix}{change}</span>
            }},
            { title: 'Tồn kho mới', dataIndex: 'newStock' },
            { title: 'Hành động', dataIndex: 'action', render: (action: string) => <Tag color={action.toUpperCase() === 'INCREASE' ? 'success' : 'error'}>{action.toUpperCase()}</Tag>},
            { title: 'Ghi chú', dataIndex: 'note' }
          ]}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Modal>
    </div>
  );
};


// =================================================================
// == COMPONENT CHÍNH: Quản lý tồn kho                             ==
// =================================================================
const InventoryManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading: productsLoading } = useSelector((state: RootState) => state.product);
  const [productFilter, setProductFilter] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 100 }));
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    if (!productFilter) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(productFilter.toLowerCase()) ||
      p.supplier?.toLowerCase().includes(productFilter.toLowerCase())
    );
  }, [products, productFilter]);
  
  const productColumns = [
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name', render: (name: string) => <Typography.Text strong>{name}</Typography.Text> },
    { title: 'Nhà cung cấp', dataIndex: 'supplier', key: 'supplier', render: (supplier: string) => supplier || 'N/A' },
    {
      title: 'Trạng thái',
      dataIndex: 'isActivate',
      key: 'isActivate',
      render: (v: boolean) => v ? <Tag color="green">Đang bán</Tag> : <Tag color="red">Đã ẩn</Tag>,
    },
    // Các cột khác nếu cần
  ];

  return (
    <Card>
      <Row gutter={[16, 16]} justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={10} lg={8}>
              <Input
                  placeholder="Tìm kiếm sản phẩm, nhà cung cấp..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => setProductFilter(e.target.value)}
                  allowClear
              />
          </Col>
      </Row>

      <Table
        columns={productColumns}
        dataSource={filteredProducts}
        rowKey="_id"
        loading={productsLoading}
        pagination={{ pageSize: 10 }}
        // Dùng expandable row để hiển thị chi tiết kho
        expandable={{
          expandedRowRender: (record) => <VariantStockTable productId={record._id} />,
          rowExpandable: (record) => true, // Cho phép mọi hàng đều có thể mở rộng
        }}
        components={{
            header: {
              cell: (props: any) => <th {...props} style={{ background: '#f0f5ff', color: '#333', fontWeight: 600, padding: '16px' }} />,
            },
        }}
      />
    </Card>
  );
};

export default InventoryManagement;