import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Upload,
  Select,
  Avatar,
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
  UserOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { East } from '@mui/icons-material';

const { Option } = Select;

// Giữ nguyên interface Customer
interface Customer {
  id: string;
  name: string;
  surName: string;
  email: string;
  phone: string;
  createdAt: string;
  avatar?: string;
}

const Customers: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/users/get-all-users', {
        params: { page: 1, limit: 100 }, // Bạn có thể thêm phân trang ở đây
      });
      
      const users = res.data?.data || res.data || res;
      const mappedUsers = (users.data || users).map((user: any) => ({
        id: user._id,
        name: user.name,
        surName: user.surName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        avatar: user.avatar,
      }));
      setCustomers(mappedUsers);
      setFilteredCustomers(mappedUsers); // Khởi tạo dữ liệu đã lọc
    } catch (error) {
      message.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    const filteredData = customers.filter(customer =>
      `${customer.surName} ${customer.name}`.toLowerCase().includes(value) ||
      customer.email.toLowerCase().includes(value) ||
      customer.phone.includes(value)
    );
    setFilteredCustomers(filteredData);
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
    form.setFieldsValue({ ...customer });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // Giả sử API endpoint là /users/:id
      await axiosClient.delete(`/users/${id}`);
      message.success('Xóa khách hàng thành công');
      fetchCustomers(); // Tải lại dữ liệu sau khi xóa
    } catch (error) {
        message.error('Xóa khách hàng thất bại');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setViewingCustomer(null);
    form.resetFields();
  };


  const columns: TableProps<Customer>['columns'] = [
    {
      title: 'Họ và tên',
      key: 'name',
      render: (_, record: Customer) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <span>{`${record.surName} ${record.name}`}</span>
        </Space>
      ),
      sorter: (a, b) => (`${a.surName} ${a.name}`).localeCompare(`${b.surName} ${b.name}`),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
      responsive: ['md'], // Tự động ẩn trên màn hình nhỏ
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200, // Cho chiều rộng cố định để các nút không bị xuống dòng
      fixed: 'right', // Ghim cột này ở bên phải
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<East />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        {/* KHU VỰC ĐIỀU KHIỂN: TÌM KIẾM VÀ THÊM MỚI */}
        <Row gutter={[16, 16]} justify="space-between" align="middle">
            <Col xs={24} sm={12} md={10} lg={8}>
                <Input
                    placeholder="Tìm kiếm theo tên, email, SĐT..."
                    prefix={<SearchOutlined />}
                    onChange={handleSearch}
                    allowClear
                />
            </Col>
            <Col>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setViewingCustomer(null)}
                >
                    Thêm mới
                </Button>
            </Col>
        </Row>

        <Table
          style={{ marginTop: 20 }}
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }} // <-- ĐÂY LÀ CHÌA KHÓA
          className="custom-table"
          components={{
            header: {
              cell: (props: any) => (
                <th
                  {...props}
                  style={{
                    background: '#f0f5ff', // Một màu nhẹ nhàng hơn
                    color: '#333',
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
        title={viewingCustomer ? 'Thông tin khách hàng' : ''}
        open={isModalVisible}
        onCancel={handleModalCancel}
        width={600}
        footer={[
          <Button key="close" onClick={handleModalCancel}>
            Đóng
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'active' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="surName"
                label="Họ và Tên đệm"
              >
                <Input readOnly disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên"
              >
                <Input readOnly disabled />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="email"
            label="Email"
          >
            <Input readOnly disabled />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
          >
            <Input readOnly disabled />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={3} readOnly disabled />
          </Form.Item>
          <Form.Item name="avatar" label="Ảnh đại diện">
            {viewingCustomer?.avatar ? (
              <Avatar src={viewingCustomer.avatar} size={64} />
            ) : (
              <Avatar icon={<UserOutlined />} size={64} />
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;