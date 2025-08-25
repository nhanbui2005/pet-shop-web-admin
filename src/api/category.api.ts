import axiosClient from './axiosClient';

export enum CategoryType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  BLOG = 'BLOG'
}

export interface Category {
  _id: string;
  isRoot: boolean;
  name: string;
  parentId?: string;
  categoryType?: CategoryType;
  children?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryCreateDto {
  name: string;
  isRoot: boolean;
  parentId?: string;
  categoryType?: CategoryType;
}

export interface CategoryEditDto {
  _id: string;
  name: string;
}

export const createCategory = (data: CategoryCreateDto) => {
  return axiosClient.post('/category/create', data);
};

export const getAllCategories = () => {
  return axiosClient.get('/category/get-all');
};

export const updateCategory = (data: CategoryEditDto) => {
  return axiosClient.post('/category/update-name', data);
};

export const getCategoriesByType = (type: CategoryType) => {
  return axiosClient.get(`/category/get-categories?type=${type}`);
}; 

export const getChildCategories = (parentId: string) => {
  return axiosClient.get('/category/get-child-categories/'+parentId);
}; 