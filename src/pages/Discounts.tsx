import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Select, DatePicker, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PercentageOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Discount {
  id: number;
  name: string;
  description: string;
  type: 'percent' | 'amount';
  value: number;
  status: 'active' | 'inactive';
  startDate: string;
  endDate: string;
}

const initialDiscounts: Discount[] = [
  {
    id: 1,
    name: 'Hội viên Vàng',
    description: 'Giảm 10% cho hội viên vàng',
    type: 'percent',
    value: 10,
    status: 'active',
    startDate: '2024-05-01',
    endDate: '2024-12-31',
  },
  {
    id: 2,
    name: 'Giảm giá mùa hè',
    description: 'Giảm 50.000đ cho mọi dịch vụ',
    type: 'amount',
    value: 50000,
    status: 'inactive',
    startDate: '2024-06-01',
    endDate: '2024-06-30',
  },
];

const Discounts: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  const columns = [
    {
      title: 'Tên chương trình',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'percent' ? 'blue' : 'green'} icon={type === 'percent' ? <PercentageOutlined /> : <DollarOutlined />}>
          {type === 'percent' ? 'Phần trăm' : 'Số tiền'}
        </Tag>
      ),
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      render: (value: number, record: Discount) => (
        record.type === 'percent' ? `${value}%` : `${value.toLocaleString()}đ`
      ),
    },
    {
      title: 'Hiệu lực',
      key: 'date',
      render: (record: Discount) => (
        `${record.startDate} - ${record.endDate}`
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Đang áp dụng' : 'Ngừng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Discount) => (
        <div className="space-x-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Discount) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      // TODO: Implement delete API call
      setDiscounts(discounts.filter(d => d.id !== id));
      message.success('Xóa chương trình khuyến mãi thành công');
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa chương trình khuyến mãi');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const { dateRange, ...rest } = values;
      
      const discountData = {
        ...rest,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };

      if (editingId) {
        // TODO: Implement update API call
        setDiscounts(discounts.map(d => 
          d.id === editingId ? { ...d, ...discountData } : d
        ));
        message.success('Cập nhật chương trình khuyến mãi thành công');
      } else {
        // TODO: Implement create API call
        const newDiscount = {
          id: discounts.length + 1,
          ...discountData,
        };
        setDiscounts([...discounts, newDiscount]);
        message.success('Thêm chương trình khuyến mãi thành công');
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Thêm chương trình khuyến mãi
        </Button>
      </div>

      <Table
        style={{marginTop: 20}}
        columns={columns}
        dataSource={discounts}
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

      <Modal
        title={editingId ? 'Sửa chương trình khuyến mãi' : 'Thêm chương trình khuyến mãi'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên chương trình"
            rules={[{ required: true, message: 'Vui lòng nhập tên chương trình' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
          >
            <Select>
              <Select.Option value="percent">Phần trăm (%)</Select.Option>
              <Select.Option value="amount">Số tiền (VNĐ)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="value"
            label="Giá trị"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Thời gian áp dụng"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Select.Option value="active">Đang áp dụng</Select.Option>
              <Select.Option value="inactive">Ngừng</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Discounts; 