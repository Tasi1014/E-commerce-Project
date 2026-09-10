import { Router } from 'express';
import { authenticateToken } from '../middleware/AuthMiddleware.js';
import { sendMessageToAI } from '../services/AIService.js';

const aiRouter = Router();

aiRouter.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, session_id } = req.body;
    const userId = req.user.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: 'Message is required',
      });
    }

    const result = await sendMessageToAI(
      message,
      session_id,
      userId
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('AI Chat Error:', error.message);

    return res.status(503).json({
      message: 'AI service is currently unavailable',
    });
  }
});

export default aiRouter;