import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Layout, Row, Col, Typography, Checkbox } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { setToken } from '../features/auth/authSlice';
// import logo from '../assets/logo.svg'; 

const { Title } = Typography;
const { Content } = Layout;

interface LoginFormData {
    username: string;
    password: string;
    remember: boolean;
}

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const onFinish = async (values: LoginFormData) => {
        setLoading(true);
        try {
            // API call logic remains the same
            const res = await axiosClient.post('/auth/login-phone-or-email', {
                phone: values.username,
                password: values.password,
                userAgent: navigator.userAgent,
            });

            if (res?.data?.accessToken) {
                const newAccessToken = res.data.accessToken;
                dispatch(setToken(newAccessToken));
                localStorage.setItem('accessToken', newAccessToken);
                message.success('Đăng nhập thành công!');
                navigate('/');
            } else {
                throw new Error('Phản hồi từ server không hợp lệ.');
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Đăng nhập thất bại!';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Row justify="center" align="middle" style={{ width: '100%' }}>
                    <Col xs={22} sm={16} md={12} lg={8} xl={6}>
                        <Card
                            bordered={false}
                            style={{
                                boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)',
                                borderRadius: '8px',
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <Title level={2}>Chào mừng trở lại</Title>
                                <Typography.Text type="secondary">Đăng nhập vào hệ thống quản trị</Typography.Text>
                            </div>

                            {/* --- THAY ĐỔI Ở ĐÂY --- */}
                            {/* Sử dụng initialValues để điền sẵn dữ liệu cho form */}
                            <Form
                                name="professional_login"
                                layout="vertical"
                                onFinish={onFinish}
                                initialValues={{
                                    remember: true,
                                    username: '0990090090', // Giá trị tên đăng nhập được điền sẵn
                                    password: '123',        // Giá trị mật khẩu được điền sẵn
                                }}
                                requiredMark={false}
                            >
                                <Form.Item
                                    name="username"
                                    label="Tên đăng nhập hoặc Email"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                                >
                                    <Input
                                        prefix={<UserOutlined />}
                                        placeholder="Nhập số điện thoại hoặc email"
                                        size="large"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    label="Mật khẩu"
                                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="Nhập mật khẩu"
                                        size="large"
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Form.Item name="remember" valuePropName="checked" noStyle>
                                        <Checkbox>Ghi nhớ tôi</Checkbox>
                                    </Form.Item>
                                    <a style={{ float: 'right' }} href="/forgot-password">
                                        Quên mật khẩu?
                                    </a>
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        block
                                        size="large"
                                    >
                                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                                    </Button>
                                </Form.Item>
                                
                                <div style={{ textAlign: 'center' }}>
                                    <Typography.Text type="secondary">Chưa có tài khoản?</Typography.Text>{' '}
                                    <a href="/register">Đăng ký ngay</a>
                                </div>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default LoginPage;