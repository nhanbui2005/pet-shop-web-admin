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
  Tabs,
  Alert,
} from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import axiosClient from '../api/axiosClient';
import qs from 'qs';

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
  NEWORDER: ['CONFIRMED', 'CANCELLED'],
  WAIT_FOR_PAYMENT: ['PAYMENT_SUCCESSFUL', 'CANCELLED'],
  PAYMENT_SUCCESSFUL: ['CONFIRMED', 'CANCELLED'],
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

// Map performed_by sang tiếng Việt
const PerformedByText: Record<string, string> = {
  SYSTEM: 'Hệ thống',
  ADMIN: 'Quản trị viên',
  USER: 'Người dùng',
};

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
  latestLog: order.latestLog ? {
    action: order.latestLog.action,
    performed_by: order.latestLog.performed_by,
    createdAt: order.latestLog.createdAt,
  } : undefined,
  discount: order.discount,
});

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
  latestLog?: {
    action: string;
    performed_by: string;
    createdAt: string;
  };
  discount?: number;
}

// Định nghĩa nhóm trạng thái cho từng tab
const OrderTabs = [
  {
    key: 'pending',
    label: 'Chờ xác nhận',
    statuses: ['NEWORDER', 'PAYMENT_SUCCESSFUL'],
    desc: 'Đơn mới tạo. Có thể đã thanh toán online nhưng vẫn chưa được admin xác nhận',
  },
  {
    key: 'confirmed',
    label: 'Đã xác nhận',
    statuses: ['CONFIRMED'],
    desc: 'Admin đã duyệt.',
  },
  {
    key: 'processing',
    label: 'Đang xử lý',
    statuses: ['PROCESSING'],
    desc: 'Đơn đang được chuẩn bị',
  },
  {
    key: 'shipping',
    label: 'Đang giao',
    statuses: ['SHIPPED'],
    desc: 'Đang trong quá trình vận chuyển',
  },
  {
    key: 'done',
    label: 'Hoàn tất',
    statuses: ['DELIVERED', 'RECEIVED'],
    desc: 'Đã giao xong và khách nhận hàng',
  },
  {
    key: 'cancelled',
    label: 'Đã hủy / Thất bại',
    statuses: ['CANCELLED', 'FAILED'],
    desc: 'Đơn bị huỷ hoặc giao hàng thất bại',
  },
  {
    key: 'returned',
    label: 'Trả hàng / Hoàn tiền',
    statuses: ['RETURNED', 'REFUNDED'],
    desc: 'Đơn đã bị trả hàng hoặc hoàn tiền',
  },
];

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [latestCreatedAt, setLatestCreatedAt] = useState<string | undefined>(undefined);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [nextStatus, setNextStatus] = useState<string | undefined>(undefined);

  const [activeTab, setActiveTab] = useState('pending');

  const [pageSize, setPageSize] = useState(10);

  // Polling số lượng đơn hàng mới (đặt sau activeTab)
  useEffect(() => {
    let timer: any;
    const poll = async () => {
      try {
        // Lấy danh sách đơn hàng đã lọc theo tab
        const tab = OrderTabs.find(t => t.key === activeTab);
        const filtered = orders
          .filter(order => tab ? tab.statuses.includes(order.status) : true)
          .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
        const after = latestCreatedAt || filtered[0]?.createdAt;
        const types = tab?.statuses || [];

        const res = await axiosClient.get('/order/new-order-count', {
          params: {
            after,
            types,
          },
          paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
        });
        if (typeof res.data === 'number') setNewOrderCount(res.data);
      } catch { }
      timer = setTimeout(poll, 10000);
    };
    poll();
    return () => clearTimeout(timer);
  }, [orders, activeTab, latestCreatedAt]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const tab = OrderTabs.find(t => t.key === activeTab);
      const statuses = tab?.statuses || [];
      const res = await axiosClient.get('/order/admin/get-orders', {
        params: { page: 1, limit: 200, statuses },
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
      });
      const mapped = (res.data?.data || []).map(mapApiToOrder);
      setOrders(mapped);
      if (mapped.length > 0) {
        const sorted = [...mapped].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
        setLatestCreatedAt(sorted[0].createdAt);
      }
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = dayjs(order.createdAt);
      const matchesSearch =
        order.sku.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchText.toLowerCase());
      const matchesDate = !selectedDateRange || (orderDate.isAfter(selectedDateRange[0]) && orderDate.isBefore(selectedDateRange[1]));
      return matchesSearch && matchesDate;
    });
  }, [orders, searchText, selectedDateRange]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !nextStatus) return;
    setUpdating(true);
    try {
      const res = await axiosClient.post(`/order/${selectedOrder.id}/status`, { nextStatus: nextStatus });
      console.log(res);

      message.success('Cập nhật trạng thái thành công!');


      // OPTIMISTIC UPDATE: Update local state instead of re-fetching
      const updatedOrder = mapApiToOrder(res.data);
      setOrders(prevOrders => prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));

      setIsModalVisible(false);
      setNextStatus(undefined);
    } catch (err: any) {
      console.log(err);

      message.error(err.response?.data?.message || 'Cập nhật trạng thái thất bại!');
    } finally {
      setUpdating(false);
    }
  };

  const columns: TableProps<Order>['columns'] = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
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
      <style>
  {`
    /* Set the pagination container to use flexbox */
    .ant-table-pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    /* Target the container that holds the page numbers and arrows */
    .ant-pagination-item-container {
      margin-left: auto; /* This is the key: it pushes itself and everything after it to the right */
      margin-right: 8px; /* Optional: add a small gap */
    }

    /* Ensure the showTotal text is always on the far left */
    .ant-pagination-total-text {
      margin-right: auto;
    }
  `}
