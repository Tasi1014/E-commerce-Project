import { getOrderForAI } from '../OrderService.js';

export const trackOrder = async ({
  order_number,
  userId,
}) => {
  if (!order_number) {
    return {
      success: false,
      error: 'Order number is required',
    };
  }

  if (!userId) {
    return {
      success: false,
      error: 'User authentication is required',
    };
  }

  const order = await getOrderForAI(order_number, userId);

  if (!order) {
    return {
      success: false,
      error: 'Order not found',
    };
  }

  return {
    success: true,
    order,
  };
};