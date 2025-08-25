import React, { useState, useEffect } from 'react';
import {
    Tabs, Card, Button, Table, Tag, Modal, Form, Input, DatePicker,
    Switch, Popconfirm, message, Tooltip, App, Row, Col, Typography, Space, Upload, Select, Image
} from 'antd';
import {
    BellOutlined, UserOutlined, EditOutlined, DeleteOutlined,
    PlusOutlined, ClockCircleOutlined, SendOutlined, HistoryOutlined, UploadOutlined, CheckCircleFilled, ClockCircleFilled
} from '@ant-design/icons';
import dayjs from 'dayjs';
// VUI LÒNG ĐẢM BẢO ĐƯỜNG DẪN NÀY CHÍNH XÁC VỚI VỊ TRÍ TỆP axiosClient.js CỦA BẠN.
// Ví dụ: Nếu NotificationManagement.tsx nằm trong 'src/components' và axiosClient.js nằm trong 'src/api',
// thì đường dẫn '../api/axiosClient' là chính xác.
import axiosClient from '../api/axiosClient';

const { Option } = Select;

interface UserNotification {
    id: string;
    title: string;
    content: string;
    status: string;
    time: string;
    type: string;
}
interface AdminReminder {
    id: string;
    title: string;
    content: string;
    active: boolean;
    schedule: string;
    type: string;
}

interface ApiNotification {
    _id: string;
    isBroadcast: boolean;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    image_url?: string;
    scheduled_time?: string;
    createdAt: string;
    __v?: number;
}

