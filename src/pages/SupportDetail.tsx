import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Avatar, Typography, Spin, message as antdMessage, Space, Button, List, Input, Image } from 'antd';
import { getSupportConversations, getOlderMessages, fetchOrderById } from '../api/notification.api';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useSocket from '../hooks/useSocket';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const { Title } = Typography;

function processMessages(messages: any[], userId: string) {
  const result: any[] = [];
  let lastDate = '';
  let lastTime: any = null;
  const now = dayjs();
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const msgDate = dayjs(msg.createdAt).format('YYYY-MM-DD');
    if (msgDate !== lastDate) {
      if (dayjs(msg.createdAt).isSame(now, 'day')) {
        result.push({ type: 'date', label: 'Hôm nay', id: `date-${msgDate}-${i}` });
      } else if (dayjs(msg.createdAt).isSame(now.subtract(1, 'day'), 'day')) {
        result.push({ type: 'date', label: 'Hôm qua', id: `date-${msgDate}-${i}` });
      } else {
        result.push({ type: 'date', label: dayjs(msg.createdAt).format('DD/MM/YYYY'), id: `date-${msgDate}-${i}` });
      }
      lastDate = msgDate;
      lastTime = null;
    }
    if (lastTime) {
      const diff = Math.abs(dayjs(lastTime).diff(msg.createdAt, 'minute'));
      if (diff >= 1) {
        let label = '';
        if (dayjs(lastTime).isSame(now, 'day')) {
          label = `Hôm nay ${dayjs(lastTime).format('HH:mm')}`;
        } else if (dayjs(lastTime).isSame(now.subtract(1, 'day'), 'day')) {
          label = `Hôm qua ${dayjs(lastTime).format('HH:mm')}`;
        } else {
          label = `${dayjs(lastTime).format('DD/MM/YYYY HH:mm')}`;
        }
        result.push({ type: 'time', label, id: `time-${msg._id}` });
      }
    }
    result.push({ type: 'message', ...msg });
    lastTime = msg.createdAt;
  }
  return result.reverse();
}

const SEND_MESSAGE_EVENT = 'send_message';
const JOIN_CONVERSATION_EVENT = 'join_conversation';
const RECEIVE_MESSAGE_EVENT = 'receive_message';

// Thêm component hiển thị thông tin đơn hàng
const OrderInfo: React.FC<{ orderId: string }> = ({ orderId }) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    fetchOrderById(orderId)
      .then(res => {
        setOrder(res.data)
        console.log(res.data);
        
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  }, [orderId]);
  if (loading) return <Spin size="small" />;
  if (!order) return <div style={{ color: 'red' }}>Không tìm thấy đơn hàng</div>;
  return (
    <Card size="small" style={{ marginTop: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
      <div><b>Mã đơn:</b> {order._id}</div>
      {/* <div><b>Trạng thái:</b> {order.status}</div> */}
      <div><b>Tổng tiền:</b> {order.totalPrice?.toLocaleString('vi-VN')} VNĐ</div>
      <div><b>Người nhận:</b> {order.shippingAddress?.receiverFullname}</div>
      <div><b>Địa chỉ:</b> {order.shippingAddress?.streetAndNumber}, {order.shippingAddress?.ward}, {order.shippingAddress?.district}, {order.shippingAddress?.province}</div>
    </Card>
  );
};

const SupportDetail: React.FC = () => {
  const { conversationId } = useParams();
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const listRef = useRef<any>(null);
  const user = conversation?.participants && conversation.participants[0];
  const [inputValue, setInputValue] = useState('');
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

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Join room khi vào chat
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

  const handleLoadMore = () => {
    if (messages.length > 0) {
      loadMessages(conversationId!, messages[0].createdAt);
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

  const processed = messages; // Không đảo mảng, render bình thường
  console.log('Danh sách tin nhắn:', processed);

  return (
    <Card style={{ margin: 24, width:'97%', height: '80vh' }}>
      <Space align="center" style={{ marginBottom: 16 }}>
        <Avatar size={64} src={user?.avatar || undefined} icon={!user?.avatar ? <UserOutlined /> : undefined} />
        <Title level={3} style={{ margin: 0 }}>{user?.name || 'unknown'}</Title>
      </Space>
      <div style={{
        display: 'flex', flexDirection: 'column-reverse',
        maxHeight: 400, overflowY: 'auto', background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 16
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
                  {/* Nếu có orderId thì render thông tin đơn hàng */}
                  {item.orderId && <OrderInfo orderId={item.orderId} />}
                  <div style={{ fontSize: 11, color: '#aaa', textAlign: 'right' }}>
                    {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
      <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
        <Input.TextArea
          placeholder="Nhập tin nhắn..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onPressEnter={e => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          autoSize={{ minRows: 1, maxRows: 6 }}
          style={{ flex: 1, resize: 'vertical' }}
        />
        <Button type="primary" onClick={handleSend} disabled={!inputValue.trim()}>Gửi</Button>
      </div>
    </Card>
  );
};

export default SupportDetail; 