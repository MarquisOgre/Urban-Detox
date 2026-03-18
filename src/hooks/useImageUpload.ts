import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function uploadImage(file: File, path: string): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const filePath = `${path}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("site-assets").upload(filePath, file, { upsert: true });
  if (error) {
    toast.error("Upload failed: " + error.message);
    return null;
  }

  const { data } = supabase.storage.from("site-assets").getPublicUrl(filePath);
  return data.publicUrl;
}
