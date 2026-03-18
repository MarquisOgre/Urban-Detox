// src/lib/productData.ts

export type ProductVariation = {
  id: string;
  label: string;
  price: number;
  stock: number;
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

export const hardcodedProducts: Product[] = [
  {
    id: "p1",
    name: "Ash Gourd Juice",
    category: "Ash Gourd",
    description: `Ash Gourd Detox Juice — Pure. Refreshing. Naturally Cleansing.

Start your day with the natural goodness of fresh Ash Gourd Juice, known for its cooling and detoxifying properties. This refreshing blend supports hydration and internal cleansing.

A perfect balance of freshness and wellness to energize your day.`,
    ingredients:
      "Ash Gourd, Cucumber, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/ash-gourd-juice-1.jpg",
    image_url_2: "/images/ash-gourd-juice-2.jpg",
    image_url_3: "/images/ash-gourd-juice-3.jpg",
    variations: [
      { id: "p1-300ml", label: "300ml", price: 79, stock: 80 },
      { id: "p1-500ml", label: "500ml", price: 119, stock: 50 },
      { id: "p1-1l", label: "1 Litre", price: 199, stock: 30 },
    ],
  },

  {
    id: "p2",
    name: "Beetroot Juice",
    category: "Beetroot",
    description: `Beetroot Vitality Juice — Rich. Energizing. Naturally Nourishing.

A vibrant blend of fresh beetroot and tomato crafted to support stamina and vitality.

Perfect for boosting daily energy.`,
    ingredients:
      "Beetroot, Tomato, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/beetroot-juice-1.jpg",
    image_url_2: "/images/beetroot-juice-2.jpg",
    image_url_3: "/images/beetroot-juice-3.jpg",
  },

  {
    id: "p3",
    name: "Carrot Juice",
    category: "Carrot",
    description: `Carrot Fresh Juice — Sweet. Nourishing. Naturally Energizing.

Made with fresh carrots and herbs, this juice delivers a refreshing and nutrient-rich experience.

Keeps you active and refreshed.`,
    ingredients:
      "Carrot, Tomato, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/carrot-juice-1.jpg",
    image_url_2: "/images/carrot-juice-2.jpg",
    image_url_3: "/images/carrot-juice-3.jpg",
  },

  {
    id: "p4",
    name: "Cucumber Juice",
    category: "Cucumber",
    description: `Cucumber Hydration Juice — Cool. Refreshing. Naturally Revitalizing.

A light and cooling juice designed to hydrate and refresh your body.

Perfect for daily detox.`,
    ingredients:
      "Cucumber, Bottle Gourd, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/cucumber-juice-1.jpg",
    image_url_2: "/images/cucumber-juice-2.jpg",
    image_url_3: "/images/cucumber-juice-3.jpg",
  },

  {
    id: "p5",
    name: "Tomato Juice",
    category: "Tomato",
    description: `Tomato Fresh Juice — Tangy. Refreshing. Naturally Nourishing.

A flavorful blend that delivers both taste and nutrition.

Refreshing and satisfying.`,
    ingredients:
      "Tomato, Cucumber, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/tomato-juice-1.jpg",
    image_url_2: "/images/tomato-juice-2.jpg",
    image_url_3: "/images/tomato-juice-3.jpg",
  },

  {
    id: "p6",
    name: "Mixed Veg Juice",
    category: "Mixed Veg",
    description: `Mixed Veg Power Juice — Balanced. Refreshing. Nutrient Rich.

A wholesome combination of vegetables designed for complete nutrition.

Perfect daily health drink.`,
    ingredients:
      "Carrot, Beetroot, Cucumber, Tomato, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/mix-veg-juice-1.jpg",
    image_url_2: "/images/mix-veg-juice-2.jpg",
    image_url_3: "/images/mix-veg-juice-3.jpg",
  },

  {
    id: "p7",
    name: "Wheatgrass Juice",
    category: "Wheatgrass",
    description: `Wheatgrass Wellness Shot — Powerful. Natural. Revitalizing.

A concentrated green drink packed with nutrients to support detox and immunity.

Best consumed fresh for maximum benefits.`,
    ingredients:
      "Wheatgrass, Cucumber, Lemon Juice, Black Salt",
    price: 79,
    stock: 80,
    is_active: true,
    image_url: "/images/wheatgrass-juice-1.jpg",
    image_url_2: "/images/wheatgrass-juice-2.jpg",
    image_url_3: "/images/wheatgrass-juice-3.jpg",
  },
];