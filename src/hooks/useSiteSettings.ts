import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSiteSettings(key: string) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", key)
      .maybeSingle()
      .then(({ data: row }) => {
        if (row) setData(row.setting_value as Record<string, any>);
        setLoading(false);
      });
  }, [key]);

  const save = useCallback(
    async (value: Record<string, any>) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ setting_value: value as any, updated_at: new Date().toISOString() })
        .eq("setting_key", key);
      if (error) {
        toast.error("Failed to save settings");
      } else {
        setData(value);
        queryClient.setQueryData(["settings", key], value);
        toast.success("Settings saved!");
      }
    },
    [key, queryClient]
  );

  return { data, loading, save };
}
