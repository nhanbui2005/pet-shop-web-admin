import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, Row, Col, Divider } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { Blog } from '../types';
import MobilePreview from './MobilePreview';
import TinyMCEEditor from './TinyMCEEditor';

const { Option } = Select;
const { TextArea } = Input;

interface BlogFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Blog) => void;
  blog?: Blog | null;
  loading?: boolean;
}

const BlogFormModal: React.FC<BlogFormModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  blog,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [previewBlog, setPreviewBlog] = useState<Partial<Blog>>({});
  const [content, setContent] = useState('');

  const isEditing = !!blog;

  useEffect(() => {
    if (visible && blog) {
      form.setFieldsValue({
        title: blog.title,
        summary: blog.summary,
        author: blog.author,
        status: blog.status,
      });
      setContent(blog.content || '');
      setPreviewBlog(blog);
    } else if (visible) {
      form.resetFields();
      setContent('');
      setPreviewBlog({});
    }
  }, [visible, blog, form]);

  const handleFormChange = (changedValues: any, allValues: any) => {
    setPreviewBlog({
      ...previewBlog,
      ...allValues,
      content,
    });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setPreviewBlog({
      ...previewBlog,
      content: newContent,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const blogData: Blog = {
        ...values,
        content,
      };
      onSubmit(blogData);
    } catch (error) {
      message.error('Vui lòng kiểm tra lại thông tin');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setContent('');
    setPreviewBlog({});
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isEditing ? <EditOutlined /> : <PlusOutlined />}
          <span>{isEditing ? 'Sửa bài viết' : 'Tạo bài viết mới'}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      styles={{
        body: { padding: '24px', maxHeight: '80vh', overflow: 'auto' }
      }}
    >
      <Row gutter={24}>
        {/* Form Section */}
        <Col span={12}>
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleFormChange}
            initialValues={{
              status: 'draft',
            }}
          >
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài viết' }]}
            >
              <Input
                placeholder="Nhập tiêu đề bài viết"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="summary"
              label="Tóm tắt"
            >
              <TextArea
                placeholder="Nhập tóm tắt bài viết (không bắt buộc)"
                rows={3}
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Form.Item
              name="author"
              label="Tác giả"
              rules={[{ required: true, message: 'Vui lòng nhập tác giả' }]}
            >
              <Input
                placeholder="Nhập tên tác giả"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select size="large">
                <Option value="draft">Bản nháp</Option>
                <Option value="published">Đã xuất bản</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Nội dung"
              required
            >
              <TinyMCEEditor
                value={content}
                onChange={handleContentChange}
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button onClick={handleCancel} size="large">
                  Hủy
                </Button>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  size="large"
                  icon={isEditing ? <EditOutlined /> : <PlusOutlined />}
                >
                  {isEditing ? 'Cập nhật' : 'Tạo bài viết'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Col>

        {/* Preview Section */}
        <Col span={12}>
          <div style={{ position: 'sticky', top: 0 }}>
            {/* <Divider orientation="left">Xem trước trên điện thoại</Divider> */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <MobilePreview
                blog={previewBlog}
                isEditing={true}
              />
            </div>
            {/* <div style={{ 
              textAlign: 'center', 
              marginTop: 16, 
              color: '#666',
              fontSize: '12px'
            }}>
              Preview sẽ cập nhật realtime khi bạn thay đổi nội dung
            </div> */}
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default BlogFormModal;
