import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { createOrder, getUserOrders, getOrderById } from '../Controller/OrderController.js';

const orderRouter = Router();

orderRouter.use(authenticateToken); // all order routes require login

orderRouter.post('/', createOrder);
orderRouter.get('/', getUserOrders);
orderRouter.get('/:orderId', getOrderById);

export default orderRouter;