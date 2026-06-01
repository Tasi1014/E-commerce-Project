import { Router } from 'express';
import authRouter from './auth-router.js';
import productRouter from './product-routes.js';
const router = Router();

router.use('/auth', authRouter);
router.use('/products', productRouter);

// Add more routers later (products, orders, etc.)

export default router;