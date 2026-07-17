import mongoose from "mongoose";
import { MongoConfig } from "./appConfig.js"; 

(async () => {
  try {
    await mongoose.connect(MongoConfig.url, {
      dbName: "PEAK_Store",        
      autoCreate: true,         
      autoIndex: true           
    });
    console.log("MONGODB CONNECTED SUCCESSFULLY");
  } catch (exception) {
    console.log(exception);
    console.error("Error connecting mongodb");
    process.exit(1);
  }
})();