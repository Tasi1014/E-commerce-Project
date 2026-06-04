import { Router } from 'express';
import authRouter from './auth-router.js';
import productRouter from './product-router.js';
import cartRouter from './cart-router.js';
import wishlistRouter from './wishlist-router.js';
import orderRouter from './order-router.js';
import adminRouter from './admin-routes.js';
import paymentRouter from './payment-router.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/cart', cartRouter);
router.use('/wishlist', wishlistRouter);
router.use('/orders', orderRouter);
router.use('/admin', adminRouter);
router.use('/payment', paymentRouter);


export default router;