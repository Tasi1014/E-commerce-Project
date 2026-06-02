import { Router } from 'express';
import authRouter from './auth-router.js';
import productRouter from './product-routes.js';
import cartRouter from './cart-router.js';
import wishlistRouter from './wishlist-router.js';
import orderRouter from './order-routes.js';
import adminRouter from './admin-routes.js';
const router = Router();

router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/cart', cartRouter);
router.use('/wishlist', wishlistRouter);
router.use('/orders', orderRouter);
router.use('/admin', adminRouter);


export default router;