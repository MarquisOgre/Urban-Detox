import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import SiteLogo from "@/components/SiteLogo";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";

const Footer = () => {
  const { data: general } = useGeneralSettings();

  const footerText = general?.footer_text || "© 2026 Nature's Blend. All rights reserved.";
  const footerCredit = general?.footer_credit || "Dexorzo Creations";

  return (
    <footer className="border-t border-border bg-card py-2">
      <div className="container mx-auto flex items-center justify-center gap-4 px-4 text-center">
        <Link to="/" className="flex items-center gap-2">
          <SiteLogo imageClassName="h-10 w-auto" iconClassName="h-5 w-5" textClassName="font-display text-sm font-bold text-primary" />
        </Link>
        <span className="text-muted-foreground">|</span>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {footerText} Made with <Heart className="h-3 w-3 text-destructive" /> by {footerCredit}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
