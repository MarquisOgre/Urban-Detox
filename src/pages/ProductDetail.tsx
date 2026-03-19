import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, ShoppingCart, Leaf, Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getCartProductId } from "@/lib/catalog";
import { useCatalogProducts } from "@/hooks/useCatalogProducts";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { data: products = [], isLoading, error } = useCatalogProducts();
  const product = useMemo(() => products.find((item) => item.slug === slug) ?? null, [products, slug]);
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);

  useEffect(() => {
    setSelectedPlanKey(product?.plans[0]?.key ?? null);
  }, [product?.id]);

  const selectedPlan = product?.plans.find((plan) => plan.key === selectedPlanKey) ?? product?.plans[0] ?? null;
  const activePrice = selectedPlan?.price ?? product?.price ?? 0;

  const handleAddToCart = () => {
    if (!product) return;

    const labelSuffix = selectedPlan ? ` (${selectedPlan.label})` : "";

    addItem({
      id: getCartProductId(product.id, selectedPlan?.key),
      name: `${product.name}${labelSuffix}`,
      price: activePrice,
      image_url: product.image_url,
    });

    toast.success(`${product.name}${labelSuffix} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-background pb-14">
      <PromoBanner />
      <Navbar />
      <main className="container mx-auto px-4 pt-2 pb-14">
        <button
          onClick={() => navigate("/products")}
          className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to products"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">Loading product...</div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-lg text-destructive">Unable to load this product right now.</p>
          </div>
        ) : !product ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">Product not found.</p>
            <Button onClick={() => navigate("/products")} className="mt-4 bg-nature-gradient text-primary-foreground">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            {/* Full-size product image */}
            <div className="overflow-hidden rounded-xl border border-border bg-secondary/50">
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full object-cover"
              />
            </div>

            <div>
              <span className="text-sm font-medium text-primary">{product.category}</span>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
              <div className="mt-4 whitespace-pre-line text-muted-foreground">{product.description}</div>

              {product.ingredients && (
                <div className="mt-5 rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Ingredients</h2>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{product.ingredients}</p>
                </div>
              )}

              {product.health_benefits && (
                <div className="mt-3 rounded-lg border border-border bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Health Benefits</h2>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{product.health_benefits}</p>
                </div>
              )}

              {product.plans.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-medium text-foreground">Select Plan</p>
                  <div className="flex flex-wrap gap-2">
                    {product.plans.map((plan) => (
                      <button
                        key={plan.key}
                        onClick={() => setSelectedPlanKey(plan.key)}
                        className={cn(
                          "relative rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
                          selectedPlan?.key === plan.key
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50",
                        )}
                      >
                        {plan.badge && (
                          <span className="absolute -right-2 -top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                            {plan.badge}
                          </span>
                        )}
                        <span className="block font-semibold">{plan.label}</span>
                        <span className="block text-xs opacity-70">{plan.subLabel}</span>
                        <span className="mt-0.5 block text-xs font-bold">₹{plan.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-6 font-display text-3xl font-bold text-foreground">₹{activePrice}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                ₹{product.price} – ₹{product.maxPrice}
              </p>
              <Button
                onClick={handleAddToCart}
                className="mt-6 bg-nature-gradient text-primary-foreground hover:opacity-90"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
