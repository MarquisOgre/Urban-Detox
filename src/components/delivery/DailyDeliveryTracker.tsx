import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format, addDays, subDays } from "date-fns";
import { CheckCircle, Clock, SkipForward, Pause, ChevronLeft, ChevronRight, Printer, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const JUICE_TYPES = ["Ash Gourd", "Beetroot", "Carrot", "Cucumber", "Mix Veg", "Tomato", "Wheatgrass"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300", icon: Clock },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300", icon: CheckCircle },
  skipped: { label: "Skipped", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300", icon: SkipForward },
  on_hold: { label: "On Hold", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: Pause },
};

const DailyDeliveryTracker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ["delivery-customers-active"],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_customers").select("*").eq("is_active", true).order("villa_number");
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

  const { data: deliveries = [], refetch } = useQuery({
    queryKey: ["deliveries", dateStr],
    queryFn: async () => {
      const { data } = await supabase.from("deliveries").select("*").eq("delivery_date", dateStr);
      return data || [];
    },
  });

  const getJuiceForCustomer = (customerId: string) => {
    const dayOfWeek = selectedDate.getDay();
    const schedule = schedules.find((s) => s.customer_id === customerId && s.day_of_week === dayOfWeek);
    if (schedule) return schedule.juice_type;
    const customer = customers.find((c) => c.id === customerId);
    return customer?.preferred_juice || "Ash Gourd";
  };

  const generateDeliveries = async () => {
    const existing = deliveries.map((d) => d.customer_id);
    const newDeliveries = customers
      .filter((c) => !existing.includes(c.id))
      .filter((c) => {
        if (c.delivery_frequency === "alternate") {
          const start = new Date(c.start_date || new Date());
          const diff = Math.floor((selectedDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return diff % 2 === 0;
        }
        return true;
      })
      .map((c) => ({
        customer_id: c.id,
        delivery_date: dateStr,
        juice_type: getJuiceForCustomer(c.id),
        status: "pending" as const,
      }));

    if (newDeliveries.length === 0) {
      toast.info("All deliveries already generated for this date");
      return;
    }

    const { error } = await supabase.from("deliveries").insert(newDeliveries);
    if (error) { toast.error("Failed to generate deliveries"); return; }
    toast.success(`${newDeliveries.length} deliveries generated`);
    refetch();
  };

  const updateStatus = async (deliveryId: string, status: string) => {
    const { error } = await supabase.from("deliveries").update({ status, updated_at: new Date().toISOString() }).eq("id", deliveryId);
    if (error) { toast.error("Failed to update"); return; }
    refetch();
    queryClient.invalidateQueries({ queryKey: ["deliveries-today"] });
  };

  const updateNote = async (deliveryId: string, notes: string) => {
    await supabase.from("deliveries").update({ notes }).eq("id", deliveryId);
  };

  const delivered = deliveries.filter((d) => d.status === "delivered").length;
  const pending = deliveries.filter((d) => d.status === "pending").length;
  const skipped = deliveries.filter((d) => d.status === "skipped").length;

  const exportCSV = () => {
    const rows = deliveries.map((d) => {
      const c = customers.find((cu) => cu.id === d.customer_id);
      return `${c?.name || ""},${c?.villa_number || ""},${d.juice_type},${d.status},${d.notes || ""}`;
    });
    const csv = `Name,Villa,Juice,Status,Notes\n${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `deliveries-${dateStr}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported!");
  };

  const printSheet = () => window.print();

  return (
    <div className="space-y-4">
      {/* Date navigation & summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="font-display font-bold text-foreground">{format(selectedDate, "EEEE")}</p>
              <p className="text-sm text-muted-foreground">{format(selectedDate, "dd MMM yyyy")}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={generateDeliveries} className="bg-primary text-primary-foreground">
              <RefreshCw className="h-3 w-3 mr-1" /> Generate
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-3 w-3 mr-1" /> CSV</Button>
            <Button variant="outline" size="sm" onClick={printSheet}><Printer className="h-3 w-3 mr-1" /> Print</Button>
          </div>
        </div>
        <div className="flex gap-4 mt-3 text-sm">
          <span className="text-muted-foreground">Total: <strong className="text-foreground">{deliveries.length}</strong></span>
          <span className="text-green-600">✓ {delivered}</span>
          <span className="text-yellow-600">⏳ {pending}</span>
          <span className="text-red-500">⏭ {skipped}</span>
        </div>
      </Card>

      {/* Delivery list */}
      <div className="space-y-2">
        {deliveries.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            No deliveries for this date. Click "Generate" to create from active customers.
          </Card>
        )}
        {deliveries
          .sort((a, b) => {
            const ca = customers.find((c) => c.id === a.customer_id);
            const cb = customers.find((c) => c.id === b.customer_id);
            return (ca?.villa_number || "").localeCompare(cb?.villa_number || "", undefined, { numeric: true });
          })
          .map((d) => {
            const customer = customers.find((c) => c.id === d.customer_id);
            const sc = statusConfig[d.status] || statusConfig.pending;
            const Icon = sc.icon;
            return (
              <Card key={d.id} className={`p-3 transition-all ${d.status === "delivered" ? "opacity-70" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground text-sm">{customer?.name || "Unknown"}</span>
                      <Badge variant="outline" className="text-xs">Villa {customer?.villa_number}</Badge>
                      <Badge className={`text-xs ${sc.color}`}>
                        <Icon className="h-3 w-3 mr-1" /> {sc.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">🥤 {d.juice_type}</p>
                    {d.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">📝 {d.notes}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {(["delivered", "pending", "skipped", "on_hold"] as const).map((s) => {
                      const cfg = statusConfig[s];
                      const SIcon = cfg.icon;
                      return (
                        <Button
                          key={s}
                          variant={d.status === s ? "default" : "ghost"}
                          size="icon"
                          className={`h-8 w-8 ${d.status === s ? "bg-primary text-primary-foreground" : ""}`}
                          onClick={() => updateStatus(d.id, s)}
                          title={cfg.label}
                        >
                          <SIcon className="h-3.5 w-3.5" />
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <Input
                  placeholder="Add note..."
                  defaultValue={d.notes || ""}
                  className="mt-2 h-7 text-xs"
                  onBlur={(e) => updateNote(d.id, e.target.value)}
                />
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export default DailyDeliveryTracker;
