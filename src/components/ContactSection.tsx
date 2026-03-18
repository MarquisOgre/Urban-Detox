import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data: general } = useQuery({
    queryKey: ["settings", "general"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("setting_value").eq("setting_key", "general").maybeSingle();
      return data?.setting_value as Record<string, string> | null;
    },
  });

  const phone = general?.phone || "9441561997";
  const email = general?.email || "info@naturesblend.com";
  const address = general?.address || "Tirupati, Andhra Pradesh, 517501";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      message: form.message,
    });
    if (error) {
      toast.error("Failed to send message.");
    } else {
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", phone: "", message: "" });
    }
    setSubmitting(false);
  };

  return (
    <section className="bg-secondary/50 py-20" id="contact">
      <div className="container mx-auto px-4">
        <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">
          Get In <span className="text-gradient-nature">Touch</span>
        </h2>
        <p className="mt-2 text-center text-muted-foreground">Have questions? We'd love to hear from you.</p>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <Input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Textarea placeholder="Message *" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={4} />
            <Button type="submit" disabled={submitting} className="w-full bg-nature-gradient text-primary-foreground hover:opacity-90">
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>

          <div className="space-y-6">
            <h3 className="font-display text-xl font-semibold text-foreground">Contact Information</h3>
            <div className="space-y-4">
              {[
                { icon: Phone, label: "Phone", value: phone },
                { icon: Mail, label: "Email", value: email },
                { icon: MessageCircle, label: "WhatsApp", value: phone },
                { icon: MapPin, label: "Address", value: address },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
