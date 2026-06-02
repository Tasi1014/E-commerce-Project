import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/AuthMiddleware.js';
import { getAllOrders, updateOrderStatus, getAdminStats } from '../Controller/OrderController.js';
import { getAllUsers } from '../Controller/AuthController.js';
import { getAllProductsAdmin, createProduct, updateProduct, deleteProduct } from '../Controller/ProductController.js';

const adminRouter = Router();

// Apply admin authentication to all routes under adminRouter
adminRouter.use(authenticateToken, authorizeRoles('admin'));

// Stats dashboard route
adminRouter.get('/stats', getAdminStats);

// Orders admin routes
adminRouter.get('/orders', getAllOrders);
adminRouter.put('/orders/:orderId/status', updateOrderStatus);

// Users/Customers admin routes
adminRouter.get('/users', getAllUsers);

// Products admin routes
adminRouter.get('/products', getAllProductsAdmin);
adminRouter.post('/products', createProduct);
adminRouter.put('/products/:id', updateProduct);
adminRouter.delete('/products/:id', deleteProduct);

export default adminRouter;
