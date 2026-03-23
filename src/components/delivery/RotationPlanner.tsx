import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const JUICE_TYPES = ["Ash Gourd", "Beetroot", "Carrot", "Cucumber", "Mix Veg", "Tomato", "Wheatgrass"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const RotationPlanner = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [schedule, setSchedule] = useState<Record<number, string>>({});

  const { data: customers = [] } = useQuery({
    queryKey: ["delivery-customers-active"],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_customers").select("*").eq("is_active", true).order("villa_number");
      return data || [];
    },
  });

  const { data: schedules = [], refetch } = useQuery({
    queryKey: ["delivery-schedules"],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_schedules").select("*");
      return data || [];
    },
  });

  const sortedCustomers = [...customers].sort((a, b) =>
    a.villa_number.localeCompare(b.villa_number, undefined, { numeric: true })
  );

  const loadCustomerSchedule = (customerId: string) => {
    setSelectedCustomer(customerId);
    const cs = schedules.filter((s) => s.customer_id === customerId);
    const map: Record<number, string> = {};
    cs.forEach((s) => { map[s.day_of_week] = s.juice_type; });
    setSchedule(map);
  };

  const saveSchedule = async () => {
    if (!selectedCustomer) return;
    await supabase.from("delivery_schedules").delete().eq("customer_id", selectedCustomer);
    const rows = Object.entries(schedule)
      .filter(([_, juice]) => juice)
      .map(([day, juice]) => ({
        customer_id: selectedCustomer,
        day_of_week: Number(day),
        juice_type: juice,
      }));
    if (rows.length > 0) {
      const { error } = await supabase.from("delivery_schedules").insert(rows);
      if (error) { toast.error("Save failed"); return; }
    }
    toast.success("Rotation schedule saved");
    refetch();
  };

  const applyDefault = () => {
    const defaultRotation: Record<number, string> = {
      0: "Ash Gourd", 1: "Carrot", 2: "Beetroot", 3: "Cucumber",
      4: "Wheatgrass", 5: "Mix Veg", 6: "Tomato",
    };
    setSchedule(defaultRotation);
  };

  const customerScheduleMap = new Map<string, Record<number, string>>();
  schedules.forEach((s) => {
    if (!customerScheduleMap.has(s.customer_id)) customerScheduleMap.set(s.customer_id, {});
    customerScheduleMap.get(s.customer_id)![s.day_of_week] = s.juice_type;
  });

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <h3 className="font-display font-bold text-foreground">Set Weekly Rotation</h3>
        <Select value={selectedCustomer} onValueChange={loadCustomerSchedule}>
          <SelectTrigger><SelectValue placeholder="Select customer..." /></SelectTrigger>
          <SelectContent>
            {sortedCustomers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} (Villa {c.villa_number})</SelectItem>)}
          </SelectContent>
        </Select>

        {selectedCustomer && (
          <>
            <div className="space-y-2">
              {DAYS.map((day, idx) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-24">{day}</span>
                  <Select value={schedule[idx] || ""} onValueChange={(v) => setSchedule({ ...schedule, [idx]: v })}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select juice..." /></SelectTrigger>
                    <SelectContent>{JUICE_TYPES.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={saveSchedule} className="bg-primary text-primary-foreground">Save Schedule</Button>
              <Button variant="outline" onClick={applyDefault}>Apply Default Rotation</Button>
            </div>
          </>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-display font-bold text-foreground mb-3">All Rotation Schedules</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 pr-2">Customer</th>
                {DAYS.map((d) => <th key={d} className="text-center py-2 px-1">{d.slice(0, 3)}</th>)}
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.map((c) => {
                const cs = customerScheduleMap.get(c.id) || {};
                return (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="py-2 pr-2 font-medium text-foreground whitespace-nowrap">{c.name} <span className="text-muted-foreground">(V{c.villa_number})</span></td>
                    {DAYS.map((_, idx) => (
                      <td key={idx} className="text-center py-1 px-1">
                        {cs[idx] ? (
                          <Badge variant="outline" className="text-[10px] px-1">{cs[idx].split(" ").map(w => w[0]).join("")}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {sortedCustomers.length === 0 && (
                <tr><td colSpan={8} className="text-center py-4 text-muted-foreground">No active customers</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RotationPlanner;
