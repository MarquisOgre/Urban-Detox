import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { motion } from "framer-motion";
import { Leaf, Heart, Shield, Zap, Users, Award } from "lucide-react";

const values = [
  { icon: Leaf, title: "100% Natural", desc: "We use only fresh, organic ingredients — no preservatives, no additives." },
  { icon: Heart, title: "Made with Love", desc: "Every juice is cold-pressed with care to preserve maximum nutrients." },
  { icon: Shield, title: "Quality Assured", desc: "Strict hygiene and quality standards at every step of production." },
  { icon: Zap, title: "Fresh Daily", desc: "Our juices are made fresh every morning and delivered the same day." },
  { icon: Users, title: "Community First", desc: "We source from local organic farmers, supporting the community." },
  { icon: Award, title: "Trusted Brand", desc: "Hundreds of happy customers trust us for their daily wellness needs." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background pb-14">
      <PromoBanner />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-secondary/50 py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl font-bold text-foreground md:text-5xl"
            >
              About <span className="text-gradient-nature">Urban Detox</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-4 max-w-2xl text-muted-foreground"
            >
              We believe in the healing power of nature. Our mission is to make fresh, cold-pressed juices accessible to everyone — helping you live a healthier, more vibrant life, one sip at a time.
            </motion.p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-3xl font-bold text-foreground">
                Our <span className="text-gradient-nature">Story</span>
              </h2>
              <p className="mt-6 leading-relaxed text-muted-foreground">
                Urban Detox was born out of a simple idea — that the best nutrition comes straight from the earth. We started as a small local juice stand in Tirupati, serving fresh wheatgrass shots to health-conscious neighbours. Today, we offer a full range of cold-pressed juices, each crafted to deliver specific health benefits. Our commitment to freshness, purity, and taste remains unchanged.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-secondary/50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-center font-display text-3xl font-bold text-foreground">
              Our <span className="text-gradient-nature">Values</span>
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-card p-6 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <v.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
