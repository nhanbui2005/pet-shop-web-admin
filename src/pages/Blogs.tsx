import React, { useEffect, useState } from 'react';
import { Card, Typography, Table, Spin, message, Button, Space, Tag, Modal, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import { fetchBlogs, deleteBlog, clearError, createBlog, updateBlog } from '../features/blog/blogSlice';
import type { Blog } from '../types';
import BlogFormModal from '../components/BlogFormModal';

const { Title } = Typography;

const Blogs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { blogs, loading, error } = useSelector((state: RootState) => state.blog);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteBlog(id)).unwrap();
      message.success('Xóa bài viết thành công');
    } catch (error) {
      message.error('Lỗi khi xóa bài viết');
    }
  };

  const handleCreateBlog = () => {
    setEditingBlog(null);
    setIsModalVisible(true);
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingBlog(null);
  };

  const handleModalSubmit = async (values: Blog) => {
    try {
      setFormLoading(true);
      if (editingBlog) {
        await dispatch(updateBlog({ id: editingBlog._id!, data: values })).unwrap();
        message.success('Cập nhật bài viết thành công');
      } else {
        await dispatch(createBlog(values)).unwrap();
        message.success('Tạo bài viết thành công');
      }
      setIsModalVisible(false);
      setEditingBlog(null);
    } catch (error) {
      message.error(editingBlog ? 'Lỗi khi cập nhật bài viết' : 'Lỗi khi tạo bài viết');
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <span style={{ fontWeight: 600, fontSize: '14px' }}>{title}</span>
      ),
    },
    {
      title: 'Tóm tắt',
      dataIndex: 'summary',
      key: 'summary',
      render: (summary: string) => (
        <span style={{ color: '#666' }}>
          {summary ? (summary.length > 100 ? `${summary.substring(0, 100)}...` : summary) : 'Chưa có tóm tắt'}
        </span>
      ),
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
      render: (author: string) => (
        <span style={{ color: '#1677ff' }}>{author || 'Chưa có tác giả'}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => (
        <span>{new Date(createdAt).toLocaleDateString('vi-VN')}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Blog) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/blogs/${record._id || ''}`)}
          >
            Xem
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditBlog(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài viết này?"
            onConfirm={() => handleDelete(record._id || '')}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dataSource = React.useMemo(() => {
    try {
      return blogs.map((blog) => ({
        key: blog._id || '',
        ...blog,
      }));
    } catch (error) {
      console.error('Error creating dataSource:', error);
      return [];
    }
  }, [blogs]);



  return (
    <Card style={{ margin: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>Quản lý bài viết</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateBlog}
        >
          Tạo bài viết mới
        </Button>
      </div>
      
      <Spin spinning={loading}>
        {blogs.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Chưa có bài viết nào</p>
            <Button 
              type="primary" 
              onClick={handleCreateBlog}
              style={{ marginTop: '16px' }}
            >
              Tạo bài viết đầu tiên
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài viết`,
            }}
            locale={{
              emptyText: loading ? 'Đang tải...' : 'Chưa có bài viết nào',
            }}
          />
        )}
      </Spin>

      <BlogFormModal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        loading={formLoading}
        blog={editingBlog}
      />
    </Card>
  );
};

export default Blogs;
