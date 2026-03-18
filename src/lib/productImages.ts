// Static product image mapping by product name
import wheatgrassShot from "@/assets/products/wheatgrass-shot.jpg";
import wheatgrassComboPack from "@/assets/products/wheatgrass-combo-pack.jpg";
import immunityBoosterSet from "@/assets/products/immunity-booster-set.jpg";
import ashGourdJuice from "@/assets/products/ash-gourd-juice.jpg";
import ashGourdDetoxPack from "@/assets/products/ash-gourd-detox-pack.jpg";
import weightLossPack from "@/assets/products/weight-loss-pack.jpg";
import carrotJuice from "@/assets/products/carrot-juice.jpg";
import carrotGingerBlend from "@/assets/products/carrot-ginger-blend.jpg";
import beetrootJuice from "@/assets/products/beetroot-juice.jpg";
import beetrootPowerPack from "@/assets/products/beetroot-power-pack.jpg";
import tomatoJuice from "@/assets/products/tomato-juice.jpg";
import tomatoBasilBlend from "@/assets/products/tomato-basil-blend.jpg";
import mixVegJuice from "@/assets/products/mix-veg-juice.jpg";
import mixVegPremium from "@/assets/products/mix-veg-premium.jpg";
import dailyDetoxPack from "@/assets/products/daily-detox-pack.jpg";
import familyWellnessPack from "@/assets/products/family-wellness-pack.jpg";

const productImageMap: Record<string, string> = {
  "Wheatgrass Shot": wheatgrassShot,
  "Wheatgrass Combo Pack": wheatgrassComboPack,
  "Immunity Booster Set": immunityBoosterSet,
  "Ash Gourd Juice": ashGourdJuice,
  "Ash Gourd Detox Pack": ashGourdDetoxPack,
  "Weight Loss Pack": weightLossPack,
  "Carrot Juice": carrotJuice,
  "Carrot Ginger Blend": carrotGingerBlend,
  "Beetroot Juice": beetrootJuice,
  "Beetroot Power Pack": beetrootPowerPack,
  "Tomato Juice": tomatoJuice,
  "Tomato Basil Blend": tomatoBasilBlend,
  "Mix Veg Juice": mixVegJuice,
  "Mix Veg Premium": mixVegPremium,
  "Daily Detox Pack": dailyDetoxPack,
  "Family Wellness Pack": familyWellnessPack,
};

export function getProductImage(name: string, dbImageUrl?: string | null): string {
  // If the product has a custom uploaded image (not placeholder), use it
  if (dbImageUrl && dbImageUrl !== "/placeholder.svg" && !dbImageUrl.includes("placeholder")) {
    return dbImageUrl;
  }
  // Otherwise fall back to the static map
  return productImageMap[name] || "/placeholder.svg";
}

export default productImageMap;
