import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw, Sparkles, Flame } from "lucide-react";

const detoxPlans = [
  {
    title: "Urban Reset",
    duration: "1 Day Detox",
    description: "Quick Body Reset",
    icon: RotateCcw,
    gradient: "from-emerald-500/20 via-green-400/10 to-teal-500/20",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Urban Cleanse",
    duration: "7 Day Program",
    description: "Deep Internal Clean",
    badge: "Most Popular",
    icon: Sparkles,
    gradient: "from-primary/20 via-green-500/10 to-emerald-500/20",
    border: "border-primary/40",
    iconColor: "text-primary",
  },
  {
    title: "Urban Transformation",
    duration: "28 Day Program",
    description: "Full Lifestyle Upgrade",
    badge: "Best Value",
    icon: Flame,
    gradient: "from-amber-500/20 via-orange-400/10 to-yellow-500/20",
    border: "border-amber-500/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

const CategoriesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Choose Your <span className="text-gradient-nature">Detox Journey</span>
          </h2>
          <p className="mt-2 text-muted-foreground">Start fresh with a plan that fits your lifestyle</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {detoxPlans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div
                  className={`group relative overflow-hidden rounded-2xl border ${plan.border} bg-gradient-to-br ${plan.gradient} p-8 text-center transition-all hover:shadow-nature hover:scale-[1.02]`}
                >
                  {plan.badge && (
                    <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground">
                      {plan.badge}
                    </Badge>
                  )}
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background/80 shadow-sm`}>
                    <Icon className={`h-8 w-8 ${plan.iconColor}`} />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-foreground">{plan.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-primary">{plan.duration}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  <Link to="/products">
                    <Button
                      variant="outline"
                      className="mt-6 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      Explore <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
