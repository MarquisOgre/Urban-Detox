import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type GeneralSettings = {
  site_name?: string;
  logo_text?: string;
  logo_highlight?: string;
  light_logo_url?: string;
  dark_logo_url?: string;
  favicon_url?: string;
  footer_text?: string;
  footer_credit?: string;
};

export function useGeneralSettings() {
  return useQuery({
    queryKey: ["settings", "general"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "general")
        .maybeSingle();

      return (data?.setting_value as GeneralSettings | null) ?? null;
    },
  });
}
