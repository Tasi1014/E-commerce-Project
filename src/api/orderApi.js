import axiosInstance from './axiosInstance';

export const createOrder = (orderData) => axiosInstance.post('/orders', orderData);
export const fetchUserOrders = () => axiosInstance.get('/orders');
export const fetchOrderById = (orderId) => axiosInstance.get(`/orders/${orderId}`);