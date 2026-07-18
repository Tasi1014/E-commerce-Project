import { Router } from 'express';
import { authenticateToken } from '../middleware/AuthMiddleware.js';
import { getWishlist, addToWishlist, removeFromWishlist } from '../Controller/WishlistController.js';

const wishlistRouter = Router();
wishlistRouter.use(authenticateToken);

wishlistRouter.get('/', getWishlist);
wishlistRouter.post('/add', addToWishlist);
wishlistRouter.delete('/remove/:productId', removeFromWishlist);

export default wishlistRouter;