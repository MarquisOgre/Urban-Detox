import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroWheatgrass from "@/assets/hero-wheatgrass.jpg";
import heroAshgourd from "@/assets/hero-ashgourd.jpg";
import heroCarrot from "@/assets/hero-carrot.jpg";
import heroBeetroot from "@/assets/hero-beetroot.jpg";
import heroTomato from "@/assets/hero-tomato.jpg";
import heroMixveg from "@/assets/hero-mixveg.jpg";

const defaultSlides = [
  { image: heroWheatgrass, title: "Wheatgrass Shot", subtitle: "Nature's most powerful green superfood", cta: "Shop Now" },
  { image: heroAshgourd, title: "Ash Gourd Juice", subtitle: "Cool, refreshing & deeply detoxifying", cta: "Explore" },
  { image: heroCarrot, title: "Carrot Juice", subtitle: "Rich in beta-carotene for glowing skin", cta: "Order Now" },
  { image: heroBeetroot, title: "Beetroot Juice", subtitle: "Power-packed for blood purification", cta: "Try It" },
  { image: heroTomato, title: "Tomato Juice", subtitle: "Loaded with lycopene & antioxidants", cta: "Get Yours" },
  { image: heroMixveg, title: "Mix Veg Juice", subtitle: "The ultimate wellness blend", cta: "Discover" },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  const { data: heroSettings } = useQuery({
    queryKey: ["settings", "hero"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("setting_value").eq("setting_key", "hero").maybeSingle();
      return data?.setting_value as { slides: { title: string; subtitle: string; cta: string; image_url?: string }[] } | null;
    },
  });

  const slides = defaultSlides.map((ds, i) => {
    const setting = heroSettings?.slides?.[i];
    return {
      image: setting?.image_url || ds.image,
      title: setting?.title || ds.title,
      subtitle: setting?.subtitle || ds.subtitle,
      cta: setting?.cta || ds.cta,
    };
  });

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative h-[75vh] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-lg"
            >
              <h1 className="font-display text-5xl font-bold text-primary-foreground md:text-6xl">
                {slides[current].title}
              </h1>
              <p className="mt-4 font-body text-lg text-primary-foreground/80">
                {slides[current].subtitle}
              </p>
              <Button
                className="mt-6 bg-nature-gradient text-primary-foreground shadow-nature hover:opacity-90"
                size="lg"
              >
                {slides[current].cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/30 p-2 backdrop-blur transition hover:bg-background/60"
      >
        <ChevronLeft className="h-6 w-6 text-primary-foreground" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/30 p-2 backdrop-blur transition hover:bg-background/60"
      >
        <ChevronRight className="h-6 w-6 text-primary-foreground" />
      </button>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? "w-8 bg-primary-foreground" : "w-2 bg-primary-foreground/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
