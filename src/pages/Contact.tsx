import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import ContactSection from "@/components/ContactSection";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background pb-14">
      <PromoBanner />
      <Navbar />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Contact;
