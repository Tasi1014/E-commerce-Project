import axiosInstance from './axiosInstance';

export const createStripeCheckoutSession = (items) => {
  return axiosInstance.post('/payment/create-checkout-session', { items });
};

export const verifyStripePaymentAndCreateOrder = (sessionId, shippingAddress, notes) => {
  return axiosInstance.post('/payment/verify-stripe-payment', { session_id: sessionId, shippingAddress, notes });
};