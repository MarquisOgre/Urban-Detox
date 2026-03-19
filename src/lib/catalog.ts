import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { slugify } from "@/lib/slugify";

export type CatalogPlan = {
  key: string;
  label: string;
  subLabel: string;
  price: number;
  badge?: string;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  ingredients: string | null;
  health_benefits: string | null;
  price: number;
  maxPrice: number;
  image_url: string | null;
  images: string[];
  is_active: boolean;
  plans: CatalogPlan[];
};

type CatalogProductRow = {
  id: string;
  slug?: string | null;
  name: string;
  category: string;
  description?: string | null;
  ingredients?: string | null;
  health_benefits?: string | null;
  price?: number | string | null;
  image_url?: string | null;
  images?: Json;
  is_active: boolean;
  plan_options?: Json;
};

export const DEFAULT_PLAN_OPTIONS: CatalogPlan[] = [
  { key: "reset", label: "Urban Reset", subLabel: "1 Day Detox", price: 79 },
  { key: "cleanse", label: "Urban Cleanse", subLabel: "7 Day Detox", price: 499 },
  { key: "transform", label: "Urban Transform", subLabel: "30 Day Detox", price: 1999, badge: "Best Value" },
];

const normalizePlanOptions = (value: Json | undefined): CatalogPlan[] => {
  if (!Array.isArray(value)) return DEFAULT_PLAN_OPTIONS;

  const plans = value
    .map<CatalogPlan | null>((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;

      const plan = item as Record<string, unknown>;
      const key = typeof plan.key === "string" ? plan.key : null;
      const label = typeof plan.label === "string" ? plan.label : null;
      const subLabel = typeof plan.subLabel === "string" ? plan.subLabel : null;
      const price = Number(plan.price);
      const badge = typeof plan.badge === "string" ? plan.badge : undefined;

      if (!key || !label || !subLabel || Number.isNaN(price)) return null;

      return { key, label, subLabel, price, badge };
    })
    .filter((plan): plan is CatalogPlan => plan !== null);

  return plans.length > 0 ? plans : DEFAULT_PLAN_OPTIONS;
};

const normalizeImages = (value: Json | undefined): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.length > 0);
};

const mapCatalogProduct = (row: CatalogProductRow): CatalogProduct => {
  const plans = normalizePlanOptions(row.plan_options);
  const fallbackPrice = Number(row.price ?? plans[0]?.price ?? 0);
  const prices = plans.map((plan) => plan.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : fallbackPrice;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : fallbackPrice;

  return {
    id: row.id,
    slug: row.slug?.trim() || slugify(row.name),
    name: row.name,
    category: row.category,
    description: row.description ?? "",
    ingredients: row.ingredients ?? null,
    health_benefits: row.health_benefits ?? null,
    price: minPrice,
    maxPrice,
    image_url: row.image_url ?? null,
    images: normalizeImages(row.images),
    is_active: row.is_active,
    plans,
  };
};

export const getCartProductId = (productId: string, planKey?: string) =>
  planKey ? `${productId}:${planKey}` : productId;

export const fetchCatalogProducts = async (): Promise<CatalogProduct[]> => {
  const { data, error } = await supabase.from("products").select("*").eq("is_active", true);

  if (error) throw error;

  return ((data ?? []) as unknown as CatalogProductRow[])
    .map(mapCatalogProduct)
    .sort((a, b) => a.name.localeCompare(b.name));
};
