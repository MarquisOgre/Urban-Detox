import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getCartProductId, type CatalogProduct, type CatalogPlan } from "@/lib/catalog";
import { useCatalogProducts } from "@/hooks/useCatalogProducts";
import PlanSelectorDialog from "@/components/PlanSelectorDialog";

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">("name");
  const { addItem } = useCart();
  const { data: products = [], isLoading, error } = useCatalogProducts();

  // Plan selector state
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planDialogProduct, setPlanDialogProduct] = useState<CatalogProduct | null>(null);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) setSelectedCategory(category);
  }, [searchParams]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category))).sort((a, b) => a.localeCompare(b))],
    [products],
  );

  const filtered = useMemo(() => {
    return products
      .filter((product) => selectedCategory === "All" || product.category === selectedCategory)
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.maxPrice - a.maxPrice;
        return a.name.localeCompare(b.name);
      });
  }, [products, selectedCategory, sortBy]);

  const handleAddToCart = (e: React.MouseEvent, product: CatalogProduct) => {
    e.preventDefault();
    e.stopPropagation();
    setPlanDialogProduct(product);
    setPlanDialogOpen(true);
  };

  const handleSelectPlan = (product: CatalogProduct, plan: CatalogPlan) => {
    addItem({
      id: getCartProductId(product.id, plan.key),
      name: `${product.name} (${plan.label})`,
      price: plan.price,
      image_url: product.image_url,
    });
    toast.success(`${product.name} (${plan.label}) added to cart!`);
    setPlanDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-14">
      <PromoBanner />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="shrink-0">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Our <span className="text-gradient-nature">Juices</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Fresh, cold-pressed & delivered</p>
          </div>
          <Link to="/customise">
            <Button variant="outline" size="sm" className="mt-2 border-primary text-primary hover:bg-primary/10">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Customise Your Juice
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <p className="mt-12 text-center text-muted-foreground">Loading juices...</p>
        ) : error ? (
          <p className="mt-12 text-center text-destructive">Unable to load products right now.</p>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((product) => (
                <Link key={product.id} to={`/products/${product.slug}`}>
                  <Card className="group overflow-hidden transition-all hover:border-primary/30 hover:shadow-nature">
                    <div className="aspect-square overflow-hidden bg-secondary/50">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-medium text-primary">{product.category}</span>
                      <h3 className="mt-1 font-display text-sm font-semibold text-foreground">{product.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="font-display text-lg font-bold text-foreground">
                          ₹{product.price} – ₹{product.maxPrice}
                        </span>
                        <Button
                          size="sm"
                          onClick={(e) => handleAddToCart(e, product)}
                          className="bg-nature-gradient text-primary-foreground hover:opacity-90"
                        >
                          <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="mt-12 text-center text-muted-foreground">No products found in this category.</p>
            )}
          </>
        )}
      </main>
      <Footer />

      <PlanSelectorDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        product={planDialogProduct}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  );
};

export default Products;
