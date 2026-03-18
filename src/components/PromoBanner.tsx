import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { useState } from "react";

const PromoBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  const { data } = useQuery({
    queryKey: ["settings", "banner"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("setting_value").eq("setting_key", "banner").maybeSingle();
      return data?.setting_value as { enabled: boolean; text: string; bg_color: string; text_color: string } | null;
    },
  });

  if (!data?.enabled || !data.text || dismissed) return null;

  return (
    <div
      className="relative flex items-center justify-center px-4 py-1.5 text-center text-xs font-medium"
      style={{ backgroundColor: data.bg_color || "hsl(145,45%,28%)", color: data.text_color || "#ffffff" }}
    >
      <span>{data.text}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default PromoBanner;
