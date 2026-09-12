import 'dotenv/config';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import '../Config/mongodbConfig.js';

const migrateOrderNumbers = async () => {
  try {
    // Wait for MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
      });
    }

    const orders = await Order.find({
      $or: [
        { orderNumber: { $exists: false } },
        { orderNumber: null },
        { orderNumber: '' },
      ],
    }).select('_id orderNumber');

    console.log(`Found ${orders.length} orders requiring migration.`);

    let migrated = 0;

    for (const order of orders) {
      const orderNumber = `PK-${order._id.toString().slice(-8).toUpperCase()}`;

      await Order.updateOne(
        { _id: order._id },
        { $set: { orderNumber } }
      );

      migrated++;

      console.log(
        `Migrated ${order._id} → ${orderNumber}`
      );
    }

    console.log(`\nMigration complete. ${migrated} orders updated.`);
  } catch (error) {
    console.error('Order number migration failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

migrateOrderNumbers();