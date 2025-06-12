import axiosClient from './axiosClient';

export const createProduct = (data: any) => {
  const result = axiosClient.post('/products/create-test', data);
  console.log('vvv', result);
  
  return result
}; 