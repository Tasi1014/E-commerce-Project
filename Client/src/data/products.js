// Rich Mock Products Database for PEAK E-Commerce Project
// Centralized for both ShopAllPage and ProductDetailPage to support future backend API swapping

export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "The Signature Tee",
    price: "$120.00",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
    category: "Men",
    createdAt: "2026-05-28T10:00:00.000Z",
    description: "Crafted from 280gsm organic cotton, our Signature Tee features a refined, relaxed silhouette with a structured collar. A perennial wardrobe essential designed to hold its shape wash after wash.",
    colors: [
      { name: "OPTIC WHITE", hex: "#ffffff" },
      { name: "CHARCOAL", hex: "#2f2d35" },
      { name: "HEATHER GRAY", hex: "#e1e0e5" },
      { name: "OLIVE", hex: "#605b3c" }
    ],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "100% GOTS Certified Organic Cotton",
      "Heavyweight 280gsm jersey weave",
      "Reinforced rib neck",
      "Designed in London, Made in Portugal"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 2,
    name: "Modern Tailored Trouser",
    price: "$240.00",
    img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop",
    category: "Women",
    createdAt: "2026-05-27T10:00:00.000Z",
    description: "An elegant, modern tailored trouser crafted from a premium wool blend. Featuring a high-rise waist, sharp pressed creases, and a subtle wide-leg silhouette that flows beautifully from hip to hem.",
    colors: [
      { name: "ROSE PINK", hex: "#d09ba2" },
      { name: "MIDNIGHT BLACK", hex: "#1d1b20" },
      { name: "SAND BEIGE", hex: "#dfd5c6" }
    ],
    sizes: ["XS", "S", "M", "L"],
    details: [
      "70% Virgin Wool, 30% Silk Blend",
      "High-waisted tailored fit with belt loops",
      "Side slash pockets and rear welt pockets",
      "Dry clean only"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 3,
    name: "Structured Leather Mini",
    price: "$350.00",
    img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop",
    category: "Accessories",
    createdAt: "2026-05-26T10:00:00.000Z",
    description: "A timeless addition to any accessory collection, this structured mini bag is crafted from quilted premium calfskin leather. Featuring a gold-tone chain strap and dynamic signature clasp closure.",
    colors: [
      { name: "ONYX BLACK", hex: "#111111" },
      { name: "IVORY WHITE", hex: "#fbf6f0" },
      { name: "COGNAC BROWN", hex: "#8d5c38" }
    ],
    sizes: ["ONE SIZE"],
    details: [
      "100% Genuine Calfskin Leather",
      "18k Gold-plated hardware accents",
      "Internal zip pocket and card slot",
      "Adjustable sliding chain shoulder strap"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605733513597-a8f8d410f286?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 4,
    name: "Cashmere Blend Knit",
    price: "$195.00",
    img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
    category: "Women",
    createdAt: "2026-05-25T10:00:00.000Z",
    description: "Exquisitely soft cashmere blend knit sweater featuring a premium mock neck and modern dropped shoulders. Adorned with a curated artisan print, it provides ultimate comfort with high-fashion credentials.",
    colors: [
      { name: "CAMEL BEIGE", hex: "#d8be9b" },
      { name: "CREAM OATMEAL", hex: "#eee6db" },
      { name: "SLATE GRAY", hex: "#7a7e85" }
    ],
    sizes: ["S", "M", "L"],
    details: [
      "75% Grade-A Cashmere, 25% Fine Merino Wool",
      "Relaxed fit with ribbed cuffs and hem",
      "Soft, non-itchy texture against the skin",
      "Imported premium Mongolian yarns"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517231922316-aa9a2f7c0064?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608234808654-2a8875faa7fd?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 5,
    name: "Eclipse Acetate Frames",
    price: "$180.00",
    img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop",
    category: "Accessories",
    createdAt: "2026-05-30T10:00:00.000Z",
    description: "Broad profile sunglasses crafted from hand-polished bio-acetate. The Eclipse frames feature high-grade category 3 scratch-resistant lenses that guarantee complete UVA/UVB protection.",
    colors: [
      { name: "OBSIDIAN BLACK", hex: "#111111" },
      { name: "TORTOISE SHELL", hex: "#523c21" },
      { name: "CRYSTAL AMBER", hex: "#d1a364" }
    ],
    sizes: ["ONE SIZE"],
    details: [
      "100% Biodegradable Cellulose Acetate",
      "100% UVA/UVB Category 3 protection lenses",
      "Durable five-barrel hinge mechanism",
      "Includes premium leather protective sleeve"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 6,
    name: "Structured Wool Blazer",
    price: "$420.00",
    img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop",
    category: "Men",
    createdAt: "2026-05-29T10:00:00.000Z",
    description: "A timeless double-breasted wool blazer. Featuring structured shoulders, sharp notch lapels, and a fully lined interior, this elegant layering item is tailored for a sharp modern aesthetic.",
    colors: [
      { name: "CHARCOAL GRAY", hex: "#424246" },
      { name: "NAVY BLUE", hex: "#1c2c43" },
      { name: "DESERT OAT", hex: "#cdc6b7" }
    ],
    sizes: ["38", "40", "42", "44"],
    details: [
      "100% Superfine Italian Wool Outer",
      "100% Breathable cupro jacquard lining",
      "Structured padded shoulders",
      "Flap hand pockets and interior chest pocket"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555069519-03000b2f589d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 7,
    name: "Utility Tech Jacket",
    price: "$290.00",
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
    category: "Men",
    createdAt: "2026-05-24T10:00:00.000Z",
    description: "A weather-resistant utility jacket engineered for performance and comfort. Constructed with multiple exterior bellows pockets, reflective striping, and adjustable hook-and-loop cuffs.",
    colors: [
      { name: "SAND BEIGE", hex: "#e0d5c4" },
      { name: "MATTE BLACK", hex: "#1a1a1a" },
      { name: "MILITARY GREEN", hex: "#4e5445" }
    ],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "Water-repellent nylon-taslan shell",
      "Four exterior 3D bellows pockets",
      "Two-way zip closure with snap-button storm flap",
      "Adjustable waist drawcord"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 8,
    name: "Horizon Leather Watch",
    price: "$210.00",
    img: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=800&auto=format&fit=crop",
    category: "Accessories",
    createdAt: "2026-05-23T10:00:00.000Z",
    description: "A minimal, sleek timekeeper featuring a clean circular face, premium Miyota quartz movement, and a genuine Italian leather strap. Blends vintage elegance with a modern minimalist aesthetic.",
    colors: [
      { name: "BEIGE LEATHER", hex: "#d8c4ad" },
      { name: "TAN LEATHER", hex: "#bc8e5b" },
      { name: "OBSIDIAN BLACK", hex: "#222222" }
    ],
    sizes: ["ONE SIZE"],
    details: [
      "316L Stainless Steel 40mm case",
      "Vegetable-tanned genuine Italian leather band",
      "5 ATM (50 meters) water resistance",
      "Scratch-proof mineral glass face"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539874754764-5a96559165b0?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 10,
    name: "Classic White Sneaker",
    price: "$150.00",
    img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
    category: "Men",
    createdAt: "2026-05-21T10:00:00.000Z",
    description: "Premium full-grain leather sneakers styled with a sleek silhouette and low profile. Handcrafted with high-density memory foam insoles for unrivaled step-in comfort and maximum breathability.",
    colors: [
      { name: "CLEAN WHITE", hex: "#ffffff" },
      { name: "PALE GRAY", hex: "#e4e4e7" },
      { name: "OFF-WHITE GUM", hex: "#f0ece1" }
    ],
    sizes: ["8", "9", "10", "11"],
    details: [
      "100% Genuine Full-grain Calfskin leather",
      "Molded eco-friendly memory foam insole",
      "Reinforced rubber cupsole construction",
      "Handcrafted in Italy"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 11,
    name: "Silk Slip Dress",
    price: "$280.00",
    img: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=800&auto=format&fit=crop",
    category: "Women",
    createdAt: "2026-05-20T10:00:00.000Z",
    description: "An elegant bias-cut slip dress crafted from organic mulberry silk. Featuring a flattering V-neck, delicate adjustable shoulder straps, and a gorgeous low back scoop.",
    colors: [
      { name: "CHAMPAGNE GOLD", hex: "#e7d5c0" },
      { name: "EMERALD GREEN", hex: "#0b4e36" },
      { name: "MIDNIGHT BLACK", hex: "#151515" }
    ],
    sizes: ["XS", "S", "M", "L"],
    details: [
      "100% Organic Mulberry Silk (19 momme weight)",
      "Bias cut for a beautiful drape and fit",
      "Fully adjustable crossback straps",
      "Hypoallergenic and temperature-regulating"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 12,
    name: "Oversized Denim Jacket",
    price: "$175.00",
    img: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop",
    category: "Women",
    createdAt: "2026-05-19T10:00:00.000Z",
    description: "A relaxed, oversized trucker jacket made from rigid organic cotton denim. Features classic metal button closures, chest flap pockets, and light custom distressing for a retro lived-in look.",
    colors: [
      { name: "VINTAGE WASH", hex: "#8fb1d6" },
      { name: "WASHED INDIGO", hex: "#3f5b7d" },
      { name: "CREAM DENIM", hex: "#faf5ec" }
    ],
    sizes: ["S", "M", "L"],
    details: [
      "100% Rigid Organic Cotton Denim (13.5 oz)",
      "Oversized drop-shoulder profile",
      "Nickel-free logo-engraved shank buttons",
      "Made using water-saving wash techniques"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1475180098004-ca77a66827ae?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 13,
    name: "Leather Chelsea Boots",
    price: "$310.00",
    img: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=800&auto=format&fit=crop",
    category: "Men",
    createdAt: "2026-05-18T10:00:00.000Z",
    description: "A premium wardrobe staple. These Chelsea boots are crafted from vegetable-tanned French calfskin, featuring flexible elastic side gores and a robust stacked leather heel for all-day cushioning.",
    colors: [
      { name: "CHESTNUT BROWN", hex: "#5b3d2b" },
      { name: "MATTE BLACK", hex: "#1c1c1c" }
    ],
    sizes: ["8", "9", "10", "11", "12"],
    details: [
      "Hand-selected French Calfskin Leather upper",
      "Blake stitch flexible sole construction",
      "Genuine leather lining and cushioned footbed",
      "Heavy-duty elastic double gores with pull tabs"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 14,
    name: "Gold Chain Necklace",
    price: "$145.00",
    img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    category: "Accessories",
    createdAt: "2026-05-17T10:00:00.000Z",
    description: "A classic Cuban link chain necklace engineered to stack or wear alone. Meticulously handcrafted with high-purity gold vermeil and secured with a custom sleek integrated clasp.",
    colors: [
      { name: "18K YELLOW GOLD", hex: "#e7c975" },
      { name: "STERLING SILVER", hex: "#dcdcdf" },
      { name: "ROSE GOLD", hex: "#e0ad94" }
    ],
    sizes: ["18 INCH", "20 INCH", "22 INCH"],
    details: [
      "18k Gold heavy vermeil layer over 925 Sterling Silver",
      "Chain width: 4.5mm Cuban link",
      "Sleek customized push-button safety clasp",
      "Tarnish-resistant protective coating"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611085583191-a3b1a3a355db?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 16,
    name: "Linen Button Up",
    price: "$110.00",
    img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop",
    category: "Men",
    createdAt: "2026-05-15T10:00:00.000Z",
    description: "An airy, breathable shirt made from 100% organic flax linen. Designed with a curved hem and a relaxed point collar, it provides maximum thermal comfort for warm summer days.",
    colors: [
      { name: "SAND BEIGE", hex: "#ebdcb9" },
      { name: "SKY BLUE", hex: "#bed9e7" },
      { name: "OPTIC WHITE", hex: "#ffffff" }
    ],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "100% Organic Normandy Flax Linen",
      "Pre-washed for enhanced softness and zero shrinkage",
      "Natural shell button closures",
      "Breathable, lightweight weave"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588359348347-9bc6cbaa689e?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 17,
    name: "Wool Trench Coat",
    price: "$490.00",
    img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop",
    category: "Women",
    createdAt: "2026-05-14T10:00:00.000Z",
    description: "An exquisite wool trench coat blending traditional design with premium winter warmth. Features an adjustable wrap belt, storm flaps, and a deep pleated back.",
    colors: [
      { name: "CAMEL BEIGE", hex: "#cfa679" },
      { name: "MIDNIGHT NAVY", hex: "#1d232c" },
      { name: "CHARCOAL", hex: "#2b2b2b" }
    ],
    sizes: ["XS", "S", "M", "L"],
    details: [
      "80% Virgin Wool, 20% Cashmere outer shell",
      "Premium satin inner lining",
      "Removable matching waist-cinching belt",
      "Adjustable double button cuffs"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 18,
    name: "Suede Weekender Bag",
    price: "$380.00",
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
    category: "Accessories",
    createdAt: "2026-05-13T10:00:00.000Z",
    description: "A luxurious and spacious companion for travel. Crafted from heavy-duty suede leather with calfskin accents, complete with reinforced shoulder strap and premium heavy brass zippers.",
    colors: [
      { name: "COFFEE BROWN", hex: "#634735" },
      { name: "CHARCOAL GRAY", hex: "#3e4249" }
    ],
    sizes: ["ONE SIZE"],
    details: [
      "100% Genuine Split Suede Leather shell",
      "Vegetable-tanned calfskin handles and reinforcement trim",
      "YKK luxury brass double zippers",
      "Meets standard airline carry-on dimensions"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 19,
    name: "Tailored Linen Shorts",
    price: "$95.00",
    img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop",
    category: "Men",
    createdAt: "2026-05-12T10:00:00.000Z",
    description: "Refined linen shorts combining warm weather breathability with tailored structure. Features a neat front button, side slash pockets, and double rear welt pockets.",
    colors: [
      { name: "SAND BEIGE", hex: "#dfd6c6" },
      { name: "NAVY BLUE", hex: "#232e43" },
      { name: "OFF WHITE", hex: "#f8f5ee" }
    ],
    sizes: ["30", "32", "34", "36"],
    details: [
      "100% Organic Flax Linen woven shell",
      "Chino-style zip fly with natural horn button",
      "Inseam length: 7.5 inches",
      "Machine washable on gentle cycle"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 20,
    name: "Cropped Cashmere Cardigan",
    price: "$220.00",
    img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop",
    category: "Women",
    createdAt: "2026-05-11T10:00:00.000Z",
    description: "A modern cropped silhouette knitted from pure premium cashmere. Features a flattering deep ribbed hem, relaxed long sleeves, and natural mother-of-pearl buttons.",
    colors: [
      { name: "CREAM WHITE", hex: "#fcf8f3" },
      { name: "CAMEL", hex: "#cc9e78" },
      { name: "POWDER BLUE", hex: "#cedbe3" }
    ],
    sizes: ["XS", "S", "M", "L"],
    details: [
      "100% Grade-A Pure Cashmere weave",
      "Modern cropped fit designed to hit the high waist",
      "Natural mother-of-pearl buttons",
      "Dry clean or hand wash cold only"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608234808654-2a8875faa7fd?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517231922316-aa9a2f7c0064?q=80&w=800&auto=format&fit=crop"
    ]
  }
];
