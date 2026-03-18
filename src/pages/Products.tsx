import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Filter } from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/slugify";
import { getProductImage } from "@/lib/productImages";
import { hardcodedProducts } from "@/lib/productData";

const categories = ["All", "Wheatgrass", "Ash Gourd", "Carrot", "Beetroot", "Tomato", "Mix Veg"];

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">("name");
  const { addItem } = useCart();

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const products = hardcodedProducts;

  const filtered = products
    .filter((p) => selectedCategory === "All" || p.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

  const handleAddToCart = (e: React.MouseEvent, product: (typeof products)[0]) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <PromoBanner />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Our <span className="text-gradient-nature">Juices</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Fresh, cold-pressed juices delivered to your doorstep</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Filter className="h-5 w-5 text-muted-foreground" />
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "bg-nature-gradient text-primary-foreground" : ""}
            >
              {cat}
            </Button>
          ))}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="ml-auto rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <Link key={product.id} to={`/products/${slugify(product.name)}`}>
              <Card className="group overflow-hidden transition-all hover:shadow-nature hover:border-primary/30">
                <div className="aspect-square overflow-hidden bg-secondary/50">
                  <img
                    src={getProductImage(product.name, product.image_url)}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs font-medium text-primary">{product.category}</span>
                  <h3 className="mt-1 font-display text-sm font-semibold text-foreground">{product.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-foreground">
                      {product.variations && product.variations.length > 0
                        ? `From ₹${Math.min(...product.variations.map(v => v.price))}`
                        : `₹${product.price}`}
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
      </main>
      <Footer />
    </div>
  );
};

export default Products;
