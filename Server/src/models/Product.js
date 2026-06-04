import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    category: {
      type: String,
      enum: ['Men', 'Women', 'Accessories'],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    mainImage: {
      type: String,
      required: true,
    },
    images: {
      type: [String], // array of additional image URLs
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Product', productSchema);