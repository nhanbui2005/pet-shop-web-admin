import axiosClient from './axiosClient';

export const voucherApi = {
  getAdminList: (page = 1, limit = 10) =>
    axiosClient.get(`/voucher/admin-list?page=${page}&limit=${limit}`),
  create: (data: any) => axiosClient.post('/voucher/create', data),
  update: (id: string, data: any) => axiosClient.patch(`/voucher/${id}`, data),
  deactivate: (id: string) => axiosClient.patch(`/voucher/deactivate/${id}`),
  activate: (id: string) => axiosClient.patch(`/voucher/activate/${id}`),
}; 