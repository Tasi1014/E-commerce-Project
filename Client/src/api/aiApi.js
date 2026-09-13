import axiosInstance from "./axiosInstance";

/**
 * Send a customer message to the PEAK AI chatbot.
 *
 * The backend handles:
 * - intent classification
 * - entity extraction
 * - database/tool operations
 * - final response generation
 *
 * sessionId is sent so the backend can maintain conversation context.
 */
export const sendMessageToAI = async (message, sessionId = null) => {
  try {
    const response = await axiosInstance.post("/ai/chat", {
      message,
      session_id: sessionId,
    });

    return response.data;
  } catch (error) {
    console.error(
      "AI Chat API Error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "Unable to connect to AI chatbot"
    );
  }
};