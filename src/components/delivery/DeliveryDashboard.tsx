import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Truck, CheckCircle, Clock, SkipForward, Users, IndianRupee } from "lucide-react";
import { format } from "date-fns";

const DeliveryDashboard = () => {
  const today = format(new Date(), "yyyy-MM-dd");
  const currentMonth = format(new Date(), "yyyy-MM");

  const { data: deliveries = [] } = useQuery({
    queryKey: ["deliveries-today", today],
    queryFn: async () => {
      const { data } = await supabase.from("deliveries").select("*").eq("delivery_date", today);
      return data || [];
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["delivery-customers"],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_customers").select("*").eq("is_active", true);
      return data || [];
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["delivery-payments", currentMonth],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_payments").select("*").eq("month", currentMonth);
      return data || [];
    },
  });

  const totalJuices = deliveries.reduce((s, d) => s + (d.quantity || 1), 0);
  const deliveredJuices = deliveries.filter((d) => d.status === "delivered").reduce((s, d) => s + (d.quantity || 1), 0);
  const pendingJuices = deliveries.filter((d) => d.status === "pending").reduce((s, d) => s + (d.quantity || 1), 0);
  const skippedJuices = deliveries.filter((d) => d.status === "skipped").reduce((s, d) => s + (d.quantity || 1), 0);
  const paidAmount = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const pendingAmount = payments.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);

  const stats = [
    { label: "Total Juices", value: totalJuices, icon: Truck, color: "text-primary" },
    { label: "Delivered", value: deliveredJuices, icon: CheckCircle, color: "text-green-600" },
    { label: "Pending", value: pendingJuices, icon: Clock, color: "text-yellow-600" },
    { label: "Skipped", value: skippedJuices, icon: SkipForward, color: "text-red-500" },
    { label: "Active Customers", value: customers.length, icon: Users, color: "text-primary" },
    { label: "Collected (₹)", value: paidAmount, icon: IndianRupee, color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-3 p-4">
            <s.icon className={`h-7 w-7 ${s.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick summary */}
      <Card className="p-4 space-y-3">
        <h3 className="font-display font-bold text-foreground">Monthly Payments — {format(new Date(), "MMMM yyyy")}</h3>
        <div className="flex gap-6 text-sm">
          <div><span className="text-muted-foreground">Collected:</span> <span className="font-bold text-green-600">₹{paidAmount}</span></div>
          <div><span className="text-muted-foreground">Pending:</span> <span className="font-bold text-yellow-600">₹{pendingAmount}</span></div>
        </div>
      </Card>

      {/* Pending deliveries alert */}
      {pendingJuices > 0 && (
        <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-4">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            ⚠️ {pendingJuices} juices still pending for today. Switch to the Daily tab to update.
          </p>
        </Card>
      )}
    </div>
  );
};

export default DeliveryDashboard;
