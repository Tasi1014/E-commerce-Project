import "../Config/mongodbConfig.js";
import { searchProducts } from "../services/AITools/ProductTool.js";

const runTest = async () => {
  try {
    const tests = [
      {
        product_name: "shoes",
      },
      {
        price_min: 100,
        price_max: 200,
      },
      {
        category: "Men",
        price_max: 200,
      },
    ];

    for (const entities of tests) {
      console.log("\nEntities:", entities);

      const result = await searchProducts(entities);

      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("Product Tool Test Error:", error);
  } finally {
    process.exit(0);
  }
};

runTest();