</style>
      {newOrderCount > 0 && (
        <Alert
          message={`Có ${newOrderCount} đơn hàng mới!`}
          type="info"
          showIcon
          action={
            <Button size="small" type="primary" onClick={fetchOrders}>Tải thêm</Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={OrderTabs.map(tab => ({
          key: tab.key,
          label: tab.label,
        }))}
        style={{ marginBottom: 16 }}
      />
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
        pagination={{
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          onShowSizeChange: (current, size) => setPageSize(size),
          showTotal: (total, range) => `Đã hiển thị từ ${range[0]}-${range[1]} trong tổng ${total}`,
          showQuickJumper: true,
        }}
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
              <Descriptions.Item label="Trạng thái">
                <StatusTag status={selectedOrder.status} />
                {(selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'REFUNDED') && selectedOrder.latestLog && (
                  <span style={{ marginLeft: 8, fontStyle: 'italic', color: '#888' }}>
                    ({selectedOrder.status === 'CANCELLED' ? 'bởi ' : 'hoàn tiền bởi '}
                    {PerformedByText[selectedOrder.latestLog.performed_by] || selectedOrder.latestLog.performed_by})
                  </span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">{selectedOrder.paymentType}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Text strong color="red">{selectedOrder.totalAmount.toLocaleString('vi-VN')} VNĐ</Text>
              </Descriptions.Item>
              {typeof selectedOrder.discount === 'number' && (
                <Descriptions.Item label="Giảm giá">
                  <Text type="success">-{selectedOrder.discount.toLocaleString('vi-VN')} VNĐ</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Địa chỉ giao hàng" span={3}>{selectedOrder.shippingAddress}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Sản phẩm trong đơn</Title>
            <Table
              columns={[
                { title: 'Sản phẩm', dataIndex: 'productName', render: (_: any, record: OrderItem) => `${record.productName} ${record.variantName ? `(${record.variantName})` : ''}` },
                { title: 'Số lượng', dataIndex: 'quantity', align: 'center' },
                { title: 'Đơn giá', dataIndex: 'sellingPrice', render: (price: number) => `${price.toLocaleString('vi-VN')} VNĐ` },
                { title: 'Giá bán', dataIndex: 'promotionalPrice', render: (price?: number, record?: any) => `${(price || record.sellingPrice).toLocaleString('vi-VN')} VNĐ` },
                { title: 'Thành tiền', key: 'total', render: (_, record: OrderItem) => <Text strong>{(record.quantity * (record.promotionalPrice || record.sellingPrice)).toLocaleString('vi-VN')} VNĐ</Text> },
              ]}
              dataSource={selectedOrder.items}
              rowKey="id"
              pagination={false}
              summary={pageData => {
                const total = pageData.reduce((acc, item) => acc + (item.quantity * (item.promotionalPrice || item.sellingPrice)), 0);
                return (
                  <>
                    {typeof selectedOrder.discount === 'number' && (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4}><Text strong>Giảm giá</Text></Table.Summary.Cell>
                        <Table.Summary.Cell index={1}><Text type="success">-{selectedOrder.discount.toLocaleString('vi-VN')} VNĐ</Text></Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}><Text strong>Tổng cộng</Text></Table.Summary.Cell>
                      <Table.Summary.Cell index={1}><Text type="danger" strong>{total.toLocaleString('vi-VN')} VNĐ</Text></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </>
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