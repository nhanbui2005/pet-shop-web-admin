import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import { fetchBlogById, updateBlog, clearError } from '../features/blog/blogSlice';
import type { Blog } from '../types';
import BlogFormModal from '../components/BlogFormModal';

const { Title } = Typography;

const BlogEdit: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentBlog, loading, error } = useSelector((state: RootState) => state.blog);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentBlog && !loading) {
      setIsModalVisible(true);
    }
  }, [currentBlog, loading]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleModalCancel = () => {
    setIsModalVisible(false);
    navigate('/blogs');
  };

  const handleModalSubmit = async (values: Blog) => {
    if (!id) return;

    try {
      setFormLoading(true);
      await dispatch(updateBlog({ id, data: values })).unwrap();
      message.success('Cập nhật bài viết thành công!');
      navigate('/blogs');
    } catch (error) {
      message.error('Lỗi khi cập nhật bài viết');
    } finally {
      setFormLoading(false);
    }
  };

  if (!currentBlog && !loading) {
    return (
      <Card style={{ margin: 24 }}>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Title level={4}>Không tìm thấy bài viết</Title>
          <Button onClick={() => navigate('/blogs')}>Quay lại danh sách</Button>
        </div>
      </Card>
    );
  }

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
        <Title level={3} style={{ margin: 0 }}>Chỉnh sửa bài viết</Title>
      </div>

      <Spin spinning={loading}>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Đang tải bài viết...</p>
        </div>
      </Spin>

      {currentBlog && (
        <BlogFormModal
          visible={isModalVisible}
          onCancel={handleModalCancel}
          onSubmit={handleModalSubmit}
          loading={formLoading}
          blog={currentBlog}
        />
      )}
    </Card>
  );
};

export default BlogEdit;
