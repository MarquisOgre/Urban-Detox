import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Droplets, Apple, Leaf, FlaskConical, Cherry, Salad } from "lucide-react";
import { hardcodedProducts } from "@/lib/productData";

const categoryMeta: Record<string, { icon: any; description: string }> = {
  Wheatgrass: { icon: Leaf, description: "Fresh organic wheatgrass shots" },
  "Ash Gourd": { icon: Droplets, description: "Cooling detox juices" },
  Carrot: { icon: Apple, description: "Beta-carotene rich blends" },
  Beetroot: { icon: Cherry, description: "Blood purifying elixirs" },
  Tomato: { icon: FlaskConical, description: "Antioxidant powerhouse" },
  "Mix Veg": { icon: Salad, description: "Ultimate wellness combo" },
};

const CategoriesSection = () => {
  const products = hardcodedProducts;
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Our <span className="text-gradient-nature">Categories</span>
          </h2>
          <p className="mt-2 text-muted-foreground">Explore our range of natural juice products</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((catName, i) => {
            const meta = categoryMeta[catName] || { icon: Leaf, description: "" };
            const Icon = meta.icon;
            const count = products.filter((p) => p.category === catName).length;
            return (
              <motion.div
                key={catName}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/products?category=${encodeURIComponent(catName)}`}
                  className="group block cursor-pointer rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:shadow-nature hover:border-primary/30"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-sm font-semibold text-foreground">{catName}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
                  {count > 0 && (
                    <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {count} products
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
