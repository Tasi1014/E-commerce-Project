import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Helper: decrement product stock
const decrementStock = async (productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error(`Product ${productId} not found`);
  if (product.stock < quantity) throw new Error(`Insufficient stock for ${product.name}`);
  product.stock -= quantity;
  await product.save();
  return true;
};

// Helper: restore stock (rollback)
const restoreStock = async (decrementedItems) => {
  for (const { productId, quantity } of decrementedItems) {
    await Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } });
  }
};

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Array to track successfully decremented items (for potential rollback)
    const decrementedItems = [];

    try {
      // Step 1: Check stock and decrement for each cart item
      for (const item of cart.items) {
        await decrementStock(item.product, item.quantity);
        decrementedItems.push({ productId: item.product, quantity: item.quantity });
      }

      // Step 2: Prepare order items
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

      const shippingCost = 0;
      const totalAmount = subtotal + shippingCost;

      // Step 3: Create order
      const order = await Order.create({
        user: userId,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        subtotal,
        shippingCost,
        totalAmount,
        notes: notes || '',
      });

      // Step 4: Clear cart
      cart.items = [];
      await cart.save();

      // Success – no rollback needed
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order,
      });
    } catch (err) {
      // If any error occurred, restore stock for all products that were decremented
      if (decrementedItems.length > 0) {
        await restoreStock(decrementedItems);
      }
      // Re-throw to be caught by outer catch
      throw err;
    }
  } catch (error) {
    console.error('Create order error:', error);
    const message = error.message || 'Server error';
    res.status(500).json({ success: false, message });
  }
};

// ... rest of the controller (getUserOrders, getOrderById) unchanged
// @route   GET /api/orders
// @desc    Get all orders for logged-in user
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/orders/:orderId
// @desc    Get single order details
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user.userId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/admin/orders
// @desc    Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/admin/orders/:orderId/status
// @desc    Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatus = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: status },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics (admin only)
export const getAdminStats = async (req, res) => {
  try {
    // 1. Total Revenue
    const revenueData = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // 2. Total Orders
    const totalOrders = await Order.countDocuments();

    // 3. New Customers (registered in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // 4. Conversion Rate (Orders / Customers * 10) or sensible logic
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const conversionRate = totalCustomers > 0 
      ? Math.min(((totalOrders / totalCustomers) * 100), 100).toFixed(1) + '%'
      : '3.2%';

    // 5. Top Products Aggregation
    const topProductsData = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          sold: { $sum: '$items.quantity' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    const topProducts = topProductsData.map((p) => ({
      id: p._id,
      name: p.name,
      category: p.productDetails[0]?.category || "Accessories",
      revenue: `$${p.revenue.toFixed(2)}`,
      sold: `${p.sold} sold`,
      img: p.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop&auto=format"
    }));

    // 6. Recent Orders (latest 5)
    const recentOrdersData = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    const recentOrders = recentOrdersData.map(order => {
      // Map status style color class name
      let statusColor = "text-[#facc15] bg-[#facc15]/10 border-[#facc15]/20";
      if (order.orderStatus === 'Delivered') statusColor = "text-[#22d3ee] bg-[#22d3ee]/10 border-[#22d3ee]/20";
      else if (order.orderStatus === 'Processing') statusColor = "text-[#fb923c] bg-[#fb923c]/10 border-[#fb923c]/20";
      else if (order.orderStatus === 'Shipped') statusColor = "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20";
      else if (order.orderStatus === 'Cancelled') statusColor = "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20";

      const name = order.user?.name || "John Dorsey";
      const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "JD";

      return {
        id: `#PK-${order._id.toString().slice(-4).toUpperCase()}`,
        _id: order._id,
        customer: {
          name,
          initials,
          color: "#4f378a"
        },
        product: order.items[0]?.name || "Phantom X Watch",
        amount: `$${order.totalAmount.toFixed(2)}`,
        status: order.orderStatus,
        statusColor
      };
    });

    res.json({
      success: true,
      stats: {
        totalRevenue: `$${(totalRevenue / 1000).toFixed(1)}k`,
        totalOrders: totalOrders.toLocaleString(),
        newCustomers: newCustomers.toString(),
        conversionRate,
        topProducts,
        recentOrders
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};