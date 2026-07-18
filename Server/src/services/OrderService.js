import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const createOrderFromCart = async (userId, shippingAddress, paymentMethod, notes = '', stripeSessionId = null) => {
  // ── Idempotency guard ───────────────────────────────────────────────────────
  // If a stripeSessionId is provided, check whether we already created an order
  // for this Stripe session (handles React double-invoke / network retries).
  if (stripeSessionId) {
    const existing = await Order.findOne({ stripeSessionId });
    if (existing) return existing;
  }
  // Fetch cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) throw new Error('Cart is empty');

  const decrementedItems = [];
  try {
    let subtotal = 0;
    const orderItems = cart.items.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      return {
        productId: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        color: item.colorName || '',
        size: item.size || '',
      };
    });

    // Deduct stock (with rollback tracking)
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      decrementedItems.push({ productId: item.productId, quantity: item.quantity });
    }

    const paymentStatus = paymentMethod === 'Stripe' ? 'Paid' : 'Pending';
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      subtotal,
      shippingCost: 0,
      totalAmount: subtotal,
      notes,
      // Store session id so repeated calls return this same order (idempotency)
      ...(stripeSessionId ? { stripeSessionId } : {}),
    });

    await Cart.updateOne({ user: userId }, { $set: { items: [] } });

    return order;
  } catch (error) {
    // Rollback stock for any already‑decremented products
    for (const { productId, quantity } of decrementedItems) {
      await Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } });
    }
    throw error;
  }
};