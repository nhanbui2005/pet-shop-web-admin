import React, { useState } from 'react';
import { Card, Typography, Button, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Blog } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { createBlog } from '../features/blog/blogSlice';
import BlogFormModal from '../components/BlogFormModal';

const { Title } = Typography;

const BlogCreate: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.blog);
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const handleModalCancel = () => {
    setIsModalVisible(false);
    navigate('/blogs');
  };

  const handleModalSubmit = async (values: Blog) => {
    try {
      setFormLoading(true);
      await dispatch(createBlog(values)).unwrap();
      message.success('Tạo bài viết thành công!');
      navigate('/blogs');
    } catch (error) {
      message.error('Lỗi khi tạo bài viết');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Card style={{ margin: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/blogs')}
          style={{ marginRight: 16 }}
        >
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>Tạo bài viết mới</Title>
      </div>

      <Spin spinning={loading}>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Đang mở form tạo bài viết...</p>
        </div>
      </Spin>

      <BlogFormModal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        loading={formLoading}
      />
    </Card>
  );
};

export default BlogCreate;
