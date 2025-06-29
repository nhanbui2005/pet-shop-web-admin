import React, { useState, useMemo } from 'react';
import {
    Table, Button, Modal, Form, Input, message, Select, DatePicker,
    Tag, Card, Row, Col, Typography, Space, Popconfirm, App, InputNumber
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    PercentageOutlined, DollarOutlined, SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

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
    { id: 1, name: 'Hội viên Vàng', description: 'Giảm 10% cho thành viên hạng Vàng', type: 'percent', value: 10, status: 'active', startDate: '2024-05-01', endDate: '2024-12-31' },
    { id: 2, name: 'Giảm giá mùa hè', description: 'Giảm 50.000đ cho mọi dịch vụ spa', type: 'amount', value: 50000, status: 'inactive', startDate: '2024-06-01', endDate: '2024-06-30' },
    { id: 3, name: 'Chào bạn mới', description: 'Giảm 15% cho đơn hàng đầu tiên', type: 'percent', value: 15, status: 'active', startDate: '2024-01-01', endDate: '2025-12-31' },
];

const DiscountManagement: React.FC = () => {
    const { message } = App.useApp();
    const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const filteredDiscounts = useMemo(() => {
        if (!searchText) return discounts;
        return discounts.filter(d =>
            d.name.toLowerCase().includes(searchText.toLowerCase()) ||
            d.description.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [discounts, searchText]);

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

    const handleDelete = (id: number) => {
        setDiscounts(discounts.filter(d => d.id !== id));
        message.success('Xóa chương trình thành công');
    };
    
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Giả lập API call
            setTimeout(() => {
                const { dateRange, ...rest } = values;
                const discountData = {
                    ...rest,
                    startDate: dateRange[0].format('YYYY-MM-DD'),
                    endDate: dateRange[1].format('YYYY-MM-DD'),
                };

                if (editingId) {
                    setDiscounts(discounts.map(d => d.id === editingId ? { ...d, ...discountData } : d));
                    message.success('Cập nhật thành công');
                } else {
                    const newDiscount = { id: Date.now(), ...discountData };
                    setDiscounts([newDiscount, ...discounts]);
                    message.success('Thêm mới thành công');
                }
                setIsModalVisible(false);
                setLoading(false);
            }, 500);

        } catch (error) {
            console.log('Validate Failed:', error);
            setLoading(false);
        }
    };

    const columns = [
        { title: 'Tên chương trình', dataIndex: 'name', key: 'name', render: (text: string) => <Typography.Text strong>{text}</Typography.Text> },
        { title: 'Mô tả', dataIndex: 'description', key: 'description' },
        {
            title: 'Loại & Giá trị', key: 'value', render: (_: any, record: Discount) => (
                <Tag
                    color={record.type === 'percent' ? 'blue' : 'green'}
                    icon={record.type === 'percent' ? <PercentageOutlined /> : <DollarOutlined />}
                >
                    {record.type === 'percent' ? `${record.value}%` : `${record.value.toLocaleString('vi-VN')} VNĐ`}
                </Tag>
            )
        },
        { title: 'Hiệu lực', key: 'date', render: (record: Discount) => `${dayjs(record.startDate).format('DD/MM/YY')} - ${dayjs(record.endDate).format('DD/MM/YY')}` },
        {
            title: 'Trạng thái', dataIndex: 'status', key: 'status',
            render: (status: string) => <Tag color={status === 'active' ? 'success' : 'default'}>{status === 'active' ? 'Đang áp dụng' : 'Ngừng'}</Tag>,
            filters: [{text: 'Đang áp dụng', value: 'active'}, {text: 'Ngừng', value: 'inactive'}],
            onFilter: (value: any, record: Discount) => record.status === value,
        },
        {
            title: 'Thao tác', key: 'action', render: (_: any, record: Discount) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                    <Popconfirm title="Xóa chương trình này?" onConfirm={() => handleDelete(record.id)}>
                        <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    return (
        <Card>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Input
                            placeholder="Tìm theo tên, mô tả..."
                            prefix={<SearchOutlined />}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 250 }}
                            allowClear
                        />
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Thêm chương trình
                        </Button>
            </Row>

            <Table
                columns={columns}
                dataSource={filteredDiscounts}
                rowKey="id"
                components={{
                    header: { cell: (props: any) => <th {...props} style={{ background: '#f0f5ff' }} /> },
                }}
            />

            <Modal
                title={editingId ? 'Sửa chương trình giảm giá' : 'Thêm chương trình mới'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={loading}
                destroyOnClose
            >
                <Form form={form} layout="vertical" name="discount_form" initialValues={{ type: 'percent', status: 'active' }}>
                    <Form.Item name="name" label="Tên chương trình" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="Ví dụ: Giảm giá mùa hè" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả ngắn" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                        <Input.TextArea rows={2} placeholder="Mô tả chi tiết về chương trình" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="type" label="Loại giảm giá" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="percent">Phần trăm (%)</Option>
                                    <Option value="amount">Số tiền (VNĐ)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                shouldUpdate={(prev, current) => prev.type !== current.type}
                                noStyle
                            >
                                {({ getFieldValue }) => (
                                    <Form.Item name="value" label="Giá trị" rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                            addonAfter={getFieldValue('type') === 'percent' ? '%' : 'VNĐ'}
                                        />
                                    </Form.Item>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="dateRange" label="Thời gian áp dụng" rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}>
                        <DatePicker.RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                        <Select>
                            <Option value="active">Đang áp dụng</Option>
                            <Option value="inactive">Ngừng</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};


export default DiscountManagement;