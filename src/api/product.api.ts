
import axiosClient from './axiosClient';

export const createProduct = (data: any) => {
  const result = axiosClient.post('/products/create-test', data);
  console.log('vvv', result);
  
  return result
};

export const getVariantsWithStockHistory = (productId: string) => {
  console.log(productId);
  
  return axiosClient.get(`/product-variant/by-product/${productId}/with-stock-history`);
};

export const increaseStock = (variantId: string, data: { quantity: number; note?: string; actionBy?: string }) => {
  return axiosClient.post(`/product-variant/increase-stock/${variantId}`, data);
};

export const decreaseStock = (variantId: string, data: { quantity: number; note?: string; actionBy?: string }) => {
  return axiosClient.post(`/product-variant/decrease-stock/${variantId}`, data);
}; 