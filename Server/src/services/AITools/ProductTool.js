import Product from '../../models/Product.js';

export const searchProducts = async (entities = {}) => {
  const filter = {};

  // Product name
  if (entities.product_name) {
    filter.name = {
      $regex: entities.product_name,
      $options: 'i',
    };
  }

  // Category
  if (entities.category) {
    filter.category = entities.category;
  }

  // Price range
  if (
    typeof entities.price_min === 'number' ||
    typeof entities.price_max === 'number'
  ) {
    filter.price = {};

    if (typeof entities.price_min === 'number') {
      filter.price.$gte = entities.price_min;
    }

    if (typeof entities.price_max === 'number') {
      filter.price.$lte = entities.price_max;
    }
  }

  const products = await Product.find(filter)
    .select('name price category stock')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    success: true,
    products,
    count: products.length,
  };
};