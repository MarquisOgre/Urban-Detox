import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const defaultFaqs = [
  { question: "What juices do you offer?", answer: "We offer Wheatgrass Shot, Ash Gourd Juice, Carrot Juice, Beetroot Juice, Tomato Juice, and Mix Veg Juice — all cold-pressed and freshly made." },
  { question: "Are your juices organic?", answer: "Yes, all our vegetables and grasses are sourced from certified organic farms to ensure the highest quality and nutritional value." },
  { question: "How should I store the juices?", answer: "Keep refrigerated and consume within 24 hours for maximum freshness and nutrient retention." },
  { question: "Do you deliver?", answer: "Yes! We deliver within the city limits. Orders placed before 10 AM are delivered the same day." },
  { question: "Can I subscribe for daily delivery?", answer: "Absolutely! We offer daily, weekly, and monthly subscription plans at discounted prices." },
];

const FAQSection = () => {
  const { data } = useQuery({
    queryKey: ["settings", "faq"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("setting_value").eq("setting_key", "faq").maybeSingle();
      return (data?.setting_value as { items: { question: string; answer: string }[] })?.items || null;
    },
  });

  const faqs = data || defaultFaqs;

  return (
    <section className="py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">
          Frequently Asked <span className="text-gradient-nature">Questions</span>
        </h2>
        <p className="mt-2 text-center text-muted-foreground">Find answers about our products</p>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="font-display text-left font-semibold text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
