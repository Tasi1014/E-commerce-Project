import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const addStock = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, { dbName: 'PEAK_Store' });
    const result = await Product.updateMany(
      { stock: { $exists: false } }, // only products without stock
      { $set: { stock: 20 } }        // set default stock to 20
    );
    console.log(`✅ Added stock to ${result.modifiedCount} products`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

addStock();