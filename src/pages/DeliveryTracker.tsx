import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Users, CalendarCheck, CreditCard, BarChart3, RotateCcw, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeliveryDashboard from "@/components/delivery/DeliveryDashboard";
import DailyDeliveryTracker from "@/components/delivery/DailyDeliveryTracker";
import CustomerManagement from "@/components/delivery/CustomerManagement";
import PaymentTracking from "@/components/delivery/PaymentTracking";
import DeliveryReports from "@/components/delivery/DeliveryReports";
import RotationPlanner from "@/components/delivery/RotationPlanner";
import InventoryEstimation from "@/components/delivery/InventoryEstimation";

const DeliveryTracker = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin/login"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (!roles?.some((r) => r.role === "admin")) { navigate("/admin/login"); return; }
      setAuthChecked(true);
    };
    checkAdmin();
  }, [navigate]);

  if (!authChecked) return null;

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Truck className="h-7 w-7 text-primary" />
            Urban Detox — Delivery Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage daily juice deliveries, customers & payments</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-secondary/50 p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card">
              <BarChart3 className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card">
              <CalendarCheck className="h-4 w-4" /> Daily
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card">
              <Users className="h-4 w-4" /> Customers
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card">
              <CreditCard className="h-4 w-4" /> Payments
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card">
              <Package className="h-4 w-4" /> Inventory
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card">
              <BarChart3 className="h-4 w-4" /> Reports
            </TabsTrigger>
            <TabsTrigger value="rotation" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card">
              <RotateCcw className="h-4 w-4" /> Rotation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DeliveryDashboard /></TabsContent>
          <TabsContent value="daily"><DailyDeliveryTracker /></TabsContent>
          <TabsContent value="customers"><CustomerManagement /></TabsContent>
          <TabsContent value="payments"><PaymentTracking /></TabsContent>
          <TabsContent value="inventory"><InventoryEstimation /></TabsContent>
          <TabsContent value="reports"><DeliveryReports /></TabsContent>
          <TabsContent value="rotation"><RotationPlanner /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DeliveryTracker;
