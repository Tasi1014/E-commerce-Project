import "../Config/mongodbConfig.js";
import { trackOrder } from "../services/AITools/OrderTool.js";

const runTest = async () => {
  try {
    const userId = "6a1ed7217b2e562aef780d51";

    const tests = [
      {
        name: "Valid order",
        data: {
          order_number: "PK-745B8012",
          userId,
        },
      },
      {
        name: "Missing order number",
        data: {
          userId,
        },
      },
      {
        name: "Missing user ID",
        data: {
          order_number: "PK-745B8012",
        },
      },
      {
        name: "Invalid order number",
        data: {
          order_number: "PK-00000000",
          userId,
        },
      },
    ];

    for (const test of tests) {
      console.log(`\n========== ${test.name} ==========`);

      const result = await trackOrder(test.data);

      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("Order Tool Test Error:", error);
  } finally {
    process.exit(0);
  }
};

runTest();