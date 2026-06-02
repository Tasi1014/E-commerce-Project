import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { createCheckoutSession, verifyAndCreateOrder } from '../Controller/PaymentController.js';

const paymentRouter = Router();

paymentRouter.post('/create-checkout-session', authenticateToken, createCheckoutSession);
paymentRouter.post('/verify-stripe-payment', authenticateToken, verifyAndCreateOrder);

export default paymentRouter;