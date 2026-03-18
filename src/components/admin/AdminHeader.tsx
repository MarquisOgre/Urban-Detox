import { Link, useLocation } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import SiteLogo from "@/components/SiteLogo";

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const title = location.pathname === "/admin/settings" ? "Settings" : "Admin Dashboard";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {location.pathname === "/admin/settings" && (
            <Link to="/admin" className="text-muted-foreground hover:text-foreground">←</Link>
          )}
          <Link to="/" className="flex items-center gap-2">
            <SiteLogo imageClassName="h-10 w-auto" iconClassName="h-7 w-7" textClassName="font-display text-lg font-bold text-primary" />
          </Link>
        </div>
        <h1 className="font-display text-xl font-bold text-foreground">{title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/settings"><Settings className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-1">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
