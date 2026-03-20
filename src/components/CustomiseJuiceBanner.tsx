import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

const CustomiseJuiceBanner = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="relative overflow-hidden rounded-2xl bg-nature-gradient p-8 md:p-12">
        <div className="relative z-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
              <h2 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
                Customise Your Juice
              </h2>
            </div>
            <p className="mt-2 max-w-lg text-primary-foreground/80">
              Build your perfect blend! Choose your main veg, supporting veggies & add-ons for a juice that's uniquely yours.
            </p>
          </div>
          <Link to="/customise">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 font-semibold shadow-lg"
            >
              Start Building <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-foreground/10" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary-foreground/5" />
      </div>
    </section>
  );
};

export default CustomiseJuiceBanner;
