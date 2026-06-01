import axiosInstance from './axiosInstance';

export const fetchProducts = (params) => {
  return axiosInstance.get('/products', { params });
};

export const fetchProductById = (id) => {
  return axiosInstance.get(`/products/${id}`);
};

export const searchProducts = (params) => {
  return axiosInstance.get('/products/search', { params });
};