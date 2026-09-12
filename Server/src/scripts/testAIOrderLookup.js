import 'dotenv/config';
import mongoose from 'mongoose';
import '../Config/mongodbConfig.js';
import { getOrderForAI } from '../services/OrderService.js';

const test = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
      });
    }

    const order = await getOrderForAI(
      'PK-745B8012',
      null
    );

    console.log('\nAI ORDER LOOKUP RESULT:\n');
    console.log(order);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

test();