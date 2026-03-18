import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  imageClassName?: string;
  iconClassName?: string;
  textClassName?: string;
  highlightClassName?: string;
};

const getSystemDark = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

const SiteLogo = ({
  className,
  imageClassName,
  iconClassName,
  textClassName,
  highlightClassName,
}: SiteLogoProps) => {
  const { data: general } = useGeneralSettings();
  const { theme } = useTheme();
  const [isSystemDark, setIsSystemDark] = useState(getSystemDark);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setIsSystemDark(mediaQuery.matches);

    handler();
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const isDark = theme === "dark" || (theme === "system" && isSystemDark);
  const logoUrl = isDark
    ? general?.dark_logo_url || general?.light_logo_url
    : general?.light_logo_url || general?.dark_logo_url;

  const siteName = general?.site_name || "Urban Detox";
  const logoText = general?.logo_text || general?.site_name || "Nature's";
  const logoHighlight = general?.logo_highlight || "Blend";

  return (
  <div className={cn("flex items-center gap-2", className)}>
    {logoUrl ? (
      <img
        src={logoUrl}
        alt={`${siteName} logo`}
        className={cn("h-10 w-auto object-contain", imageClassName)}
      />
    ) : (
      <>
        <Leaf className={cn("h-8 w-8 text-primary", iconClassName)} />
        <span className={cn("font-display text-xl font-bold text-primary", textClassName)}>
          {logoText}{" "}
          <span className={cn("text-nature-amber", highlightClassName)}>
            {logoHighlight}
          </span>
        </span>
      </>
    )}
  </div>
);
};

export default SiteLogo;
