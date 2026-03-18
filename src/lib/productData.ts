// Hardcoded product data - no database dependency
import { getProductImage } from "@/lib/productImages";

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

Start your day with the natural goodness of fresh Ash Gourd Juice, a traditional wellness drink known for its cooling and detoxifying properties. Carefully blended with cucumber, coriander, mint, ginger, lemon, and a pinch of black salt, this refreshing juice delivers a perfect balance of taste and health.

Ash gourd has been valued in Ayurveda for centuries for supporting digestion, hydration, and body cleansing. Combined with fresh herbs and natural ingredients, this juice helps refresh the body and energize your day.

Key Ingredients: Ash Gourd, Cucumber, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt.`,
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

This vibrant juice combines fresh beetroot and tomato with coriander, mint, ginger, lemon, and black salt to create a delicious and nutrient-rich drink.

Key Ingredients: Beetroot, Tomato, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt.`,
  price: 79,
  stock: 80,
  is_active: true,
  image_url: "/images/beetroot-juice-1.jpg",
  image_url_2: "/images/beetroot-juice-2.jpg",
  image_url_3: "/images/beetroot-juice-3.jpg",
  variations: [
    { id: "p2-300ml", label: "300ml", price: 79, stock: 80 },
    { id: "p2-500ml", label: "500ml", price: 119, stock: 50 },
    { id: "p2-1l", label: "1 Litre", price: 199, stock: 30 },
  ],
},
{
  id: "p3",
  name: "Carrot Juice",
  category: "Carrot",
  description: `Carrot Fresh Juice — Sweet. Nourishing. Naturally Energizing.

Made with fresh carrots and tomato blended with coriander, mint, ginger, lemon, and black salt, this juice is naturally refreshing and nutrient rich.

Key Ingredients: Carrot, Tomato, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt.`,
  price: 79,
  stock: 80,
  is_active: true,
  image_url: "/images/carrot-juice-1.jpg",
  image_url_2: "/images/carrot-juice-2.jpg",
  image_url_3: "/images/carrot-juice-3.jpg",
  variations: [
    { id: "p3-300ml", label: "300ml", price: 79, stock: 80 },
    { id: "p3-500ml", label: "500ml", price: 119, stock: 50 },
    { id: "p3-1l", label: "1 Litre", price: 199, stock: 30 },
  ],
},
{
  id: "p4",
  name: "Cucumber Juice",
  category: "Cucumber",
  description: `Cucumber Hydration Juice — Cool. Refreshing. Naturally Revitalizing.

This cooling juice combines fresh cucumber and bottle gourd with coriander, mint, ginger, lemon, and black salt to create a light and hydrating drink.

Key Ingredients: Cucumber, Bottle Gourd, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt.`,
  price: 79,
  stock: 80,
  is_active: true,
  image_url: "/images/cucumber-juice-1.jpg",
  image_url_2: "/images/cucumber-juice-2.jpg",
  image_url_3: "/images/cucumber-juice-3.jpg",
  variations: [
    { id: "p4-300ml", label: "300ml", price: 79, stock: 80 },
    { id: "p4-500ml", label: "500ml", price: 119, stock: 50 },
    { id: "p4-1l", label: "1 Litre", price: 199, stock: 30 },
  ],
},
{
  id: "p5",
  name: "Tomato Juice",
  category: "Tomato",
  description: `Tomato Fresh Juice — Tangy. Refreshing. Naturally Nourishing.

This refreshing juice blends fresh tomato and cucumber with coriander, mint, ginger, lemon, and black salt to create a flavorful and revitalizing drink.

Key Ingredients: Tomato, Cucumber, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt.`,
  price: 79,
  stock: 80,
  is_active: true,
  image_url: "/images/tomato-juice-1.jpg",
  image_url_2: "/images/tomato-juice-2.jpg",
  image_url_3: "/images/tomato-juice-3.jpg",
  variations: [
    { id: "p5-300ml", label: "300ml", price: 79, stock: 80 },
    { id: "p5-500ml", label: "500ml", price: 119, stock: 50 },
    { id: "p5-1l", label: "1 Litre", price: 199, stock: 30 },
  ],
},
{
  id: "p6",
  name: "Mixed Veg Juice",
  category: "Mixed Veg",
  description: `Mixed Veg Power Juice — Balanced. Refreshing. Nutrient Rich.

A wholesome blend of carrot, beetroot, cucumber, tomato, coriander, mint, ginger, lemon, and black salt that delivers a refreshing and nutrient-packed vegetable juice.

Key Ingredients: Carrot, Beetroot, Cucumber, Tomato, Coriander Leaves, Mint Leaves, Ginger, Lemon Juice, Black Salt.`,
  price: 79,
  stock: 80,
  is_active: true,
  image_url: "/images/mix-veg-juice-1.jpg",
  image_url_2: "/images/mix-veg-juice-2.jpg",
  image_url_3: "/images/mix-veg-juice-3.jpg",
  variations: [
    { id: "p6-300ml", label: "300ml", price: 79, stock: 80 },
    { id: "p6-500ml", label: "500ml", price: 119, stock: 50 },
    { id: "p6-1l", label: "1 Litre", price: 199, stock: 30 },
  ],
},
{
  id: "p7",
  name: "Wheatgrass Juice",
  category: "Wheatgrass",
  description: `Wheatgrass Wellness Shot — Powerful. Natural. Revitalizing.

Wheatgrass juice is a highly nutritious green drink made with fresh wheatgrass blended with cucumber, lemon, and black salt.

Key Ingredients: Wheatgrass, Cucumber, Lemon Juice, Black Salt.`,
  price: 79,
  stock: 80,
  is_active: true,
  image_url: "/images/wheatgrass-juice-1.jpg",
  image_url_2: "/images/wheatgrass-juice-2.jpg",
  image_url_3: "/images/wheatgrass-juice-3.jpg",
  variations: [
    { id: "p7-300ml", label: "300ml", price: 79, stock: 80 },
    { id: "p7-500ml", label: "500ml", price: 119, stock: 50 },
    { id: "p7-1l", label: "1 Litre", price: 199, stock: 30 },
  ],
},
];
