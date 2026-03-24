import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Printer, BarChart3, ArrowLeft, Gift } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const JUICE_TYPES = ["All", "Ash Gourd", "Beetroot", "Carrot", "Cucumber", "Mix Veg", "Tomato", "Wheatgrass"];

const DeliveryReports = () => {
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-01"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [juiceFilter, setJuiceFilter] = useState("All");
  const [selectedVilla, setSelectedVilla] = useState<{ name: string; villa: string; customerId: string } | null>(null);

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
      const { data } = await supabase.from("delivery_customers").select("*").order("villa_number");
      return data || [];
    },
  });

  const filtered = juiceFilter === "All" ? deliveries : deliveries.filter((d) => d.juice_type === juiceFilter);

  // Use QUANTITY sums, not record counts
  const deliveredQtyTotal = filtered.filter((d) => d.status === "delivered").reduce((s, d) => s + (d.quantity || 1), 0);
  const pendingQtyTotal = filtered.filter((d) => d.status === "pending").reduce((s, d) => s + (d.quantity || 1), 0);
  const skippedQtyTotal = filtered.filter((d) => d.status === "skipped").reduce((s, d) => s + (d.quantity || 1), 0);
  const missedQtyTotal = filtered.filter((d) => d.status === "missed").reduce((s, d) => s + (d.quantity || 1), 0);
  const totalQty = filtered.reduce((s, d) => s + (d.quantity || 1), 0);
  const complimentaryQty = filtered.filter((d) => d.status === "delivered" && (d as any).is_complimentary).reduce((s, d) => s + (d.quantity || 1), 0);

  // Juice breakdown - sum quantities
  const juiceBreakdown: Record<string, number> = {};
  filtered.filter((d) => d.status === "delivered").forEach((d) => {
    const qty = d.quantity || 1;
    juiceBreakdown[d.juice_type] = (juiceBreakdown[d.juice_type] || 0) + qty;
  });

  // Customer stats sorted by villa ascending - use QUANTITY sums
  const customerStats = customers.map((c) => {
    const cDeliveries = filtered.filter((d) => d.customer_id === c.id);
    return {
      id: c.id,
      name: c.name,
      villa: c.villa_number,
      total: cDeliveries.reduce((s, d) => s + (d.quantity || 1), 0),
      delivered: cDeliveries.filter((d) => d.status === "delivered").reduce((s, d) => s + (d.quantity || 1), 0),
      skipped: cDeliveries.filter((d) => d.status === "skipped").reduce((s, d) => s + (d.quantity || 1), 0),
      complimentary: cDeliveries.filter((d) => d.status === "delivered" && (d as any).is_complimentary).reduce((s, d) => s + (d.quantity || 1), 0),
      chargeable: cDeliveries.filter((d) => d.status === "delivered" && !(d as any).is_complimentary).reduce((s, d) => s + (d.quantity || 1), 0),
    };
  }).filter((c) => c.total > 0).sort((a, b) => a.villa.localeCompare(b.villa, undefined, { numeric: true }));

  // Villa detail: deliveries for the selected customer
  const villaDeliveries = selectedVilla
    ? filtered
        .filter((d) => d.customer_id === selectedVilla.customerId)
        .sort((a, b) => a.delivery_date.localeCompare(b.delivery_date))
    : [];

  const exportCSV = () => {
    const rows = filtered.map((d) => {
      const c = customers.find((cu) => cu.id === d.customer_id);
      return `${d.delivery_date},${c?.name || ""},${c?.villa_number || ""},${d.juice_type},${d.quantity || 1},${d.status},${(d as any).is_complimentary ? "Yes" : "No"}`;
    });
    const csv = `Date,Name,Villa,Juice,Qty,Status,Complimentary\n${rows.join("\n")}`;
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold text-foreground">{totalQty}</p></Card>
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Delivered</p><p className="text-xl font-bold text-green-600">{deliveredQtyTotal}</p></Card>
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold text-yellow-600">{pendingQtyTotal}</p></Card>
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Skipped</p><p className="text-xl font-bold text-red-500">{skippedQtyTotal}</p></Card>
        <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Complimentary</p><p className="text-xl font-bold text-purple-600">{complimentaryQty}</p></Card>
      </div>

      {/* Juice breakdown */}
      <Card className="p-4">
        <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Juice Breakdown (Delivered)</h3>
        <div className="space-y-2">
          {Object.entries(juiceBreakdown).sort((a, b) => b[1] - a[1]).map(([juice, count]) => (
            <div key={juice} className="flex items-center gap-3">
              <span className="text-sm text-foreground w-28">{juice}</span>
              <div className="flex-1 bg-secondary rounded-full h-4 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${deliveredQtyTotal > 0 ? (count / deliveredQtyTotal) * 100 : 0}%` }} />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Customer stats */}
      <Card className="p-4">
        <h3 className="font-display font-bold text-foreground mb-3">Customer Summary</h3>
        <p className="text-xs text-muted-foreground mb-2">Click a villa number to view detailed delivery history</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground text-xs">
              <th className="text-left py-2">Customer</th><th className="text-left py-2">Villa</th>
              <th className="text-center py-2">Total</th><th className="text-center py-2">Delivered</th><th className="text-center py-2">Comp.</th><th className="text-center py-2">Chargeable</th><th className="text-center py-2">Skipped</th>
            </tr></thead>
            <tbody>
              {customerStats.map((c) => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="py-2 font-medium text-foreground">{c.name}</td>
                  <td className="py-2">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary font-bold underline-offset-2"
                      onClick={() => setSelectedVilla({ name: c.name, villa: c.villa, customerId: c.id })}
                    >
                      Villa {c.villa}
                    </Button>
                  </td>
                  <td className="py-2 text-center">{c.total}</td>
                  <td className="py-2 text-center text-green-600">{c.delivered}</td>
                  <td className="py-2 text-center text-purple-600">{c.complimentary}</td>
                  <td className="py-2 text-center font-bold text-foreground">{c.chargeable}</td>
                  <td className="py-2 text-center text-red-500">{c.skipped}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Villa Detail Dialog */}
      <Dialog open={!!selectedVilla} onOpenChange={(open) => !open && setSelectedVilla(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedVilla(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              {selectedVilla?.name} — Villa {selectedVilla?.villa}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground mb-3">
              Showing deliveries from {startDate} to {endDate} ({villaDeliveries.reduce((s, d) => s + (d.quantity || 1), 0)} juices in {villaDeliveries.length} records)
            </p>
            {villaDeliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No deliveries found for this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Juice</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-center py-2">Status</th>
                      <th className="text-center py-2">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {villaDeliveries.map((d) => (
                      <tr key={d.id} className="border-b border-border/50">
                        <td className="py-1.5 text-foreground">{format(new Date(d.delivery_date), "dd MMM yyyy")}</td>
                        <td className="py-1.5 text-foreground">{d.juice_type}</td>
                        <td className="py-1.5 text-center">{d.quantity || 1}</td>
                        <td className="py-1.5 text-center">
                          <Badge className={`text-xs ${
                            d.status === "delivered" ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" :
                            d.status === "skipped" ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" :
                            d.status === "missed" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" :
                            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                          }`}>
                            {d.status}
                          </Badge>
                        </td>
                        <td className="py-1.5 text-center">
                          {(d as any).is_complimentary ? (
                            <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                              <Gift className="h-3 w-3 mr-0.5" /> Free
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Paid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryReports;
