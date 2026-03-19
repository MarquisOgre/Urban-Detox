import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/slugify";
import { getProductImage } from "@/lib/productImages";
import { hardcodedProducts, ProductVariation } from "@/lib/productData";
import { cn } from "@/lib/utils";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const product = hardcodedProducts.find((p) => slugify(p.name) === slug) || null;

  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(
    product?.variations?.[0] || null
  );
  const [selectedImage, setSelectedImage] = useState(0);

  const images = product
    ? [product.image_url, product.image_url_2, product.image_url_3].filter(Boolean) as string[]
    : [];

  const activePrice = selectedVariation?.price ?? product?.price ?? 0;

  const handleAddToCart = () => {
    if (!product) return;
    const label = selectedVariation ? ` (${selectedVariation.label})` : "";
    addItem({
      id: selectedVariation?.id || product.id,
      name: `${product.name}${label}`,
      price: activePrice,
      image_url: product.image_url,
    });
    toast.success(`${product.name}${label} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-background pb-14">
      <PromoBanner />
      <Navbar />
      <main className="container mx-auto px-4 pt-2 pb-14">
        <button onClick={() => navigate("/products")} className="mb-2 inline-flex items-center justify-center rounded-full h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>

        {!product ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">Product not found.</p>
            <Button onClick={() => navigate("/products")} className="mt-4 bg-nature-gradient text-primary-foreground">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {/* Images */}
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-border bg-secondary/50">
                <img
                  src={getProductImage(product.name, images[selectedImage] || product.image_url)}
                  alt={product.name}
                  className="w-full object-cover max-h-[calc(100vh-220px)]"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        "h-16 w-16 overflow-hidden rounded-lg border-2 transition-all",
                        selectedImage === i ? "border-primary ring-2 ring-primary/30" : "border-border opacity-70 hover:opacity-100"
                      )}
                    >
                      <img
                        src={getProductImage(product.name, img)}
                        alt={`${product.name} ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <span className="text-sm font-medium text-primary">{product.category}</span>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
              <div className="mt-4 text-muted-foreground whitespace-pre-line">{product.description}</div>

              {/* Variations */}
              {product.variations && product.variations.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-foreground mb-2">Select Plan</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variations.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariation(v)}
                        className={cn(
                          "rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all relative",
                          selectedVariation?.id === v.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {v.badge && (
                          <span className="absolute -top-2 -right-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                            {v.badge}
                          </span>
                        )}
                        <span className="block font-semibold">{v.label}</span>
                        <span className="block text-xs opacity-70">{v.subLabel}</span>
                        <span className="block text-xs font-bold mt-0.5">₹{v.price}</span>
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
