import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Printer, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const JUICE_TYPES = ["All", "Ash Gourd", "Beetroot", "Carrot", "Cucumber", "Mix Veg", "Tomato", "Wheatgrass"];

const DeliveryReports = () => {
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-01"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [juiceFilter, setJuiceFilter] = useState("All");

  const { data: deliveries = [] } = useQuery({
    queryKey: ["delivery-report", startDate, endDate],
    queryFn: async () => {
      const { data } = await supabase.from("deliveries").select("*").gte("delivery_date", startDate).lte("delivery_date", endDate).order("delivery_date");
      return data || [];
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["delivery-customers-all"],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_customers").select("*");
      return data || [];
    },
  });

  const filtered = juiceFilter === "All" ? deliveries : deliveries.filter((d) => d.juice_type === juiceFilter);

  const delivered = filtered.filter((d) => d.status === "delivered").length;
  const pending = filtered.filter((d) => d.status === "pending").length;
  const skipped = filtered.filter((d) => d.status === "skipped").length;
  const missed = filtered.filter((d) => d.status === "missed").length;
  const totalQty = filtered.reduce((sum, d) => sum + ((d as any).quantity || 1), 0);

  // Juice breakdown
  const juiceBreakdown: Record<string, number> = {};
  filtered.filter((d) => d.status === "delivered").forEach((d) => {
    const qty = (d as any).quantity || 1;
    juiceBreakdown[d.juice_type] = (juiceBreakdown[d.juice_type] || 0) + qty;
  });
  const deliveredQty = Object.values(juiceBreakdown).reduce((s, v) => s + v, 0);

  // Customer stats
  const customerStats = customers.map((c) => {
    const cDeliveries = filtered.filter((d) => d.customer_id === c.id);
    return {
      name: c.name,
      villa: c.villa_number,
      total: cDeliveries.length,
      delivered: cDeliveries.filter((d) => d.status === "delivered").length,
      skipped: cDeliveries.filter((d) => d.status === "skipped").length,
    };
  }).filter((c) => c.total > 0).sort((a, b) => b.skipped - a.skipped);

  const exportCSV = () => {
    const rows = filtered.map((d) => {
      const c = customers.find((cu) => cu.id === d.customer_id);
      return `${d.delivery_date},${c?.name || ""},${c?.villa_number || ""},${d.juice_type},${d.status}`;
    });
    const csv = `Date,Name,Villa,Juice,Status\n${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `report-${startDate}-${endDate}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Juice Type</Label>
            <Select value={juiceFilter} onValueChange={setJuiceFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{JUICE_TYPES.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-3 w-3 mr-1" /> Export CSV</Button>
          <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-3 w-3 mr-1" /> Print</Button>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold text-foreground">{filtered.length}</p></Card>
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Delivered</p><p className="text-xl font-bold text-green-600">{delivered}</p></Card>
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold text-yellow-600">{pending}</p></Card>
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Skipped</p><p className="text-xl font-bold text-red-500">{skipped}</p></Card>
      </div>

      {/* Juice breakdown */}
      <Card className="p-4">
        <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Juice Breakdown (Delivered)</h3>
        <div className="space-y-2">
          {Object.entries(juiceBreakdown).sort((a, b) => b[1] - a[1]).map(([juice, count]) => (
            <div key={juice} className="flex items-center gap-3">
              <span className="text-sm text-foreground w-28">{juice}</span>
              <div className="flex-1 bg-secondary rounded-full h-4 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${(count / delivered) * 100}%` }} />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Customer stats */}
      <Card className="p-4">
        <h3 className="font-display font-bold text-foreground mb-3">Customer Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground text-xs">
              <th className="text-left py-2">Customer</th><th className="text-left py-2">Villa</th>
              <th className="text-center py-2">Total</th><th className="text-center py-2">Delivered</th><th className="text-center py-2">Skipped</th>
            </tr></thead>
            <tbody>
              {customerStats.map((c) => (
                <tr key={c.name + c.villa} className="border-b border-border/50">
                  <td className="py-2 font-medium text-foreground">{c.name}</td>
                  <td className="py-2 text-muted-foreground">{c.villa}</td>
                  <td className="py-2 text-center">{c.total}</td>
                  <td className="py-2 text-center text-green-600">{c.delivered}</td>
                  <td className="py-2 text-center text-red-500">{c.skipped}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DeliveryReports;
