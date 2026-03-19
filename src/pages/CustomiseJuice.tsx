import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Leaf, Sparkles, Plus as PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MAIN_VEG = [
  { id: "ash-gourd", name: "Ash Gourd", emoji: "🥒" },
  { id: "beetroot", name: "Beetroot", emoji: "🫒" },
  { id: "carrot", name: "Carrot", emoji: "🥕" },
  { id: "cucumber", name: "Cucumber", emoji: "🥒" },
  { id: "tomato", name: "Tomato", emoji: "🍅" },
];

const SUPPORTING_VEG = [
  { id: "spinach", name: "Spinach", emoji: "🥬" },
  { id: "celery", name: "Celery", emoji: "🥦" },
  { id: "ginger", name: "Ginger", emoji: "🫚" },
  { id: "amla", name: "Amla", emoji: "🫒" },
  { id: "lemon", name: "Lemon", emoji: "🍋" },
  { id: "mint", name: "Mint", emoji: "🌿" },
];

const ADD_ONS = [
  { id: "wheatgrass", name: "Wheatgrass Shot", emoji: "🌱" },
  { id: "turmeric", name: "Turmeric", emoji: "🟡" },
  { id: "black-pepper", name: "Black Pepper", emoji: "⚫" },
  { id: "honey", name: "Honey", emoji: "🍯" },
  { id: "chia-seeds", name: "Chia Seeds", emoji: "🫘" },
  { id: "flax-seeds", name: "Flax Seeds", emoji: "🌾" },
];

const PLANS = [
  { key: "reset", label: "Urban Reset", subLabel: "1 Day Detox", price: 99 },
  { key: "cleanse", label: "Urban Cleanse", subLabel: "7 Day Detox", price: 599 },
  { key: "transform", label: "Urban Transform", subLabel: "30 Day Detox", price: 2299, badge: "Best Value" },
];

const CustomiseJuice = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [mainVeg, setMainVeg] = useState<string | null>(null);
  const [supportingVeg, setSupportingVeg] = useState<string[]>([]);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0].key);

  const toggleSupporting = (id: string) => {
    setSupportingVeg((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const toggleAddOn = (id: string) => {
    setAddOns((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const plan = PLANS.find((p) => p.key === selectedPlan) ?? PLANS[0];
  const isValid = !!mainVeg;

  const summary = useMemo(() => {
    const parts: string[] = [];
    const m = MAIN_VEG.find((v) => v.id === mainVeg);
    if (m) parts.push(m.name);
    supportingVeg.forEach((id) => {
      const s = SUPPORTING_VEG.find((v) => v.id === id);
      if (s) parts.push(s.name);
    });
    addOns.forEach((id) => {
      const a = ADD_ONS.find((v) => v.id === id);
      if (a) parts.push(a.name);
    });
    return parts.join(" + ");
  }, [mainVeg, supportingVeg, addOns]);

  const handleAddToCart = () => {
    if (!isValid) {
      toast.error("Please select a main vegetable.");
      return;
    }
    addItem({
      id: `custom:${mainVeg}:${supportingVeg.join("-")}:${addOns.join("-")}:${plan.key}`,
      name: `Custom Juice: ${summary} (${plan.label})`,
      price: plan.price,
      image_url: null,
    });
    toast.success("Custom juice added to cart!");
  };

  return (
    <div className="min-h-screen bg-background pb-14">
      <PromoBanner />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Customise <span className="text-gradient-nature">Your Juice</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Build your perfect blend by choosing your ingredients below.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Selection area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Veg */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-bold text-foreground">Main Vegetable <span className="text-destructive">*</span></h2>
                <span className="text-xs text-muted-foreground">(Pick 1)</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {MAIN_VEG.map((veg) => (
                  <button
                    key={veg.id}
                    onClick={() => setMainVeg(veg.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all",
                      mainVeg === veg.id
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl">{veg.emoji}</span>
                    <span className="text-sm font-medium text-foreground">{veg.name}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Supporting Veg */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-bold text-foreground">Supporting Vegetables</h2>
                <span className="text-xs text-muted-foreground">(Pick up to 3)</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {SUPPORTING_VEG.map((veg) => (
                  <button
                    key={veg.id}
                    onClick={() => toggleSupporting(veg.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all",
                      supportingVeg.includes(veg.id)
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-xl">{veg.emoji}</span>
                    <span className="text-xs font-medium text-foreground">{veg.name}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Add-ons */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <PlusIcon className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-bold text-foreground">Add-ons</h2>
                <span className="text-xs text-muted-foreground">(Pick up to 3)</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {ADD_ONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleAddOn(item.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all",
                      addOns.includes(item.id)
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-xs font-medium text-foreground">{item.name}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Summary sidebar */}
          <div className="lg:sticky lg:top-24">
            <Card className="p-5 space-y-5">
              <h3 className="font-display text-lg font-bold text-foreground">Your Blend</h3>

              {isValid ? (
                <div className="rounded-lg border border-border bg-secondary/30 p-3">
                  <p className="text-sm font-medium text-foreground">{summary}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select a main vegetable to start.</p>
              )}

              {/* Plan selection */}
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Select Plan</p>
                <div className="space-y-2">
                  {PLANS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPlan(p.key)}
                      className={cn(
                        "relative w-full rounded-lg border-2 px-4 py-3 text-left text-sm transition-all",
                        selectedPlan === p.key
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {p.badge && (
                        <span className="absolute -right-2 -top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                          {p.badge}
                        </span>
                      )}
                      <span className="font-semibold text-foreground">{p.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{p.subLabel}</span>
                      <span className="float-right font-bold text-foreground">₹{p.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between font-display text-xl font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">₹{plan.price}</span>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!isValid}
                className="w-full bg-nature-gradient text-primary-foreground hover:opacity-90"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>

              <Button variant="outline" className="w-full" onClick={() => navigate("/products")}>
                ← Back to Products
              </Button>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomiseJuice;
