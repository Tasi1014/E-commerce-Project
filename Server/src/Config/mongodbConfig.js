import mongoose from "mongoose";
import { MongoConfig } from "./appConfig.js";  // note .js extension

(async () => {
  try {
    await mongoose.connect(MongoConfig.url, {
      dbName: "PEAK_Store",        // ← choose your database name
      autoCreate: true,         // creates db if not exists
      autoIndex: true           // builds indexes automatically
    });
    console.log("✅ MONGODB CONNECTED SUCCESSFULLY");
  } catch (exception) {
    console.log(exception);
    console.error("❌ Error connecting mongodb");
    process.exit(1);
  }
})();