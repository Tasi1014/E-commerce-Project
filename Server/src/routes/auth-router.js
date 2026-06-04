import { Router } from 'express';
import { register, login, adminLogin, logout } from '../Controller/AuthController.js';
import { authenticateToken } from '../middleware/AuthMiddleware.js';

const authRouter = Router();

// Public routes
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/admin-login', adminLogin);
authRouter.post('/logout', logout);

authRouter.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

export default authRouter;