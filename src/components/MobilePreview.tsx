import React from 'react';
import { Card, Typography } from 'antd';
import { MobileOutlined } from '@ant-design/icons';
import type { Blog } from '../types';

const { Title } = Typography;

interface MobilePreviewProps {
  blog: Partial<Blog>;
  isEditing?: boolean;
}

const MobilePreview: React.FC<MobilePreviewProps> = ({ blog, isEditing = false }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có ngày';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // HTML template với CSS styling giống mobile
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f8f9fa;
          color: #333;
          line-height: 1.6;
        }
        .blog-container {
          max-width: 100%;
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .blog-title {
          font-size: 24px;
          font-weight: bold;
          color: #222B45;
          margin-bottom: 16px;
          line-height: 1.3;
        }
        .blog-meta {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e0e0e0;
        }
        .author {
          font-size: 14px;
          color: #666;
          margin-right: 16px;
        }
        .date {
          font-size: 14px;
          color: #999;
        }
        .blog-content {
          font-size: 16px;
          line-height: 1.8;
          color: #333;
        }
        .blog-content p {
          margin-bottom: 16px;
        }
        .blog-content h1, .blog-content h2, .blog-content h3 {
          color: #222B45;
          margin-top: 24px;
          margin-bottom: 16px;
        }
        .blog-content h1 { font-size: 20px; }
        .blog-content h2 { font-size: 18px; }
        .blog-content h3 { font-size: 16px; }
        .blog-content ul, .blog-content ol {
          margin-bottom: 16px;
          padding-left: 20px;
        }
        .blog-content li {
          margin-bottom: 8px;
        }
        .blog-content blockquote {
          border-left: 4px solid #FFAF42;
          padding-left: 16px;
          margin: 20px 0;
          font-style: italic;
          color: #666;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
        .blog-content a {
          color: #FFAF42;
          text-decoration: none;
        }
        .blog-content a:hover {
          text-decoration: underline;
        }
        .placeholder {
          color: #999;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="blog-container">
        <h1 class="blog-title">${blog.title || '<span class="placeholder">Tiêu đề bài viết</span>'}</h1>
        <div class="blog-meta">
          <span class="author">Tác giả: ${blog.author || '<span class="placeholder">Chưa có tác giả</span>'}</span>
          <span class="date">${blog.createdAt ? formatDate(blog.createdAt) : '<span class="placeholder">Chưa có ngày</span>'}</span>
        </div>
        <div class="blog-content">
          ${blog.content || '<p class="placeholder">Nội dung bài viết sẽ hiển thị ở đây...</p>'}
        </div>
      </div>
    </body>
    </html>
  `;

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MobileOutlined style={{ color: '#1890ff' }} />
          <span>Preview trên điện thoại</span>
        
        </div>
      }
      style={{ 
        width: 375, 
        height: 667, 
        margin: '0 auto',
        border: '2px solid #e0e0e0',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
      styles={{
        body: {
        padding: 0, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column' 
      }}}
    >
      {/* Mobile frame */}
      <div style={{ 
        position: 'relative',
        height: '100%',
        backgroundColor: '#f8f9fa'
      }}>
        {/* Status bar */}
        <div style={{
          height: '24px',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          color: 'white',
          fontSize: '12px'
        }}>
          <span>6:36</span>
          {/* <div style={{ display: 'flex', gap: '4px' }}>
            <span>📶</span>
            <span>📶</span>
            <span>🔋</span>
          </div> */}
        </div>

        {/* Header */}
        <div style={{
          height: '56px',
          backgroundColor: '#1890ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          color: 'white'
        }}>
          <div style={{ width: '24px' }}></div>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Bài viết</span>
          <div style={{ width: '24px' }}>⋮</div>
        </div>

        {/* Content */}
        <div style={{ 
          flex: 1, 
          height: 'calc(100% - 80px)',
          overflow: 'hidden'
        }}>
          <iframe
            srcDoc={htmlContent}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '0 0 18px 18px'
            }}
            title="Mobile Preview"
          />
        </div>
      </div>
    </Card>
  );
};

export default MobilePreview;
