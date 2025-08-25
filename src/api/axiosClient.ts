import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://pet-shop-api-server.onrender.com/',
  // baseURL: 'http://localhost:3000',
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken'); 
      }
      return Promise.reject(error.response.data);
      
    }
    return Promise.reject({ message: 'Network error' });
  }
);

export const getCurrentUser = async () => {
  return axiosClient.get('/users/me');
};

export default axiosClient; 