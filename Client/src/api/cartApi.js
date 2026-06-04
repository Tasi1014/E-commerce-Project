import axiosInstance from './axiosInstance';

export const fetchCart = () => axiosInstance.get('/cart');
export const addToCartApi = (productId, quantity = 1) => axiosInstance.post('/cart/add', { productId, quantity });
export const updateCartItemApi = (itemId, quantity) => axiosInstance.put('/cart/update', { itemId, quantity });
export const removeCartItemApi = (itemId) => axiosInstance.delete(`/cart/remove/${itemId}`);