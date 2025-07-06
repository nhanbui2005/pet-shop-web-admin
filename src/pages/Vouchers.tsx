import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table, Pagination, Card, Spin, Typography, Button, Modal, Form, Input,
  InputNumber, DatePicker, Select, Switch, message, Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { fetchVouchers, createVoucher, deactivateVoucher, activateVoucher } from '../features/voucher/voucherSlice';
import type { RootState } from '../store';

dayjs.extend(isSameOrBefore);

interface Voucher {
  _id?: string;
  code?: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  quantity: number;
  used?: number;
  is_active?: boolean;
  apply_type: string;
  product_ids?: string[];
  createdAt: string;
}

const { Title } = Typography;
const { Option } = Select;

const Vouchers = () => {
  const dispatch = useDispatch();
  const { data = [], total = 0, loading = false } = useSelector((state: RootState) => state.voucher) || {};
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState('fixed');

  useEffect(() => {
    (dispatch as any)(fetchVouchers({ page, limit }));
  }, [page, limit, dispatch]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ start_date: null, end_date: null });
    setModalOpen(true);
  };

  const handleDeactivate = async (id: string) => {
    setSubmitting(true);
    try {
      await (dispatch as any)(deactivateVoucher(id));
      message.success('Đã tắt voucher');
      (dispatch as any)(fetchVouchers({ page, limit }));
    } catch {
      message.error('Có lỗi khi tắt voucher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (id: string) => {
    setSubmitting(true);
    try {
      await (dispatch as any)(activateVoucher(id));
      message.success('Đã bật voucher');
      (dispatch as any)(fetchVouchers({ page, limit }));
    } catch {
      message.error('Có lỗi khi bật voucher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!values.start_date || !values.end_date) {
        message.error('Ngày không hợp lệ!');
        return;
      }

      setSubmitting(true);
      let description = values.description;
      if (!description || !description.trim()) {
        if (values.discount_type === 'percent') {
          description = `Giảm ${values.discount_value}% cho đơn hàng${values.min_order_value ? ` từ ${values.min_order_value.toLocaleString()}đ` : ''}${values.max_discount ? `, giảm tối đa ${values.max_discount.toLocaleString()}đ` : ''}`;
        } else {
          description = `Giảm ${values.discount_value.toLocaleString()}đ cho đơn hàng${values.min_order_value ? ` từ ${values.min_order_value.toLocaleString()}đ` : ''}`;
        }
      }

      if (values.discount_type === 'percent' && values.discount_value > 99) {
        message.error('Giá trị phần trăm không được quá 99%');
        setSubmitting(false);
        return;
      }

      const payload = {
        ...values,
        description,
        min_order_value: Number(values.min_order_value ?? 0),
        quantity: Number(values.quantity),
        discount_value: Number(values.discount_value),
        max_discount: values.max_discount ? Number(values.max_discount) : undefined,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
      };

      await (dispatch as any)(createVoucher(payload));
      message.success('Tạo voucher thành công');
      setModalOpen(false);
      (dispatch as any)(fetchVouchers({ page, limit }));
    } catch (err) {
      message.error('Vui lòng kiểm tra lại thông tin');
      console.error('Validate error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: 'Mã', dataIndex: 'code', key: 'code', render: (v: string) => <b>{v}</b> },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Loại giảm', dataIndex: 'discount_type', key: 'discount_type', render: (v: string) => v === 'fixed' ? 'Tiền mặt' : 'Phần trăm' },
    { title: 'Giá trị', dataIndex: 'discount_value', key: 'discount_value', render: (v: number, r: Voucher) => r.discount_type === 'fixed' ? `${v.toLocaleString()}đ` : `${v}%` },
    { title: 'Đơn tối thiểu', dataIndex: 'min_order_value', key: 'min_order_value', render: (v: number) => v?.toLocaleString() },
    { title: 'Giảm tối đa', dataIndex: 'max_discount', key: 'max_discount', render: (v: number) => v?.toLocaleString() },
    { title: 'Ngày bắt đầu', dataIndex: 'start_date', key: 'start_date', render: (v: string) => v ? new Date(v).toLocaleString() : '', sorter: (a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime() },
    { title: 'Ngày kết thúc', dataIndex: 'end_date', key: 'end_date', render: (v: string) => v ? new Date(v).toLocaleString() : '' },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleString() : '', sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Lượt dùng', dataIndex: 'used', key: 'used' },
    { title: 'Trạng thái', dataIndex: 'is_active', key: 'is_active', render: (v: boolean) => v ? <span style={{ color: '#389e0d' }}>Đang hoạt động</span> : <span style={{ color: '#d4380d' }}>Đã tắt</span> },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Voucher) => (
        <span>
          {record.is_active ? (
            <Popconfirm title="Tắt voucher này?" onConfirm={() => handleDeactivate(record._id!)} okButtonProps={{ loading: submitting }}>
              <Button icon={<StopOutlined />} size="small" danger disabled={!record.is_active} />
            </Popconfirm>
          ) : (
            <Button size="small" onClick={() => handleActivate(record._id!)} loading={submitting}>
              Bật
            </Button>
          )}
        </span>
      ),
    },
  ];

  return (
    <Card style={{ margin: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Thêm voucher</Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={data as Voucher[]}
          rowKey="_id"
          pagination={false}
          bordered
          style={{ marginBottom: 16 }}
          locale={{ emptyText: 'Không có dữ liệu voucher' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <Pagination
            current={page}
            pageSize={limit}
            total={total}
            showSizeChanger
            pageSizeOptions={[5, 10, 20, 50]}
            onChange={(p, l) => {
              setPage(p);
              setLimit(l);
            }}
          />
        </div>
      </Spin>
      <Modal
        title={'Thêm voucher'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        destroyOnClose
        okText={'Tạo mới'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            discount_type: 'fixed',
            apply_type: 'order',
            is_active: true,
            quantity: 1,
            min_order_value: 0,
          }}
        >
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="discount_type"
            label="Loại giảm giá"
            rules={[{ required: true, message: 'Chọn loại giảm giá' }]}
          >
            <Select onChange={val => setDiscountType(val)}>
              <Option value="fixed">Tiền mặt</Option>
              <Option value="percent">Phần trăm</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="discount_value"
            label="Giá trị giảm"
            rules={[
              { required: true, type: 'number', min: 1, message: 'Nhập giá trị giảm hợp lệ' },
              {
                validator: (_, value) => {
                  if (discountType === 'percent' && value > 99) {
                    return Promise.reject('Giá trị phần trăm không được quá 99%');
                  }
                  if (discountType === 'fixed' && value <= 0) {
                    return Promise.reject('Giá trị tiền mặt phải lớn hơn 0');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.discount_type !== curr.discount_type}
          >
            {({ getFieldValue }) =>
              getFieldValue('discount_type') === 'percent' ? (
                <Form.Item
                  name="max_discount"
                  label="Giảm tối đa (bắt buộc với phần trăm)"
                  rules={[{ required: true, type: 'number', min: 1, message: 'Nhập giảm tối đa hợp lệ' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={1} />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item name="min_order_value" label="Đơn tối thiểu" rules={[{ type: 'number', min: 0, message: 'Nhập đơn tối thiểu hợp lệ' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item
            name="start_date"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              format="YYYY-MM-DD HH:mm"
              disabledDate={current => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
          <Form.Item
            name="end_date"
            label="Ngày kết thúc"
            rules={[{ required: true, message: 'Chọn ngày kết thúc' }, ({ getFieldValue }) => ({
              validator(_, value) {
                const start = getFieldValue('start_date');
                if (!value || !start) return Promise.resolve();
                if (dayjs(value).isSameOrBefore(dayjs(start))) {
                  return Promise.reject('Ngày kết thúc phải lớn hơn ngày bắt đầu');
                }
                return Promise.resolve();
              }
            })]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              format="YYYY-MM-DD HH:mm"
              disabledDate={current => {
                const start = form.getFieldValue('start_date');
                if (!start) return current && current < dayjs().startOf('day');
                return current && current < dayjs().startOf('day') || dayjs(current).isSameOrBefore(dayjs(start));
              }}
            />
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, type: 'number', min: 1, message: 'Nhập số lượng hợp lệ' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="is_active" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="apply_type" label="Áp dụng cho" rules={[{ required: true, message: 'Chọn kiểu áp dụng' }]}>
            <Select>
              <Option value="order">Đơn hàng</Option>
              <Option value="product">Sản phẩm</Option>
              <Option value="delivery">Vận chuyển</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Vouchers;
