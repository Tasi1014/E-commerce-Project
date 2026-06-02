import Product from '../models/Product.js';

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, pagination
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, sort, page = 1, limit = 8 } = req.query;
    
    // Build filter object
    let filter = {};
    if (category && category !== 'All Products') {
      filter.category = category;
    }
    
    // Build sort object
    let sortOption = {};
    switch (sort) {
      case 'Price: Low to High':
        sortOption = { price: 1 };
        break;
      case 'Price: High to Low':
        sortOption = { price: -1 };
        break;
      case 'Newest Arrivals':
      default:
        sortOption = { createdAt: -1 };
        break;
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);
    
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limitNum);
    
    res.json({
      success: true,
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/products/search
// @desc    Search products by name (case-insensitive partial match)
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 8 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query (q) is required' 
      });
    }
    
    // Build search filter using regex (case-insensitive, partial match)
    const filter = {
      name: { $regex: q, $options: 'i' }   // 'i' = case-insensitive
    };
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const products = await Product.find(filter)
      .skip(skip)
      .limit(limitNum);
    
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limitNum);
    
    res.json({
      success: true,
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        itemsPerPage: limitNum,
      },
      searchQuery: q,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   PUT /api/products/:id/stock
// @desc    Update product stock (admin only)
export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ success: false, message: 'Valid stock value required' });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/products
// @desc    Get all products (admin only)
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @route   POST /api/admin/products
// @desc    Create a product (admin only)
export const createProduct = async (req, res) => {
  try {
    const { name, price, category, description, mainImage, images, stock } = req.body;
    const product = await Product.create({
      name,
      price,
      category,
      description,
      mainImage,
      images: images || [],
      stock: stock || 0,
    });
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @route   PUT /api/admin/products/:id
// @desc    Update a product (admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};