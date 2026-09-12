import { searchProducts } from './AITools/ProductTool.js';
import { trackOrder } from './AITools/OrderTool.js';
import { generateResponse } from './AIService.js';


/**
 * Execute the live-data action requested by the Python LLM.
 *
 * Python decides:
 *   - intent
 *   - entities
 *
 * Node decides:
 *   - which tool can be executed
 *   - database access
 *   - authorization
 *
 * After the tool executes, the trusted result is sent back
 * to Python for the second LLM call.
 */
export const executeAIAction = async ({
  message,
  sessionId,
  classification,
  userId,
}) => {

  const { intent, entities = {} } = classification;

  let toolResult;

  switch (intent) {

    case 'product_search':
      toolResult = await searchProducts(entities);
      break;

    case 'order_tracking':
      toolResult = await trackOrder({
        order_number: entities.order_number,
        userId,
      });
      break;

    default:
      return {
        type: 'response',
        session_id: sessionId,
        reply: 'No live-data action is available for this request.',
      };
  }

  /**
   * Send the trusted tool result to Python.
   *
   * Python performs LLM Call 2 and generates
   * the final customer-facing response.
   */
  return await generateResponse({
    message,
    sessionId,
    classification,
    toolResult,
  });
};
