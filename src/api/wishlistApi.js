import axiosInstance from './axiosInstance';

export const fetchWishlist = () => axiosInstance.get('/wishlist');
export const addToWishlistApi = (productId) => axiosInstance.post('/wishlist/add', { productId });
export const removeFromWishlistApi = (productId) => axiosInstance.delete(`/wishlist/remove/${productId}`);