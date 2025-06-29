import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  DatePicker,
  Card,
  Row,
  Col,
  Select,
  Modal,
  Descriptions,
  message,
  Typography,
  Divider,
} from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import axiosClient from '../api/axiosClient';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// --- REFACTORED: Constants moved outside component for reusability ---
const OrderStatusText: Record<string, string> = {
  NEWORDER: 'Mới',
  CONFIRMED: 'Đã xác nhận',
  WAIT_FOR_PAYMENT: 'Chờ thanh toán',
  PAYMENT_SUCCESSFUL: 'Đã thanh toán',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đã giao vận chuyển',
  DELIVERED: 'Đã giao',
  RECEIVED: 'Đã nhận',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã trả hàng',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
};

const OrderStatusColors: Record<string, string> = {
  NEWORDER: 'orange',
  CONFIRMED: 'processing',
  WAIT_FOR_PAYMENT: 'warning',
  PAYMENT_SUCCESSFUL: 'success',
  PROCESSING: 'blue',
  SHIPPED: 'purple',
  DELIVERED: 'cyan',
  RECEIVED: 'success',
  CANCELLED: 'error',
  RETURNED: 'magenta',
  FAILED: 'error',
  REFUNDED: 'gold',
};

const OrderStatusTransitionMap: Record<string, string[]> = {
  NEWORDER: ['WAIT_FOR_PAYMENT', 'CONFIRMED', 'CANCELLED'],
  WAIT_FOR_PAYMENT: ['PAYMENT_SUCCESSFUL', 'CANCELLED'],
  PAYMENT_SUCCESSFUL: ['CONFIRMED', 'CANCELLED', 'REFUNDED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['RECEIVED'],
  RECEIVED: [],
  CANCELLED: [],
  RETURNED: ['REFUNDED'],
  FAILED: ['CANCELLED'],
  REFUNDED: [],
};

// --- INTERFACES (Không đổi) ---
interface OrderItem {
  id: string;
  productName: string;
  variantName?: string;
  quantity: number;
  sellingPrice: number;
  promotionalPrice?: number;
  image?: string;
}

interface Order {
  id: string;
  sku: string;
  userID: string;
  customerName: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  paymentType: string;
  shippingAddress: string;
  items: OrderItem[];
}

// --- NEW: Reusable StatusTag component ---
const StatusTag: React.FC<{ status: string }> = ({ status }) => (
  <Tag color={OrderStatusColors[status] || 'default'}>
    {OrderStatusText[status] || status}
  </Tag>
);

// --- HELPER FUNCTION: Maps API data to Order interface ---
const mapApiToOrder = (order: any): Order => ({
  id: order._id,
  sku: order.sku,
  userID: order.userID,
  customerName: order.shippingAddress?.receiverFullname || 'Khách vãng lai',
  createdAt: order.createdAt,
  totalAmount: order.totalPrice,
  status: order.status,
  paymentType: order.paymentType,
  shippingAddress: `${order.shippingAddress?.streetAndNumber || ''}, ${order.shippingAddress?.ward || ''}, ${order.shippingAddress?.district || ''}, ${order.shippingAddress?.province || ''}`,
  items: (order.orderDetailItems || []).map((item: any) => ({
    id: item._id,
    productName: item.productName,
    variantName: item.variantName,
    quantity: item.quantity,
    sellingPrice: item.sellingPrice,
    promotionalPrice: item.promotionalPrice,
    image: item.image,
  })),
});

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [nextStatus, setNextStatus] = useState<string | undefined>(undefined);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/order/admin/get-orders', {
        params: { page: 1, limit: 200 }, // Increased limit
      });
      setOrders((res.data?.data || []).map(mapApiToOrder));
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = dayjs(order.createdAt);
      const matchesSearch =
        order.sku.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(order.status);
      const matchesDate = !selectedDateRange || (orderDate.isAfter(selectedDateRange[0]) && orderDate.isBefore(selectedDateRange[1]));
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchText, selectedStatus, selectedDateRange]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !nextStatus) return;
    setUpdating(true);
    try {
      const res = await axiosClient.put(`/order/${selectedOrder.id}/status`, { status: nextStatus });
      message.success('Cập nhật trạng thái thành công!');
      
      // OPTIMISTIC UPDATE: Update local state instead of re-fetching
      const updatedOrder = mapApiToOrder(res.data);
      setOrders(prevOrders => prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));

      setIsModalVisible(false);
      setNextStatus(undefined);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật trạng thái thất bại!');
    } finally {
      setUpdating(false);
    }
  };
  
  const columns: TableProps<Order>['columns'] = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku) => <Text strong>{sku}</Text>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('HH:mm DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `${amount.toLocaleString('vi-VN')} VNĐ`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusTag status={status} />,
      filters: Object.keys(OrderStatusText).map(status => ({ text: OrderStatusText[status], value: status })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record: Order) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedOrder(record);
            setIsModalVisible(true);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Tìm mã đơn hàng, tên khách hàng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="Lọc theo trạng thái"
            allowClear
            maxTagCount="responsive"
          >
            {Object.keys(OrderStatusText).map((status) => (
              <Select.Option key={status} value={status}>
                <StatusTag status={status} />
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <RangePicker
            style={{ width: '100%' }}
            onChange={(dates) => setSelectedDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 'max-content' }}
        components={{
            header: {
              cell: (props: any) => <th {...props} style={{ background: '#f0f5ff', color: '#333', fontWeight: 600 }} />,
            },
        }}
      />

      <Modal
        title={<Title level={5}>Chi tiết đơn hàng #{selectedOrder?.sku}</Title>}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setNextStatus(undefined);
        }}
        footer={null}
        width={900}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered layout="vertical" column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Khách hàng">{selectedOrder.customerName}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">{dayjs(selectedOrder.createdAt).format('HH:mm DD/MM/YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><StatusTag status={selectedOrder.status} /></Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">{selectedOrder.paymentType}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Text strong color="red">{selectedOrder.totalAmount.toLocaleString('vi-VN')} VNĐ</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={3}>{selectedOrder.shippingAddress}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Sản phẩm trong đơn</Title>
            <Table
              columns={[
                { title: 'Sản phẩm', dataIndex: 'productName', render: (_: any, record: OrderItem) => `${record.productName} ${record.variantName ? `(${record.variantName})` : ''}` },
                { title: 'Số lượng', dataIndex: 'quantity', align: 'center' },
                { title: 'Đơn giá', dataIndex: 'sellingPrice', render: (price: number) => `${price.toLocaleString('vi-VN')} VNĐ` },
                { title: 'Giá bán', dataIndex: 'promotionalPrice', render: (price?: number, record?: any) => `${(price || record.sellingPrice).toLocaleString('vi-VN')} VNĐ`},
                { title: 'Thành tiền', key: 'total', render: (_, record: OrderItem) => <Text strong>{(record.quantity * (record.promotionalPrice || record.sellingPrice)).toLocaleString('vi-VN')} VNĐ</Text> },
              ]}
              dataSource={selectedOrder.items}
              rowKey="id"
              pagination={false}
              summary={pageData => {
                const total = pageData.reduce((acc, item) => acc + (item.quantity * (item.promotionalPrice || item.sellingPrice)), 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}><Text strong>Tổng cộng</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}><Text type="danger" strong>{total.toLocaleString('vi-VN')} VNĐ</Text></Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />

            {OrderStatusTransitionMap[selectedOrder.status]?.length > 0 && (
              <>
                <Divider />
                <Space wrap>
                  <Text strong>Chuyển trạng thái đơn hàng:</Text>
                  <Select
                    style={{ width: 220 }}
                    placeholder="Chọn trạng thái mới"
                    value={nextStatus}
                    onChange={setNextStatus}
                    disabled={updating}
                  >
                    {OrderStatusTransitionMap[selectedOrder.status].map((status) => (
                      <Select.Option key={status} value={status}>
                        {OrderStatusText[status] || status}
                      </Select.Option>
                    ))}
                  </Select>
                  <Button
                    type="primary"
                    onClick={handleUpdateStatus}
                    loading={updating}
                    disabled={!nextStatus}
                  >
                    Cập nhật
                  </Button>
                </Space>
              </>
            )}
          </>
        )}
      </Modal>
    </Card>
  );
};

export default OrderManagement;