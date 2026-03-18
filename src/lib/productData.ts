// src/lib/productData.ts

export type ProductVariation = {
  id: string;
  label: string;
  subLabel: string;
  price: number;
  stock: number;
  badge?: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  ingredients: string;
  price: number;
  stock: number;
  is_active: boolean;
  image_url: string | null;
  image_url_2?: string | null;
  image_url_3?: string | null;
  variations?: ProductVariation[];
};

const detoxPlans = [
  {
    key: "reset",
    label: "Urban Reset",
    subLabel: "1 Day Detox",
    price: 79,
    stock: 80,
  },
  {
    key: "cleanse",
    label: "Urban Cleanse",
    subLabel: "7 Day Detox",
    price: 499,
    stock: 50,
    badge: "Most Popular",
  },
  {
    key: "transform",
    label: "Urban Transformation",
    subLabel: "28 Day Detox",
    price: 1999,
    stock: 30,
    badge: "Best Value",
  },
];

const createVariations = (productId: string): ProductVariation[] =>
  detoxPlans.map((plan) => ({
    id: `${productId}-${plan.key}`,
    label: plan.label,
    subLabel: plan.subLabel,
    price: plan.price,
    stock: plan.stock,
    badge: plan.badge,
  }));

export const hardcodedProducts: Product[] = [
  {
    id: "p1",
    name: "Ash Gourd Juice",
    category: "Ash Gourd",
    description: `Ash Gourd Detox Juice — Pure. Cooling. Deeply Cleansing.

A traditional wellness drink known for its powerful detox properties. This refreshing blend helps cleanse the system while keeping the body cool and hydrated.

Perfect to start your day with lightness and clarity.`,
    ingredients:
      "Ash Gourd, Cucumber, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/ash-gourd-juice-1.jpg",
    image_url_2: "/images/ash-gourd-juice-2.jpg",
    image_url_3: "/images/ash-gourd-juice-3.jpg",
    variations: createVariations("p1"),
  },

  {
    id: "p2",
    name: "Beetroot Juice",
    category: "Beetroot",
    description: `Beetroot Vitality Juice — Rich. Energizing. Iron Boosting.

Packed with natural nitrates and nutrients, this juice supports stamina, blood flow, and daily energy levels.

A perfect drink to power through your day.`,
    ingredients:
      "Beetroot, Tomato, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/beetroot-juice-1.jpg",
    image_url_2: "/images/beetroot-juice-2.jpg",
    image_url_3: "/images/beetroot-juice-3.jpg",
    variations: createVariations("p2"),
  },

  {
    id: "p3",
    name: "Carrot Juice",
    category: "Carrot",
    description: `Carrot Glow Juice — Sweet. Nourishing. Skin Friendly.

Rich in beta-carotene and antioxidants, this juice supports skin health, vision, and immunity.

A naturally sweet and refreshing daily drink.`,
    ingredients:
      "Carrot, Tomato, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/carrot-juice-1.jpg",
    image_url_2: "/images/carrot-juice-2.jpg",
    image_url_3: "/images/carrot-juice-3.jpg",
    variations: createVariations("p3"),
  },

  {
    id: "p4",
    name: "Cucumber Juice",
    category: "Cucumber",
    description: `Cucumber Hydration Juice — Light. Cooling. Deeply Refreshing.

A perfect hydration drink that cools the body and replenishes fluids, especially in hot weather.

Keeps you fresh, light, and energized.`,
    ingredients:
      "Cucumber, Bottle Gourd, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/cucumber-juice-1.jpg",
    image_url_2: "/images/cucumber-juice-2.jpg",
    image_url_3: "/images/cucumber-juice-3.jpg",
    variations: createVariations("p4"),
  },

  {
    id: "p5",
    name: "Tomato Juice",
    category: "Tomato",
    description: `Tomato Refresh Juice — Tangy. Savory. Heart Friendly.

Loaded with antioxidants like lycopene, this juice supports heart health and overall wellness.

A bold and refreshing savory drink.`,
    ingredients:
      "Tomato, Cucumber, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/tomato-juice-1.jpg",
    image_url_2: "/images/tomato-juice-2.jpg",
    image_url_3: "/images/tomato-juice-3.jpg",
    variations: createVariations("p5"),
  },

  {
    id: "p6",
    name: "Mixed Veg Juice",
    category: "Mixed Veg",
    description: `Mixed Veg Power Juice — Balanced. Complete. Nutrient Rich.

A powerful blend of multiple vegetables providing a wide range of vitamins and minerals.

Your all-in-one daily health drink.`,
    ingredients:
      "Carrot, Beetroot, Cucumber, Tomato, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/mix-veg-juice-1.jpg",
    image_url_2: "/images/mix-veg-juice-2.jpg",
    image_url_3: "/images/mix-veg-juice-3.jpg",
    variations: createVariations("p6"),
  },

  {
    id: "p7",
    name: "Wheatgrass Juice",
    category: "Wheatgrass",
    description: `Wheatgrass Wellness Shot — Powerful. Detoxifying. Immunity Boosting.

A concentrated green superfood rich in chlorophyll that supports detox and boosts immunity.

Best consumed fresh for maximum benefits.`,
    ingredients:
      "Wheatgrass, Cucumber, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/wheatgrass-juice-1.jpg",
    image_url_2: "/images/wheatgrass-juice-2.jpg",
    image_url_3: "/images/wheatgrass-juice-3.jpg",
    variations: createVariations("p7"),
  },
];