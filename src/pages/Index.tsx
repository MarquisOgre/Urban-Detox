import Navbar from "@/components/Navbar";
import PromoBanner from "@/components/PromoBanner";
import HeroSlider from "@/components/HeroSlider";
import CategoriesSection from "@/components/CategoriesSection";
import BenefitsSection from "@/components/BenefitsSection";
import CustomiseJuiceBanner from "@/components/CustomiseJuiceBanner";
import PortfolioSection from "@/components/PortfolioSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-14">
      <PromoBanner />
      <Navbar />
      <HeroSlider />
      <CategoriesSection />
      <CustomiseJuiceBanner />
      <BenefitsSection />
      <PortfolioSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
