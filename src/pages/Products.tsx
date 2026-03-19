import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { getCartProductId } from "@/lib/catalog";
import { useCatalogProducts } from "@/hooks/useCatalogProducts";

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">("name");
  const { addItem } = useCart();
  const { data: products = [], isLoading, error } = useCatalogProducts();

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

  const handleAddToCart = (e: React.MouseEvent, product: (typeof products)[number]) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultPlan = product.plans[0];
    const labelSuffix = defaultPlan ? ` (${defaultPlan.label})` : "";

    addItem({
      id: getCartProductId(product.id, defaultPlan?.key),
      name: `${product.name}${labelSuffix}`,
      price: defaultPlan?.price ?? product.price,
      image_url: product.image_url,
    });

    toast.success(`${product.name}${labelSuffix} added to cart!`);
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

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-nature-gradient text-primary-foreground" : ""}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
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
    </div>
  );
};

export default Products;
