const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Stage 1:
 * Send the customer message to Python for:
 * - intent classification
 * - topic detection
 * - entity extraction
 * - KB response generation for KB-backed intents
 *
 * For live-data intents, FastAPI returns a tool_request
 * instead of a final response.
 */
export const classifyMessage = async (
  message,
  sessionId = null,
  userId = null
) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();

      throw new Error(
        `AI service returned ${response.status}: ${errorData}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      'AI Classification Service Error:',
      error.message
    );

    throw new Error(
      'Unable to connect to AI classification service'
    );
  }
};


/**
 * Stage 2:
 * Send the trusted Node.js tool result back to Python.
 *
 * Python uses:
 * - original customer message
 * - classification from LLM Call 1
 * - trusted tool result
 *
 * to perform LLM Call 2 and generate the final response.
 */
export const generateResponse = async ({
  message,
  sessionId,
  classification,
  toolResult,
}) => {
  try {
    const response = await fetch(
      `${AI_SERVICE_URL}/api/chat/respond`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          classification,
          tool_result: toolResult,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();

      throw new Error(
        `AI service returned ${response.status}: ${errorData}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      'AI Response Generation Service Error:',
      error.message
    );

    throw new Error(
      'Unable to connect to AI response generation service'
    );
  }
};



export const sendMessageToAI = async (
  message,
  sessionId = null,
  userId = null
) => {
  return await classifyMessage(
    message,
    sessionId,
    userId
  );
};

