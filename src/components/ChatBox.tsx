import React, { useEffect, useState, useRef } from 'react';
import { Card, Avatar, Typography, Spin, message as antdMessage, Space, Button, List, Input, Image } from 'antd';
import { getSupportConversations, getOlderMessages } from '../api/notification.api';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useSocket from '../hooks/useSocket';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const { Title } = Typography;
const { TextArea } = Input;

const SEND_MESSAGE_EVENT = 'send_message';
const JOIN_CONVERSATION_EVENT = 'join_conversation';
const RECEIVE_MESSAGE_EVENT = 'receive_message';

interface ChatBoxProps {
  conversationId: string;
  onBack?: () => void;
  headerColor?: string;
  width?: number;
}

const ChatBox: React.FC<ChatBoxProps> = ({ conversationId, onBack, headerColor, width }) => {
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const listRef = useRef<any>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  const socket = useSocket(token);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getSupportConversations();
        const found = (res.data || []).find((c: any) => c._id === conversationId);
        setConversation(found);
        if (found) {
          await loadMessages(found._id);
        }
      } catch (err) {
        antdMessage.error('Không thể tải thông tin hội thoại');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [conversationId]);

  const loadMessages = async (convId: string, before?: string) => {
    setLoadingMore(true);
    try {
      const res = await getOlderMessages(convId, 20, before);
      const newMsgs = res.data || [];
      setMessages(prev => {
        const ids = new Set(prev.map((m: any) => m._id));
        const sorted = [...newMsgs].reverse();
        return [...sorted.filter((m: any) => !ids.has(m._id)), ...prev];
      });
      if (newMsgs.length < 20) setHasMore(false);
    } catch (err) {
      antdMessage.error('Không thể tải tin nhắn cũ');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit(JOIN_CONVERSATION_EVENT, { conversationId });
    // Lắng nghe tin nhắn mới
    const handler = (msg: any) => {
      setMessages(prev => {
        if (prev.some((m: any) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    socket.on(RECEIVE_MESSAGE_EVENT, handler);
    return () => {
      socket.off(RECEIVE_MESSAGE_EVENT, handler);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleLoadMore = () => {
    if (messages.length > 0) {
      loadMessages(conversationId, messages[0].createdAt);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() || !socket || !conversationId) return;
    const msg: any = {
      conversationId,
      content: inputValue,
      images: [],
    };
    socket.emit(SEND_MESSAGE_EVENT, msg);
    setInputValue('');
  };

  if (loading) return <Spin />;
  if (!conversation) return <div>Không tìm thấy hội thoại</div>;
  const user = conversation.participants && conversation.participants[0];
  const processed = messages;

  return (
    <Card style={{ margin: 0, width: width || '100%', boxShadow: 'none', border: 'none', background: 'transparent', height: 480, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} styles={{
        body: { padding: 0, height: '100%' }}}>
      <Space align="center" style={{ marginBottom: 0, padding: 16, background: headerColor || '#222', color: '#fff', borderTopLeftRadius: 8, borderTopRightRadius: 8, width: '100%' }}>
        {onBack && <Button type="text" onClick={onBack}>&lt;</Button>}
        <Avatar size={48} src={user?.avatar || undefined} icon={!user?.avatar ? <UserOutlined /> : undefined} />
        <Title level={5} style={{ margin: 0, color: '#fff' }}>{user?.name || 'unknown'}</Title>
      </Space>
      <div style={{
        display: 'flex', flexDirection: 'column-reverse',
        flex: 1,
        minHeight: 490,
        maxHeight: 490,
        overflowY: 'auto',
        background: '#fafafa',
        padding: 16,
        borderRadius: 8,
        marginBottom: 0
      }} ref={listRef}>
        <List
          dataSource={processed}
          renderItem={(item, idx) => {
            if (idx === 0 && hasMore) {
              return (
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <Button size="small" loading={loadingMore} onClick={handleLoadMore}>Tải thêm tin nhắn cũ</Button>
                </div>
              );
            }
            const isUser = item.sender === user?._id;
            return (
              <div style={{ display: 'flex', justifyContent: isUser ? 'flex-start' : 'flex-end', margin: '4px 0' }}>
                <div style={{
                  background: isUser ? '#fff' : '#e6f4ff',
                  border: '1px solid #eee',
                  borderRadius: 8,
                  padding: 8,
                  maxWidth: 320,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}>
                  {item.content}
                  {item.images && item.images.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {item.images.map((img: string, idx: number) => (
                        <Image
                          key={idx}
                          src={img}
                          alt={`img-${idx}`}
                          width={120}
                          style={{ marginRight: 8, borderRadius: 6 }}
                        />
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#aaa', textAlign: 'right' }}>
                    {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, padding: 12, background: '#fff', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, alignItems: 'flex-end' }}>
        <TextArea
          placeholder="Nhập tin nhắn..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
          style={{ flex: 1, resize: 'vertical', minHeight: 36, maxHeight: 120 }}
          autoSize={{ minRows: 1, maxRows: 5 }}
        />
        <Button type="primary" onClick={handleSend} disabled={!inputValue.trim()} style={{ minWidth: 64, alignSelf: 'flex-end' }}>
          Gửi
        </Button>
      </div>
    </Card>
  );
};

export default ChatBox; 