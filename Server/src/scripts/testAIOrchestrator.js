import "../Config/mongodbConfig.js";
import { executeAIAction } from "../services/AIOrchestrator.js";

const runTest = async () => {
  try {
    const userId = "6aa153adca9a8ee309b0bc68";

    const tests = [
      {
        name: "Product search",
        data: {
          intent: "product_search",
          entities: {
            product_name: "shoes",
            price_max: 200,
          },
          userId,
        },
      },
      {
        name: "Order tracking",
        data: {
          intent: "order_tracking",
          entities: {
            order_number: "PK-745B8012",
          },
          userId,
        },
      },
      {
        name: "Unsupported intent",
        data: {
          intent: "payment_information",
          entities: {},
          userId,
        },
      },
    ];

    for (const test of tests) {
      console.log(`\n========== ${test.name} ==========`);

      const result = await executeAIAction(test.data);

      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("AI Orchestrator Test Error:", error);
  } finally {
    process.exit(0);
  }
};

runTest();