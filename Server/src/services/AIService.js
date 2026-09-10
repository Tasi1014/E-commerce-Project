const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

export const sendMessageToAI = async (message, sessionId = null, userId = null) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        user_id: userId
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();

      throw new Error(
        `AI service returned ${response.status}: ${errorData}`
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('AI Service Error:', error.message);
    throw new Error('Unable to connect to AI service');
  }
};