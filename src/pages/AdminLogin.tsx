import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import SiteLogo from "@/components/SiteLogo";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      // Check if user has admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        if (roles?.some((r) => r.role === "admin")) {
          toast.success("Welcome, Admin!");
          navigate("/admin");
        } else {
          await supabase.auth.signOut();
          toast.error("Access denied. Admin privileges required.");
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm p-8">
        <div className="flex items-center justify-center gap-2">
          <SiteLogo imageClassName="h-8 w-8" iconClassName="h-8 w-8" textClassName="font-display text-xl font-bold text-primary" />
        </div>
        <h2 className="mt-4 text-center font-display text-xl font-bold text-foreground">Admin Login</h2>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <Input placeholder="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" disabled={loading} className="w-full bg-nature-gradient text-primary-foreground">
            <Lock className="mr-2 h-4 w-4" />
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
