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
import { hardcodedProducts } from "@/lib/productData";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const product = hardcodedProducts.find((p) => slugify(p.name) === slug) || null;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <PromoBanner />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/products")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>

        {!product ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">Product not found.</p>
            <Button onClick={() => navigate("/products")} className="mt-4 bg-nature-gradient text-primary-foreground">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-border bg-secondary/50">
              <img
                src={getProductImage(product.name, product.image_url)}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="text-sm font-medium text-primary">{product.category}</span>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
              <div className="mt-4 text-muted-foreground whitespace-pre-line">{product.description}</div>
              <p className="mt-6 font-display text-3xl font-bold text-foreground">₹{product.price}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>
              <Button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
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
