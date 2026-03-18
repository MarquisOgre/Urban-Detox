import { useEffect } from "react";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";

const FaviconManager = () => {
  const { data: general } = useGeneralSettings();

  useEffect(() => {
    if (!general?.favicon_url) return;

    let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href = general.favicon_url;
  }, [general?.favicon_url]);

  return null;
};

export default FaviconManager;
