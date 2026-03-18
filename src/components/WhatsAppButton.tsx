import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const WhatsAppButton = () => {
  const { data } = useQuery({
    queryKey: ["settings", "whatsapp"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("setting_value").eq("setting_key", "whatsapp").maybeSingle();
      return data?.setting_value as { enabled: boolean; number: string; default_message: string } | null;
    },
  });

  if (!data?.enabled || !data.number) return null;

  const url = `https://wa.me/${data.number}?text=${encodeURIComponent(data.default_message || "")}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};

export default WhatsAppButton;
