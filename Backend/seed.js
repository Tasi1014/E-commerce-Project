import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const products = [
  // --- MEN ---
  {
    name: "The Signature Tee",
    price: 120,
    category: "Men",
    description: "Premium cotton crewneck t-shirt with a relaxed fit. Made from 100% organic cotton, garment-dyed for a soft, lived-in feel.",
    mainImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-28'),
  },
  {
    name: "Structured Wool Blazer",
    price: 420,
    category: "Men",
    description: "Single-breasted blazer in virgin wool. Notch lapels, flap pockets, and a classic tailored fit.",
    mainImage: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-29'),
  },
  {
    name: "Utility Tech Jacket",
    price: 290,
    category: "Men",
    description: "Water-resistant technical jacket with multiple utility pockets. Breathable and lightweight.",
    mainImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-24'),
  },
  {
    name: "Classic White Sneaker",
    price: 150,
    category: "Men",
    description: "Minimalist leather sneaker with a clean silhouette. Cushioned insole and durable rubber outsole.",
    mainImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-21'),
  },
  {
    name: "Leather Chelsea Boots",
    price: 310,
    category: "Men",
    description: "Sleek Chelsea boot in full-grain leather. Elastic side panels, pull tab, and a low stacked heel.",
    mainImage: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-18'),
  },
  {
    name: "Linen Button Up",
    price: 110,
    category: "Men",
    description: "Breathable linen shirt with a relaxed fit. Perfect for warm weather, pairs with anything.",
    mainImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-15'),
  },
  {
    name: "Tailored Linen Shorts",
    price: 95,
    category: "Men",
    description: "Lightweight linen shorts with an elastic drawstring waist. Ideal for summer days.",
    mainImage: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-12'),
  },

  // --- WOMEN ---
  {
    name: "Modern Tailored Trouser",
    price: 240,
    category: "Women",
    description: "High-waisted tailored trousers in a fluid wool blend. Sharp crease, side pockets, and a button closure.",
    mainImage: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-27'),
  },
  {
    name: "Cashmere Blend Knit",
    price: 195,
    category: "Women",
    description: "Lightweight cashmere-wool blend knit with ribbed edges. A timeless layering piece.",
    mainImage: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-25'),
  },
  {
    name: "Silk Slip Dress",
    price: 280,
    category: "Women",
    description: "Elegant silk midi dress with a cowl neck. Slip-on style, perfect for evening or layered looks.",
    mainImage: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-20'),
  },
  {
    name: "Oversized Denim Jacket",
    price: 175,
    category: "Women",
    description: "Classic denim jacket with a relaxed, oversized fit. Washed finish and button closure.",
    mainImage: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-19'),
  },
  {
    name: "Wool Trench Coat",
    price: 490,
    category: "Women",
    description: "Classic trench coat in water-repellent wool. Belted waist, buttoned epaulets, and deep pockets.",
    mainImage: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-14'),
  },
  {
    name: "Cropped Cashmere Cardigan",
    price: 220,
    category: "Women",
    description: "Soft cashmere cardigan with a cropped silhouette. Button front and ribbed cuffs.",
    mainImage: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-11'),
  },

  // --- ACCESSORIES ---
  {
    name: "Structured Leather Mini",
    price: 350,
    category: "Accessories",
    description: "Boxy leather mini bag with a structured silhouette. Removable strap, internal pocket, and gold-toned hardware.",
    mainImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-26'),
  },
  {
    name: "Eclipse Acetate Frames",
    price: 180,
    category: "Accessories",
    description: "Broad profile sunglasses crafted from hand-polished bio-acetate. High-grade category 3 scratch-resistant lenses with complete UVA/UVB protection.",
    mainImage: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-30'),
  },
  {
    name: "Horizon Leather Watch",
    price: 210,
    category: "Accessories",
    description: "Minimalist leather watch with a clean dial. Japanese quartz movement, genuine leather strap.",
    mainImage: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-23'),
  },
  {
    name: "Minimalist Leather Wallet",
    price: 85,
    category: "Accessories",
    description: "Slim leather wallet with card slots and a central compartment. Hand-stitched, vegetable-tanned leather.",
    mainImage: "https://images.unsplash.com/photo-1627124118123-e4d3db139dec?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-22'),
  },
  {
    name: "Gold Chain Necklace",
    price: 145,
    category: "Accessories",
    description: "Delicate gold-filled chain necklace with a lobster clasp. Adjustable length, everyday elegance.",
    mainImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-17'),
  },
  {
    name: "Ribbed Knit Beanie",
    price: 45,
    category: "Accessories",
    description: "Warm ribbed knit beanie in merino wool. One size fits most, available in multiple colors.",
    mainImage: "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-16'),
  },
  {
    name: "Suede Weekender Bag",
    price: 380,
    category: "Accessories",
    description: "Spacious suede weekender with leather trim. Interior zip pocket and detachable shoulder strap.",
    mainImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop",
    images: [],
    createdAt: new Date('2026-05-13'),
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: 'PEAK_Store',
      retryWrites: true,
      w: 'majority',
    });
    
    console.log('✅ Connected to MongoDB, using database:', mongoose.connection.name);
    
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');
    
    const inserted = await Product.insertMany(products);
    console.log(`✅ Seeded ${inserted.length} products into PEAK_Store.products`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();