import React, { useState } from 'react';
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
  Tag,
  Avatar,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';

const { Option } = Select;

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

const Customers: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  // Mock data - Replace with actual API calls
  const customers: Customer[] = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0123456789',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      status: 'active',
    },
    {
      id: '2',
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0987654321',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      status: 'active',
    },
  ];

  const columns: TableProps<Customer>['columns'] = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Customer) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <span>{text}</span>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
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
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Không hoạt động', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
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
            title="Xóa khách hàng"
            description="Bạn có chắc chắn muốn xóa khách hàng này?"
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

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue(customer);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    // Implement delete logic
    message.success('Xóa khách hàng thành công');
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      // Implement save logic
      message.success(editingCustomer ? 'Cập nhật khách hàng thành công' : 'Thêm khách hàng thành công');
      setIsModalVisible(false);
      form.resetFields();
      setEditingCustomer(null);
    });
  };

  return (
    <div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm khách hàng"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCustomer(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Thêm khách hàng
          </Button>
        </Space>

        <Table
          style={{marginTop: 20}}
          columns={columns}
          dataSource={customers}
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
        title={editingCustomer ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingCustomer(null);
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'active' }}
        >
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="avatar"
            label="Ảnh đại diện"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers; 