const NotificationManagement: React.FC = () => {
    const { message } = App.useApp();
    const [activeTab, setActiveTab] = useState('user');

    const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);
    const [adminReminders, setAdminReminders] = useState<AdminReminder[]>([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [apiNotifications, setApiNotifications] = useState<ApiNotification[]>([]);
    const [apiNotificationsTotal, setApiNotificationsTotal] = useState(0);
    const [apiLoading, setApiLoading] = useState(false);

    const [sendForm] = Form.useForm();
    const [sendLoading, setSendLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [now, setNow] = useState(dayjs());
    useEffect(() => {
        const timer = setInterval(() => setNow(dayjs()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchApiNotifications = async () => {
            setApiLoading(true);
            try {
                const res = await axiosClient.get(`/notification/admin?page=${page}&limit=${limit}`);
                console.log(res);
                
                setApiNotifications(res.data.data || []);
                setApiNotificationsTotal(res.data.total || 0);
            } catch (error) {
                console.error("Failed to fetch API notifications:", error);
                message.error('Không thể tải thông báo từ API.');
            } finally {
                setApiLoading(false);
            }
        };
        if (activeTab === 'history') {
            fetchApiNotifications();
        }
    }, [page, limit, message, activeTab]);

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
                message.error('Vui lòng điền đầy đủ các trường bắt buộc.');
            });
    };

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

    const handleSendBroadcast = async () => {
        try {
            const values = await sendForm.validateFields();
            console.log(values);
            
            setSendLoading(true);

            const createNotificationDto = {
                title: values.title,
                message: values.message,
                type: values.type || 'general',
                scheduled_time: values.scheduled_time ? values.scheduled_time.toISOString() : undefined,
                isBroadcast: true,
            };

            const formData = new FormData();
            formData.append('data', JSON.stringify(createNotificationDto));
            if (values.image && values.image.length > 0 && values.image[0].originFileObj) {
                formData.append('image', values.image[0].originFileObj);
            }

            const res = await axiosClient.post('/notification/broadcast', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(res);
            
            message.success( 'Đã gửi broadcast thành công!');
            sendForm.resetFields();
        } catch (error: any) {
            console.error('Lỗi khi gửi broadcast:', error);
            message.error(error.data?.message || 'Gửi broadcast thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setSendLoading(false);
        }
    };

    const handleSendToAllUsers = async () => {
        try {
            const values = await sendForm.validateFields(['title', 'message']);
            setSendLoading(true);

            const messagingPayload = {
                notification: {
                    title: values.title,
                    body: values.message,
                },
            };

            const res = await axiosClient.post('/notification/admin-send-to-all', messagingPayload);
            message.success('Đã gửi thông báo cho tất cả người dùng thành công!');
            sendForm.resetFields();
        } catch (error: any) {
            console.error('Lỗi khi gửi thông báo cho tất cả người dùng:', error);
            message.error(error.data?.message || 'Gửi thông báo cho tất cả người dùng thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setSendLoading(false);
        }
    };

    // const handleMarkApiNotificationAsRead = async (id: string) => {
    //     setApiLoading(true);
    //     try {
    //         const res = await axiosClient.post('/notification/read', { notificationIds: [id] });
    //         if (res.) {
    //             setApiNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    //             message.success('Đã đánh dấu là đã đọc!');
    //         } else {
    //             message.error(res.message || 'Đánh dấu đã đọc thất bại.');
    //         }
    //     } catch (error: any) {
    //         console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
    //         message.error(error.data?.message || 'Đã xảy ra lỗi khi đánh dấu thông báo đã đọc.');
    //     } finally {
    //         setApiLoading(false);
    //     }
    // };

    const userColumns = [
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title', render: (text: string) => <Typography.Text strong>{text}</Typography.Text> },
        { title: 'Nội dung', dataIndex: 'content', key: 'content' },
        { title: 'Thời gian gửi', dataIndex: 'time', key: 'time', render: (t: string) => <Tag icon={<ClockCircleOutlined />}>{t}</Tag> },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'Đã gửi' ? 'success' : 'processing'}>{s}</Tag> },
        {
            title: 'Thao tác', key: 'action', width: 120, render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Sửa"><Button icon={<EditOutlined />} onClick={() => handleEdit(record)} /></Tooltip>
                    <Popconfirm title="Xóa thông báo này?" onConfirm={() => deleteUserNotification(record.id)} okText="Có" cancelText="Không">
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
        {
            title: 'Trạng thái', dataIndex: 'active', key: 'active',
            render: (active: boolean, record: any) => (
                <Switch
                    checked={active}
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    onChange={(checked) => setAdminReminders(prev => prev.map(n => n.id === record.id ? { ...n, active: checked } : n))}
                />
            )
        },
        {
            title: 'Thao tác', key: 'action', width: 120, render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Sửa"><Button icon={<EditOutlined />} onClick={() => handleEdit(record)} /></Tooltip>
                    <Popconfirm title="Xóa nhắc nhở này?" onConfirm={() => deleteAdminReminder(record.id)} okText="Có" cancelText="Không">
                        <Tooltip title="Xóa"><Button icon={<DeleteOutlined />} danger /></Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const apiNotificationColumns = [
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title', render: (text: string) => <Typography.Text strong>{text}</Typography.Text> },
        { title: 'Nội dung', dataIndex: 'message', key: 'message' },
        { title: 'Loại', dataIndex: 'type', key: 'type', render: (type: string) => <Tag color="geekblue">{type}</Tag> },
        {
            title: 'Ảnh', dataIndex: 'image_url', key: 'image_url',
            render: (imageUrl: string) => imageUrl ? (
                <Image
                    src={imageUrl}
                    alt="Notification Image"
                    style={{ maxWidth: '80px', maxHeight: '80px', objectFit: 'contain', borderRadius: '4px' }}
                    fallback="https://placehold.co/80x80/eeeeee/aaaaaa?text=No+Image"
                />
            ) : (
                <Tag color="default">Không có ảnh</Tag>
            )
        },
        {
            title: 'Đã gửi', key: 'sent',
            render: (_: any, record: ApiNotification) => {
                if (!record.scheduled_time) {
                    return <Tag color="default"><ClockCircleFilled style={{ color: '#bfbfbf' }} /> Chưa gửi</Tag>;
                }
                const scheduled = dayjs(record.scheduled_time);
                if (scheduled.isBefore(now) || scheduled.isSame(now, 'second')) {
                    const diffMinutes = now.diff(scheduled, 'minute');
                    if (diffMinutes < 60) {
                        return <Tag color="success"><CheckCircleFilled style={{ color: '#52c41a' }} /> Đã gửi {diffMinutes > 0 ? `${diffMinutes} phút trước` : 'vừa xong'}</Tag>;
                    } else if (now.isSame(scheduled, 'day')) {
                        return <Tag color="success"><CheckCircleFilled style={{ color: '#52c41a' }} /> Đã gửi hôm nay lúc {scheduled.format('HH:mm')}</Tag>;
                    } else {
                        return <Tag color="success"><CheckCircleFilled style={{ color: '#52c41a' }} /> Đã gửi ngày {scheduled.format('DD/MM/YYYY')}</Tag>;
                    }
                }
                const diffSeconds = scheduled.diff(now, 'second');
                const diffMinutes = Math.floor(diffSeconds / 60);
                const diffHours = Math.floor(diffMinutes / 60);
                const diffDays = Math.floor(diffHours / 24);

                if (diffDays >= 1) {
                    return (
                        <Tag color="orange">
                            <ClockCircleFilled style={{ color: '#faad14' }} /> {diffDays} ngày Chờ gửi
                        </Tag>
                    );
                } else if (diffHours >= 1) {
                    return (
                        <Tag color="orange">
                            <ClockCircleFilled style={{ color: '#faad14' }} /> {diffHours} giờ Chờ gửi
                        </Tag>
                    );
                } else if (diffMinutes >= 1) {
                    return (
                        <Tag color="orange">
                            <ClockCircleFilled style={{ color: '#faad14' }} /> {diffMinutes} phút Chờ gửi
                        </Tag>
                    );
                } else if (diffSeconds > 0) {
                     return (
                        <Tag color="orange">
                            <ClockCircleFilled style={{ color: '#faad14' }} /> {diffSeconds} giây Chờ gửi
                        </Tag>
                    );
                } else {
                    return <Tag color="default"><ClockCircleFilled style={{ color: '#bfbfbf' }} /> Đang xử lý...</Tag>;
                }
            }
        },
        { title: 'Thời gian tạo', dataIndex: 'createdAt', key: 'createdAt', render: (t: string) => <Tag icon={<ClockCircleOutlined />}>{dayjs(t).format('YYYY-MM-DD HH:mm')}</Tag> },
        {
            title: 'Broadcast', dataIndex: 'isBroadcast', key: 'isBroadcast',
            render: (isBroadcast: boolean) => <Tag color={isBroadcast ? 'blue' : 'default'}>{isBroadcast ? 'Broadcast' : 'Cá nhân'}</Tag>
        },
        {
            title: 'Trạng thái đọc', dataIndex: 'isRead', key: 'isRead',
            render: (isRead: boolean) => <Tag color={isRead ? 'success' : 'warning'}>{isRead ? 'Đã đọc' : 'Chưa đọc'}</Tag>
        },
        // {
        //     title: 'Thao tác', key: 'action', width: 100, render: (_: any, record: ApiNotification) => (
        //         <Space>
        //             {!record.isRead && (
        //                 <Tooltip title="Đánh dấu đã đọc">
        //                     <Button icon={<BellOutlined />} onClick={() => handleMarkApiNotificationAsRead(record._id)} />
        //                 </Tooltip>
        //             )}
        //         </Space>
        //     )
        // }
    ];

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
        <Card className="p-4 rounded-lg shadow-lg">
            <Tabs
                defaultActiveKey="user"
                onChange={setActiveTab}
                size="large"
                tabBarExtraContent={
                    (activeTab === 'user' || activeTab === 'admin') && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
                            {activeTab === 'user' ? 'Tạo thông báo mới' : 'Tạo nhắc nhở mới'}
                        </Button>
                    )
                }
            >
                {/* <Tabs.TabPane tab={<Space><UserOutlined />Thông báo cho User</Space>} key="user">
                    <Table
                        columns={userColumns}
                        dataSource={userNotifications}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        loading={loading}
                        className="rounded-lg overflow-hidden"
                        components={{
                            header: { cell: (props: any) => <th {...props} className="bg-blue-50 text-blue-800 font-semibold" /> },
                        }}
                        locale={{ emptyText: 'Không có thông báo nào cho người dùng. Vui lòng tạo mới.' }}
                    />
                </Tabs.TabPane>

                <Tabs.TabPane tab={<Space><BellOutlined />Nhắc nhở cho Admin</Space>} key="admin">
                    <Table
                        columns={adminColumns}
                        dataSource={adminReminders}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        loading={loading}
                        className="rounded-lg overflow-hidden"
                        components={{
                            header: { cell: (props: any) => <th {...props} className="bg-blue-50 text-blue-800 font-semibold" /> },
                        }}
                        locale={{ emptyText: 'Không có nhắc nhở nào cho quản trị viên. Vui lòng tạo mới.' }}
                    />
                </Tabs.TabPane> */}

                <Tabs.TabPane tab={<Space><SendOutlined />Gửi Thông Báo</Space>} key="send">
                    <Card title="Gửi Thông Báo Mới" className="rounded-lg shadow-md">
                        <Form form={sendForm} layout="vertical" name="send_notification_form">
                            <Form.Item
                                name="title"
                                label="Tiêu đề"
                                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                            >
                                <Input placeholder="Tiêu đề thông báo" />
                            </Form.Item>
                            <Form.Item
                                name="message"
                                label="Nội dung"
                                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                            >
                                <Input.TextArea rows={4} placeholder="Nội dung chi tiết của thông báo..." />
                            </Form.Item>
                            <Form.Item name="type" label="Loại thông báo">
                                <Select placeholder="Chọn loại thông báo">
                                    <Option value="order">Đơn hàng</Option>
                                    <Option value="promo">Khuyến mãi</Option>
                                    <Option value="system">Hệ thống</Option>
                                    <Option value="general">Chung</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="scheduled_time" label="Thời gian lên lịch (tùy chọn)">
                                <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder="Chọn ngày và giờ gửi" />
                            </Form.Item>
                            <Form.Item
                                name="image"
                                label="Ảnh đính kèm (chỉ cho Broadcast)"
                                valuePropName="fileList"
                                getValueFromEvent={(e) => {
                                    if (Array.isArray(e)) {
                                        return e;
                                    }
                                    return e && e.fileList;
                                }}
                            >
                                <Upload
                                    maxCount={1}
                                    beforeUpload={() => false}
                                    listType="picture"
                                >
                                    <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                                </Upload>
                            </Form.Item>
                            <Row gutter={16}>
                                <Col>
                                    <Button
                                        type="primary"
                                        icon={<SendOutlined />}
                                        onClick={handleSendBroadcast}
                                        loading={sendLoading}
                                        className="bg-green-500 hover:bg-green-600 rounded-md"
                                    >
                                        Gửi Broadcast (có ảnh)
                                    </Button>
                                </Col>
                                <Col>
                                    <Button
                                        icon={<SendOutlined />}
                                        onClick={handleSendToAllUsers}
                                        loading={sendLoading}
                                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                                    >
                                        Gửi cho tất cả User (không ảnh)
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Tabs.TabPane>

                <Tabs.TabPane tab={<Space><HistoryOutlined />Lịch sử thông báo</Space>} key="history">
                    <Table
                        columns={apiNotificationColumns}
                        dataSource={apiNotifications}
                        rowKey="_id"
                        loading={apiLoading}
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total: apiNotificationsTotal,
                            onChange: (p) => setPage(p),
                            showSizeChanger: false,
                        }}
                        className="rounded-lg overflow-hidden"
                        components={{
                            header: { cell: (props: any) => <th {...props} className="bg-blue-50 text-blue-800 font-semibold" /> },
                        }}
                        locale={{ emptyText: 'Không có lịch sử thông báo nào.' }}
                    />
                </Tabs.TabPane>
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
                centered
                className="rounded-lg"
            >
                <Form form={form} layout="vertical" name="notification_form">
                    {renderModalContent()}
                </Form>
            </Modal>
        </Card>
    );
};

const NotificationsPage = () => (
    <App>
        <NotificationManagement />
    </App>
);

export default NotificationsPage;
