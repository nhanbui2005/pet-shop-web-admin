import React, { useEffect, useState } from 'react';
import { Card, Typography, Table, Spin, message, Avatar, Space } from 'antd';
import { getSupportConversations } from '../api/notification.api';
import { UserOutlined, PictureOutlined } from '@ant-design/icons';
import useSocket from '../hooks/useSocket';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import useCurrentUser from '../hooks/useCurrentUser';

const { Title, Paragraph } = Typography;

const ADMIN_JOIN_PREVIEW_CONVERSATION_EVENT = 'admin_join_preview_conversation';
const CONVERSATION_TRIGGER_EVENT = 'conversation_trigger';
const AUTHORIZED_EVENT = 'authorized';
const Support: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const token = useSelector((state: RootState) => state.auth.token);
  const socket = useSocket(token);
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  // Lưu trữ tin nhắn đã đọc trong localStorage
  const getReadMessages = () => {
    try {
      const stored = localStorage.getItem('readMessages');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const markAsRead = (conversationId: string, messageId: string) => {
    try {
      console.log('🔍 markAsRead called:', { conversationId, messageId });
      
      const readMessages = getReadMessages();
      readMessages[conversationId] = messageId;
      localStorage.setItem('readMessages', JSON.stringify(readMessages));
      console.log('💾 Saved readMessages:', readMessages);
    } catch (error) {
      console.error('❌ Error saving read message:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getSupportConversations();
        setConversations(res.data || []);
      } catch (err) {
        message.error('Không thể tải danh sách hỗ trợ');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit(ADMIN_JOIN_PREVIEW_CONVERSATION_EVENT);
    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
    });

    socket.on(AUTHORIZED_EVENT, (msg) => {
        console.error('🚫 Unauthorized:', msg);
    });

    socket.on('disconnect', (reason) => {
        console.warn('⚠️ Socket disconnected:', reason);
    });
    const handler = (conversation: any) => {
      setConversations(prev => {
        const idx = prev.findIndex((c: any) => c._id === conversation._id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...conversation };
          return updated;
        } else {
          return [conversation, ...prev];
        }
      });
    };
    socket.on(CONVERSATION_TRIGGER_EVENT, handler);
    return () => {
      socket.off(CONVERSATION_TRIGGER_EVENT, handler);
    };
  }, [socket]);

  const dataSource = conversations
    .filter(item => item.lastMessage)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((item: any) => {
      const user = item.participants && item.participants[0];
      return {
        key: item._id,
        _id: item._id,
        avatar: user?.avatar,
        name: user?.name || 'unknown',
        role: user?.role || 'unknown',
        lastMessage: item.lastMessage,
        updatedAt: item.updatedAt,
        participants: item.participants,
        raw: item,
      };
    });

  const columns = [
    {
      title: '',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar: string) => (
        <Avatar src={avatar} icon={!avatar ? <UserOutlined /> : undefined} />
      ),
      width: 48,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <span><b>{name}</b> <span style={{ color: '#888' }}>({record.role})</span></span>
      ),
    },
    {
      title: 'Nội dung cuối',
      dataIndex: 'lastMessage',
      key: 'lastMessage',
      render: (lastMessage: any, record: any) => {
        if (!lastMessage) return <span>Chưa có tin nhắn</span>;
        if (lastMessage.images && lastMessage.images.length > 0) {
          const sender = record.participants.find((p: any) => p._id === lastMessage.sender);
          return <span><PictureOutlined style={{ color: '#1677ff', marginRight: 4 }} /><b>{sender?.name || 'unknown'}</b> đã gửi ảnh</span>;
        }
        return <span>{lastMessage.content}</span>;
      },
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt: string) => new Date(updatedAt).toLocaleString('vi-VN'),
      width: 160,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: any) => {
        const myId = currentUser?._id ? String(currentUser._id) : '';
        const readMessages = getReadMessages();
        const lastReadMessageId = readMessages[record._id];
        
        if (!currentUser || !record.lastMessage) return null;
        
        // Nếu tin nhắn cuối cùng là của mình
        if (record.lastMessage.sender === myId) {
          return <span style={{ color: '#52c41a', fontWeight: 600 }}>Đã phản hồi</span>;
        }
        
        // Nếu tin nhắn cuối cùng là của người khác
        const isUnread = record.lastMessage._id !== lastReadMessageId;
        
        console.log('🎯 Status check for:', record._id, {
          sender: record.lastMessage?.sender,
          myId,
          lastReadMessageId,
          currentMessageId: record.lastMessage?._id,
          isUnread
        });
        
        if (isUnread) {
          return <span style={{ color: '#ff4d4f', fontWeight: 600 }}>Tin nhắn mới</span>;
        } else {
          return <span style={{ color: '#8c8c8c', fontWeight: 600 }}>Đã xem</span>;
        }
      },
      width: 120,
    },
  ];

  return (
    <Card style={{ margin: 24 }}>
      <Title level={3}>Hỗ trợ khách hàng</Title>
      {/* <Paragraph>Danh sách hội thoại cần hỗ trợ:</Paragraph> */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          rowClassName={() => 'clickable-row'}
          onRow={record => ({
            onClick: () => {
              console.log('🖱️ Clicked on conversation:', record._id);
              // Đánh dấu tin nhắn đã đọc khi click vào conversation
              if (record.lastMessage) {
                console.log('📨 Marking as read:', record.lastMessage._id);
                markAsRead(record._id, record.lastMessage._id);
              }
              navigate(`/support/${record._id}`);
            },
            style: { cursor: 'pointer' },
          })}
        />
      </Spin>
    </Card>
  );
};

export default Support; 