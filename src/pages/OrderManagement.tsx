import React, { useState } from 'react';
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
} from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { Dayjs } from 'dayjs';
import type { RangePickerProps } from 'antd/es/date-picker';

const { RangePicker } = DatePicker;

interface Order {
  id: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

const OrderManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<[string, string] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Mock data - Replace with actual API calls
  const orders: Order[] = [
    {
      id: 'ORD001',
      customerName: 'Nguyễn Văn A',
      orderDate: '2024-03-15',
      totalAmount: 1500000,
      status: 'completed',
      paymentMethod: 'Credit Card',
      items: [
        { id: '1', productName: 'Pet Food Premium', quantity: 2, price: 500000 },
        { id: '2', productName: 'Pet Shampoo', quantity: 1, price: 500000 },
      ],
    },
    // Add more mock data as needed
  ];

  const columns: TableProps<Order>['columns'] = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `${amount.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusColors = {
          pending: 'orange',
          processing: 'blue',
          completed: 'green',
          cancelled: 'red',
        };
        const statusText = {
          pending: 'Chờ xử lý',
          processing: 'Đang xử lý',
          completed: 'Hoàn thành',
          cancelled: 'Đã hủy',
        };
        return (
          <Tag color={statusColors[status as keyof typeof statusColors]}>
            {statusText[status as keyof typeof statusText]}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Order) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setIsModalVisible(true);
            }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const handleDateRangeChange: RangePickerProps['onChange'] = (dates, dateStrings) => {
    if (dates) {
      setSelectedDateRange([
        dateStrings[0],
        dateStrings[1],
      ]);
    } else {
      setSelectedDateRange(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      order.id.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesDate = !selectedDateRange || (
      order.orderDate >= selectedDateRange[0] &&
      order.orderDate <= selectedDateRange[1]
    );
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="p-6">
      <Card title="Quản lý đơn hàng" className="mb-6">
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="pending">Chờ xử lý</Select.Option>
              <Select.Option value="processing">Đang xử lý</Select.Option>
              <Select.Option value="completed">Hoàn thành</Select.Option>
              <Select.Option value="cancelled">Đã hủy</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
            />
          </Col>
        </Row>

        <Table
          style={{marginTop: 20}}
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
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
        title="Chi tiết đơn hàng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã đơn hàng">{selectedOrder.id}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{selectedOrder.customerName}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">{selectedOrder.orderDate}</Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">{selectedOrder.paymentMethod}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={
                  selectedOrder.status === 'completed' ? 'green' :
                  selectedOrder.status === 'processing' ? 'blue' :
                  selectedOrder.status === 'pending' ? 'orange' : 'red'
                }>
                  {selectedOrder.status === 'completed' ? 'Hoàn thành' :
                   selectedOrder.status === 'processing' ? 'Đang xử lý' :
                   selectedOrder.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                {selectedOrder.totalAmount.toLocaleString('vi-VN')} VNĐ
              </Descriptions.Item>
            </Descriptions>

            <Table
              className="mt-4"
              columns={[
                { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
                { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
                {
                  title: 'Đơn giá',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price: number) => `${price.toLocaleString('vi-VN')} VNĐ`,
                },
                {
                  title: 'Thành tiền',
                  key: 'total',
                  render: (_: unknown, record: OrderItem) => `${(record.quantity * record.price).toLocaleString('vi-VN')} VNĐ`,
                },
              ]}
              dataSource={selectedOrder.items}
              rowKey="id"
              pagination={false}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement; 