import axiosClient from './axiosClient';
import type { Blog } from '../types';

export const blogApi = {
  // Lấy danh sách blogs
  getBlogs: () => {
    return axiosClient.get('/blogs');
  },

  // Lấy blog theo ID
  getBlogById: (id: string) => {
    return axiosClient.get(`/blogs/${id}`);
  },

  // Tạo blog mới
  createBlog: (data: Blog) => {
    return axiosClient.post('/blogs', data);
  },

  // Cập nhật blog
  updateBlog: (id: string, data: Blog) => {
    return axiosClient.put(`/blogs/${id}`, data);
  },

  // Xóa blog
  deleteBlog: (id: string) => {
    return axiosClient.delete(`/blogs/${id}`);
  },

  // Cập nhật trạng thái blog
  updateBlogStatus: (id: string, status: 'draft' | 'published') => {
    return axiosClient.patch(`/blogs/${id}/status`, { status });
  }
};
