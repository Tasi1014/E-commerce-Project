import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../Controller/CartController.js';

const cartRouter = Router();
cartRouter.use(authenticateToken); // all cart routes require login

cartRouter.get('/', getCart);
cartRouter.post('/add', addToCart);
cartRouter.put('/update', updateCartItem);
cartRouter.delete('/remove/:itemId', removeCartItem);

export default cartRouter;