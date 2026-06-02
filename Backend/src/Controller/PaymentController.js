import Stripe from 'stripe';
import { createOrderFromCart } from '../services/orderService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  return parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.userId;

    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: Math.round(parsePrice(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?payment=cancelled`,
      metadata: { userId: userId.toString() },
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyAndCreateOrder = async (req, res) => {
  try {
    const { session_id, shippingAddress, notes } = req.body;
    if (!session_id) {
      return res.status(400).json({ success: false, message: 'Missing session_id' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    const userId = session.metadata.userId;
    const order = await createOrderFromCart(userId, shippingAddress, 'Stripe', notes);
    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};