import React, { useEffect } from 'react';
import { Card, Typography, Button, Spin, message, Tag, Space } from 'antd';
import { ArrowLeftOutlined, EditOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import { fetchBlogById, clearError } from '../features/blog/blogSlice';

const { Title, Paragraph } = Typography;

const BlogDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentBlog, loading, error } = useSelector((state: RootState) => state.blog);

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

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
        <Title level={3} style={{ margin: 0, flex: 1 }}>Chi tiết bài viết</Title>
        {currentBlog && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/blogs/edit/${currentBlog._id}`)}
          >
            Chỉnh sửa
          </Button>
        )}
      </div>

      <Spin spinning={loading}>
        {currentBlog && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <Title level={2}>{currentBlog.title}</Title>
              
              <Space style={{ marginBottom: 16 }}>
                <Tag color={currentBlog.status === 'published' ? 'green' : 'orange'}>
                  {currentBlog.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                </Tag>
                {currentBlog.author && (
                  <span style={{ color: '#666' }}>
                    <UserOutlined style={{ marginRight: 4 }} />
                    {currentBlog.author}
                  </span>
                )}
                {currentBlog.createdAt && (
                  <span style={{ color: '#666' }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {new Date(currentBlog.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </Space>

              {currentBlog.summary && (
                <Paragraph style={{ fontSize: '16px', color: '#666', fontStyle: 'italic' }}>
                  {currentBlog.summary}
                </Paragraph>
              )}
            </div>

            <div style={{ 
              border: '1px solid #f0f0f0', 
              borderRadius: '8px', 
              padding: '24px',
              backgroundColor: '#fafafa'
            }}>
              <div 
                dangerouslySetInnerHTML={{ __html: currentBlog.content }}
                style={{
                  lineHeight: '1.6',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>
        )}
      </Spin>
    </Card>
  );
};

export default BlogDetail;
