import { Router } from 'express';
import { authenticateToken } from '../middleware/AuthMiddleware.js';
import { classifyMessage } from '../services/AIService.js';
import { executeAIAction } from '../services/AIOrchestrator.js';

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

    const classificationResult = await classifyMessage(
      message,
      session_id,
      userId
    );

    
    if (classificationResult.type === 'response') {
      return res.status(200).json({
        reply: classificationResult.reply,
        session_id: classificationResult.session_id,
      });
    }

    
    if (classificationResult.type === 'tool_request') {

      const finalResponse = await executeAIAction({
        message,
        sessionId: classificationResult.session_id,
        classification:
          classificationResult.classification,
        userId,
      });

      return res.status(200).json({
        reply: finalResponse.reply,
        session_id: finalResponse.session_id,
      });
    }

    // -------------------------------------------------------
    // Unexpected response type
    // -------------------------------------------------------

    console.error(
      'Unexpected AI response type:',
      classificationResult.type
    );

    return res.status(500).json({
      message: 'Unexpected response from AI service',
    });

  } catch (error) {
    console.error(
      'AI Chat Error:',
      error.message
    );

    return res.status(503).json({
      message: 'AI service is currently unavailable',
    });
  }
});

export default aiRouter;

