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
  axiosClient.get('/notification', { params });

// Đánh dấu đã đọc
export const markAsRead = (notificationIds: string[]) =>
  axiosClient.post('/notification/read', { notificationIds }); 