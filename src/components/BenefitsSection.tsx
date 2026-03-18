import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Heart, Sparkles, Droplets, Apple, Leaf, FlaskConical, Cherry, Salad } from "lucide-react";
import heroWheatgrass from "@/assets/hero-wheatgrass.jpg";
import heroAshgourd from "@/assets/hero-ashgourd.jpg";
import heroCarrot from "@/assets/hero-carrot.jpg";
import heroBeetroot from "@/assets/hero-beetroot.jpg";
import heroTomato from "@/assets/hero-tomato.jpg";
import heroMixveg from "@/assets/hero-mixveg.jpg";

const juiceData = [
  {
    name: "Wheatgrass",
    icon: Leaf,
    image: heroWheatgrass,
    title: "Nature's Superfood",
    description: "Our cold-pressed wheatgrass juices are packed with essential vitamins, minerals, and enzymes. Every sip delivers powerful nutrients directly from nature to your body, supporting your health journey naturally.",
    benefits: [
      { icon: Shield, title: "Boosts Immunity", desc: "Rich in antioxidants & vitamins" },
      { icon: Zap, title: "Increases Energy", desc: "Natural chlorophyll power" },
      { icon: Heart, title: "Detoxifies Body", desc: "Purifies blood naturally" },
      { icon: Sparkles, title: "Improves Digestion", desc: "Supports gut health" },
    ],
  },
  {
    name: "Ash Gourd",
    icon: Droplets,
    image: heroAshgourd,
    title: "Cooling Wellness",
    description: "Ash gourd juice is a powerful cooling agent that hydrates and detoxifies your body. Known in Ayurveda for its calming properties, it helps reduce acidity and promotes mental clarity.",
    benefits: [
      { icon: Droplets, title: "Hydrates Deeply", desc: "92% natural water content" },
      { icon: Heart, title: "Reduces Acidity", desc: "Alkalizes your body naturally" },
      { icon: Sparkles, title: "Mental Clarity", desc: "Calms the nervous system" },
      { icon: Shield, title: "Weight Management", desc: "Low calorie, high nutrition" },
    ],
  },
  {
    name: "Carrot",
    icon: Apple,
    image: heroCarrot,
    title: "Vision Booster",
    description: "Carrot juice is a beta-carotene powerhouse that supports eye health, skin glow, and immune function. Our fresh-pressed carrot juice retains maximum nutrients for your daily wellness.",
    benefits: [
      { icon: Apple, title: "Eye Health", desc: "Rich in beta-carotene & vitamin A" },
      { icon: Sparkles, title: "Glowing Skin", desc: "Natural antioxidant beauty" },
      { icon: Shield, title: "Immune Support", desc: "Vitamin C & minerals" },
      { icon: Heart, title: "Heart Health", desc: "Lowers cholesterol naturally" },
    ],
  },
  {
    name: "Beetroot",
    icon: Cherry,
    image: heroBeetroot,
    title: "Blood Purifier",
    description: "Beetroot juice is nature's blood purifier, packed with iron, folate, and nitrates that boost stamina, lower blood pressure, and enhance athletic performance naturally.",
    benefits: [
      { icon: Heart, title: "Blood Purification", desc: "Rich in iron & folate" },
      { icon: Zap, title: "Boosts Stamina", desc: "Natural nitrates for energy" },
      { icon: Shield, title: "Lowers BP", desc: "Supports cardiovascular health" },
      { icon: Sparkles, title: "Anti-Inflammatory", desc: "Betalains reduce inflammation" },
    ],
  },
  {
    name: "Tomato",
    icon: FlaskConical,
    image: heroTomato,
    title: "Antioxidant Power",
    description: "Tomato juice is loaded with lycopene, a powerful antioxidant that fights free radicals, supports heart health, and promotes healthy skin from within.",
    benefits: [
      { icon: Shield, title: "Lycopene Rich", desc: "Powerful antioxidant protection" },
      { icon: Heart, title: "Heart Friendly", desc: "Reduces bad cholesterol" },
      { icon: Sparkles, title: "Skin Protection", desc: "UV damage defense" },
      { icon: Zap, title: "Bone Strength", desc: "Vitamin K & calcium" },
    ],
  },
  {
    name: "Mix Veg",
    icon: Salad,
    image: heroMixveg,
    title: "Complete Nutrition",
    description: "Our mix veg juice combines the best of multiple vegetables to deliver a complete nutritional profile. It's the ultimate daily wellness drink for whole-body nourishment.",
    benefits: [
      { icon: Shield, title: "Full Spectrum", desc: "All essential vitamins & minerals" },
      { icon: Zap, title: "Energy Boost", desc: "Sustained natural energy" },
      { icon: Heart, title: "Gut Health", desc: "Fiber-rich blend" },
      { icon: Sparkles, title: "Anti-Aging", desc: "Diverse antioxidant profile" },
    ],
  },
];

const BenefitsSection = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const juice = juiceData[activeIdx];

  return (
    <section className="bg-secondary/50 py-20" id="benefits">
      <div className="container mx-auto px-4">
        {/* Juice Tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {juiceData.map((j, i) => (
            <button
              key={j.name}
              onClick={() => setActiveIdx(i)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                i === activeIdx
                  ? "bg-nature-gradient text-primary-foreground shadow-nature"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              <j.icon className="h-4 w-4" />
              {j.name}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={juice.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid items-center gap-12 lg:grid-cols-2"
          >
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                {juice.title.split(" ")[0]}{" "}
                <span className="text-gradient-nature">{juice.title.split(" ").slice(1).join(" ")}</span>
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{juice.description}</p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {juice.benefits.map((b, i) => (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <b.icon className="h-6 w-6 text-primary" />
                    <h4 className="mt-2 font-display text-sm font-semibold text-foreground">{b.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden rounded-2xl shadow-nature"
            >
              <img src={juice.image} alt={juice.name} className="h-full w-full object-cover" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default BenefitsSection;
