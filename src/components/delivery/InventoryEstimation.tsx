import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, addDays } from "date-fns";
import { Package, TrendingUp } from "lucide-react";

const InventoryEstimation = () => {
  const tomorrow = addDays(new Date(), 1);
  const tomorrowStr = format(tomorrow, "yyyy-MM-dd");
  const dayOfWeek = tomorrow.getDay();

  const { data: customers = [] } = useQuery({
    queryKey: ["delivery-customers-active"],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_customers").select("*").eq("is_active", true).order("villa_number");
      return data || [];
    },
  });

  const { data: customerSubs = [] } = useQuery({
    queryKey: ["customer-subscriptions-all"],
    queryFn: async () => {
      const { data } = await supabase.from("customer_subscriptions").select("*").eq("is_active", true);
      return data || [];
    },
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ["delivery-schedules"],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_schedules").select("*");
      return data || [];
    },
  });

  const { data: existingDeliveries = [] } = useQuery({
    queryKey: ["deliveries", tomorrowStr],
    queryFn: async () => {
      const { data } = await supabase.from("deliveries").select("*").eq("delivery_date", tomorrowStr);
      return data || [];
    },
  });

  // Calculate estimated juice requirements using subscriptions as primary source
  const estimateJuices = () => {
    const juiceCounts: Record<string, { count: number; customers: string[] }> = {};

    // If deliveries already generated, use those
    if (existingDeliveries.length > 0) {
      existingDeliveries.forEach((d) => {
        const customer = customers.find((c) => c.id === d.customer_id);
        const qty = d.quantity || 1;
        if (!juiceCounts[d.juice_type]) juiceCounts[d.juice_type] = { count: 0, customers: [] };
        juiceCounts[d.juice_type].count += qty;
        juiceCounts[d.juice_type].customers.push(`${customer?.villa_number || "?"} (${qty})`);
      });
      return juiceCounts;
    }

    // Otherwise estimate from schedules and preferences
    const eligibleCustomers = customers.filter((c) => {
      if (c.delivery_frequency === "alternate") {
        const start = new Date(c.start_date || new Date());
        const diff = Math.floor((tomorrow.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diff % 2 === 0;
      }
      return true;
    });

    eligibleCustomers
      .sort((a, b) => a.villa_number.localeCompare(b.villa_number, undefined, { numeric: true }))
      .forEach((c) => {
        // Check day-specific schedule first
        const daySchedules = schedules.filter((s) => s.customer_id === c.id && s.day_of_week === dayOfWeek);
        if (daySchedules.length > 0) {
          daySchedules.forEach((s) => {
            if (!juiceCounts[s.juice_type]) juiceCounts[s.juice_type] = { count: 0, customers: [] };
            juiceCounts[s.juice_type].count += 1;
            juiceCounts[s.juice_type].customers.push(`${c.villa_number} (1)`);
          });
          return;
        }

        // Then check customer subscriptions
        const subs = customerSubs.filter((s: any) => s.customer_id === c.id);
        if (subs.length > 0) {
          subs.forEach((s: any) => {
            if (!juiceCounts[s.juice_type]) juiceCounts[s.juice_type] = { count: 0, customers: [] };
            juiceCounts[s.juice_type].count += s.quantity;
            juiceCounts[s.juice_type].customers.push(`${c.villa_number} (${s.quantity})`);
          });
          return;
        }

        // Fallback to preferred juice
        const juice = c.preferred_juice || "Ash Gourd";
        if (!juiceCounts[juice]) juiceCounts[juice] = { count: 0, customers: [] };
        juiceCounts[juice].count += 1;
        juiceCounts[juice].customers.push(`${c.villa_number} (1)`);
      });

    return juiceCounts;
  };

  const juiceCounts = estimateJuices();
  const totalJuices = Object.values(juiceCounts).reduce((sum, j) => sum + j.count, 0);
  const activeJuices = Object.entries(juiceCounts).filter(([_, v]) => v.count > 0).sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Tomorrow's Inventory
            </h3>
            <p className="text-sm text-muted-foreground">
              {format(tomorrow, "EEEE, dd MMM yyyy")}
              {existingDeliveries.length > 0 ? " (from generated deliveries)" : " (estimated from subscriptions)"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{totalJuices}</p>
            <p className="text-xs text-muted-foreground">Total Juices</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeJuices.map(([juice, data]) => (
          <Card key={juice} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-foreground text-sm">{juice}</h4>
              <Badge className="bg-primary/10 text-primary font-bold">{data.count}</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {data.customers
                .sort((a, b) => {
                  const va = a.split(" ")[0];
                  const vb = b.split(" ")[0];
                  return va.localeCompare(vb, undefined, { numeric: true });
                })
                .map((c, i) => (
                  <Badge key={i} variant="outline" className="text-xs">Villa {c}</Badge>
                ))}
            </div>
          </Card>
        ))}
      </div>

      {activeJuices.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          No deliveries estimated for tomorrow. Add customers or generate deliveries first.
        </Card>
      )}

      {activeJuices.length > 0 && (
        <Card className="p-4">
          <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Juice Distribution
          </h3>
          <div className="space-y-2">
            {activeJuices.map(([juice, data]) => (
              <div key={juice} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-28 shrink-0">{juice}</span>
                <div className="flex-1 bg-secondary rounded-full h-5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all flex items-center justify-end pr-1"
                    style={{ width: `${Math.max((data.count / totalJuices) * 100, 10)}%` }}
                  >
                    <span className="text-[10px] font-bold text-primary-foreground">{data.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default InventoryEstimation;
