import axiosClient from './axiosClient';

// Gửi broadcast (có thể kèm ảnh)
export const adminBroadcast = (data: FormData) =>
  axiosClient.post('/notification/broadcast', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Gửi notification cho tất cả user (không ảnh)
export const adminSendToAll = (payload: any) =>
  axiosClient.post('/notification/admin-send-to-all', payload);

// Lấy danh sách notification (có phân trang)
export const getNotifications = (params: { page?: string; limit?: string }) =>
  axiosClient.get('/notification/admin', { params });

// Đánh dấu đã đọc
export const markAsRead = (notificationIds: string[]) =>
  axiosClient.post('/notification/read', { notificationIds });

// Lấy danh sách hội thoại cần hỗ trợ cho admin
export const getSupportConversations = async () => {
  return await axiosClient.get('/message/conversations-shop-for-admin');
};

// Lấy tin nhắn cũ của hội thoại
export const getOlderMessages = async (conversationId: string, limit = 20, before?: string) => {
  return await axiosClient.get(`/message/older-messages/${conversationId}`, {
    params: { limit, before },
  });
};

// Lấy thông tin đơn hàng theo orderId
export const fetchOrderById = (orderId: string) => {
  return axiosClient.get(`/order/order-suggest-by-id/${orderId}`);
}; 