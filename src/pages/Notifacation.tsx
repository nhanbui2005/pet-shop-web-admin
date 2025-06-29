import React, { useState } from 'react';
import {
    Tabs, Card, Button, Table, Tag, Modal, Form, Input, DatePicker,
    Switch, Popconfirm, message, Tooltip, App, Row, Col, Typography, Space
} from 'antd';
import {
    BellOutlined, UserOutlined, EditOutlined, DeleteOutlined,
    PlusOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import TabPane from 'antd/es/tabs/TabPane';

const { Title } = Typography;

// Dữ liệu mẫu (Giữ nguyên)
const initialUserNotifications = [
    { id: '1', title: 'Khuyến mãi hè 2025', content: 'Giảm giá 20% toàn bộ sản phẩm từ ngày 01/07!', status: 'Đã gửi', time: '2025-06-28 10:00', type: 'user' },
    { id: '2', title: 'Thông báo nghỉ lễ 30/04', content: 'Cửa hàng sẽ nghỉ lễ từ ngày 30/04 đến hết 01/05.', status: 'Đang chờ', time: '2026-04-25 09:00', type: 'user' },
];

const initialAdminReminders = [
    { id: '1', title: 'Kiểm tra tồn kho', content: 'Nhớ kiểm tra tồn kho mỗi thứ 2 hàng tuần.', active: true, schedule: 'Thứ 2 hàng tuần', type: 'admin' },
    { id: '2', title: 'Backup dữ liệu', content: 'Backup dữ liệu hệ thống vào cuối tháng.', active: true, schedule: 'Ngày cuối mỗi tháng', type: 'admin' },
];


const NotificationManagement: React.FC = () => {
    const { message } = App.useApp();
    const [activeTab, setActiveTab] = useState('user');

    // State cho từng tab
    const [userNotifications, setUserNotifications] = useState(initialUserNotifications);
    const [adminReminders, setAdminReminders] = useState(initialAdminReminders);

    // Modal và Form
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // --- XỬ LÝ CHUNG ---
    const handleAddNew = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: any) => {
        setEditingRecord(record);
        if (activeTab === 'user') {
            form.setFieldsValue({ ...record, time: dayjs(record.time) });
        } else {
            form.setFieldsValue(record);
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                setLoading(true);
                // Giả lập gọi API
                setTimeout(() => {
                    if (activeTab === 'user') {
                        handleUserSubmit(values);
                    } else {
                        handleAdminSubmit(values);
                    }
                    setLoading(false);
                }, 500);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };


    // --- LOGIC RIÊNG CHO TỪNG TAB ---
    const handleUserSubmit = (values: any) => {
        if (editingRecord) {
            setUserNotifications(prev => prev.map(n => n.id === editingRecord.id ? { ...n, ...values, time: values.time.format('YYYY-MM-DD HH:mm') } : n));
            message.success('Đã cập nhật thông báo!');
        } else {
            setUserNotifications(prev => [{ id: Date.now().toString(), ...values, status: 'Đang chờ', time: values.time.format('YYYY-MM-DD HH:mm'), type: 'user' }, ...prev]);
            message.success('Đã tạo thông báo!');
        }
        setIsModalVisible(false);
    };

    const deleteUserNotification = (id: string) => {
        setUserNotifications(prev => prev.filter(n => n.id !== id));
        message.success('Đã xóa thông báo!');
    };

    const handleAdminSubmit = (values: any) => {
        if (editingRecord) {
            setAdminReminders(prev => prev.map(n => n.id === editingRecord.id ? { ...n, ...values } : n));
            message.success('Đã cập nhật nhắc nhở!');
        } else {
            setAdminReminders(prev => [{ id: Date.now().toString(), ...values, type: 'admin' }, ...prev]);
            message.success('Đã tạo nhắc nhở!');
        }
        setIsModalVisible(false);
    };

    const deleteAdminReminder = (id: string) => {
        setAdminReminders(prev => prev.filter(n => n.id !== id));
        message.success('Đã xóa nhắc nhở!');
    };


    // --- CÁC CỘT CỦA BẢNG ---
    const userColumns = [
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title', render: (text: string) => <Typography.Text strong>{text}</Typography.Text> },
        { title: 'Nội dung', dataIndex: 'content', key: 'content' },
        { title: 'Thời gian gửi', dataIndex: 'time', key: 'time', render: (t: string) => <Tag icon={<ClockCircleOutlined />}>{t}</Tag> },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'Đã gửi' ? 'success' : 'warning'}>{s}</Tag> },
        {
            title: 'Thao tác', key: 'action', width: 120, render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Sửa"><Button icon={<EditOutlined />} onClick={() => handleEdit(record)} /></Tooltip>
                    <Popconfirm title="Xóa thông báo này?" onConfirm={() => deleteUserNotification(record.id)}>
                        <Tooltip title="Xóa"><Button icon={<DeleteOutlined />} danger /></Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const adminColumns = [
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title', render: (text: string) => <Typography.Text strong>{text}</Typography.Text> },
        { title: 'Nội dung', dataIndex: 'content', key: 'content' },
        { title: 'Lịch nhắc', dataIndex: 'schedule', key: 'schedule', render: (s: string) => <Tag color="blue">{s}</Tag> },
        { title: 'Trạng thái', dataIndex: 'active', key: 'active', render: (active: boolean) => <Switch defaultChecked={active} checkedChildren="Bật" unCheckedChildren="Tắt" /> },
        {
            title: 'Thao tác', key: 'action', width: 120, render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Sửa"><Button icon={<EditOutlined />} onClick={() => handleEdit(record)} /></Tooltip>
                    <Popconfirm title="Xóa nhắc nhở này?" onConfirm={() => deleteAdminReminder(record.id)}>
                        <Tooltip title="Xóa"><Button icon={<DeleteOutlined />} danger /></Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // --- RENDER MODAL CONTENT ---
    const renderModalContent = () => {
        if (activeTab === 'user') {
            return (
                <>
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                        <Input placeholder="Ví dụ: Khuyến mãi hè rộn ràng" />
                    </Form.Item>
                    <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
                        <Input.TextArea rows={4} placeholder="Nội dung chi tiết của thông báo..." />
                    </Form.Item>
                    <Form.Item name="time" label="Thời gian gửi" rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}>
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder="Chọn ngày và giờ gửi" />
                    </Form.Item>
                </>
            );
        }
        return (
            <>
                <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                    <Input placeholder="Ví dụ: Kiểm tra tồn kho" />
                </Form.Item>
                <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
                    <Input.TextArea rows={3} placeholder="Mô tả chi tiết lời nhắc..." />
                </Form.Item>
                <Form.Item name="schedule" label="Lịch nhắc" rules={[{ required: true, message: 'Vui lòng nhập lịch nhắc' }]}>
                    <Input placeholder="Ví dụ: Thứ 2 hàng tuần, 8h sáng ngày 15..." />
                </Form.Item>
                <Form.Item name="active" label="Trạng thái" valuePropName="checked">
                    <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                </Form.Item>
            </>
        );
    };

    return (
        <Card>
            <Tabs
                defaultActiveKey="user"
                onChange={setActiveTab}
                size="large"
                tabBarExtraContent={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
                        {activeTab === 'user' ? 'Tạo thông báo mới' : 'Tạo nhắc nhở mới'}
                    </Button>
                }
            >
                <TabPane tab={<Space><UserOutlined />Thông báo cho User</Space>} key="user">
                    <Table
                        columns={userColumns}
                        dataSource={userNotifications}
                        rowKey="id"
                        components={{
                            header: { cell: (props: any) => <th {...props} style={{ background: '#f0f5ff' }} /> },
                        }}
                    />
                </TabPane>
                <TabPane tab={<Space><BellOutlined />Nhắc nhở cho Admin</Space>} key="admin">
                    <Table
                        columns={adminColumns}
                        dataSource={adminReminders}
                        rowKey="id"
                        components={{
                            header: { cell: (props: any) => <th {...props} style={{ background: '#f0f5ff' }} /> },
                        }}
                    />
                </TabPane>
            </Tabs>

            <Modal
                title={editingRecord
                    ? (activeTab === 'user' ? 'Sửa thông báo' : 'Sửa nhắc nhở')
                    : (activeTab === 'user' ? 'Tạo thông báo mới' : 'Tạo nhắc nhở mới')
                }
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={loading}
                destroyOnClose
                forceRender
            >
                <Form form={form} layout="vertical" name="notification_form">
                    {renderModalContent()}
                </Form>
            </Modal>
        </Card>
    );
};


// Wrap with <App> to use `message` context
const NotificationsPage = () => (
    <App>
        <NotificationManagement />
    </App>
);

export default NotificationsPage;