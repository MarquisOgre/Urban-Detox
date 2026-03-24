import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IndianRupee, CheckCircle, Clock, MessageCircle, Bell, Gift } from "lucide-react";
import { format, subMonths, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";

const PRICING_OPTIONS = [
  { label: "1 Juice × 7 Days = ₹500", value: 500 },
  { label: "2 Juices × 7 Days = ₹1000", value: 1000 },
  { label: "3 Juices × 7 Days = ₹1500", value: 1500 },
  { label: "Manual Entry", value: -1 },
];

const PaymentTracking = () => {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [dialog, setDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [pricingOption, setPricingOption] = useState<number>(500);

  const { data: customers = [] } = useQuery({
    queryKey: ["delivery-customers-all"],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_customers").select("*").order("villa_number");
      return data || [];
    },
  });

  const sortedCustomers = [...customers].sort((a, b) =>
    a.villa_number.localeCompare(b.villa_number, undefined, { numeric: true })
  );

  const { data: payments = [], refetch } = useQuery({
    queryKey: ["delivery-payments", month],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_payments").select("*").eq("month", month);
      return data || [];
    },
  });

  const { data: generalSettings } = useQuery({
    queryKey: ["settings", "whatsapp"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("setting_value").eq("setting_key", "whatsapp").maybeSingle();
      return data?.setting_value as { phone?: string } | null;
    },
  });

  const getPayment = (customerId: string) => payments.find((p) => p.customer_id === customerId);

  const togglePayment = async (customerId: string) => {
    const existing = getPayment(customerId);
    if (existing) {
      const newStatus = existing.status === "paid" ? "pending" : "paid";
      await supabase.from("delivery_payments").update({
        status: newStatus,
        paid_date: newStatus === "paid" ? new Date().toISOString().split("T")[0] : null,
      }).eq("id", existing.id);
    } else {
      const customer = sortedCustomers.find((c) => c.id === customerId);
      setSelectedCustomer(customer);
      // Auto-suggest price based on subscriptions
      setPricingOption(500);
      setAmount("500");
      setDialog(true);
      return;
    }
    refetch();
    toast.success("Payment updated");
  };

  const createPayment = async () => {
    if (!selectedCustomer || !amount) return;
    const { error } = await supabase.from("delivery_payments").insert({
      customer_id: selectedCustomer.id,
      month,
      amount: Number(amount),
      status: "pending",
    });
    if (error) { toast.error("Failed: " + error.message); return; }
    setDialog(false);
    refetch();
    toast.success("Payment record created");
  };

  const sendWhatsAppReminder = (customer: any) => {
    const phone = (customer.phone || "").replace(/[^0-9]/g, "");
    if (!phone) { toast.error("No phone number"); return; }
    const msg = encodeURIComponent(`Hi ${customer.name}, this is a reminder for your juice subscription payment for ${format(new Date(month + "-01"), "MMMM yyyy")}. Please clear the pending amount at your earliest convenience. Thank you! 🥤`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  // Query deliveries for the month to detect threshold milestones
  const { data: monthDeliveries = [] } = useQuery({
    queryKey: ["month-deliveries-for-payments", month],
    queryFn: async () => {
      const monthStart = format(startOfMonth(new Date(month + "-01")), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(new Date(month + "-01")), "yyyy-MM-dd");
      const { data } = await supabase.from("deliveries").select("*").gte("delivery_date", monthStart).lte("delivery_date", monthEnd).eq("status", "delivered");
      return data || [];
    },
  });

  // Count delivered juices per customer this month (exclude complimentary)
  const customerJuiceCounts: Record<string, { total: number; chargeable: number; complimentary: number }> = {};
  monthDeliveries.forEach((d) => {
    const qty = d.quantity || 1;
    const isComp = (d as any).is_complimentary;
    if (!customerJuiceCounts[d.customer_id]) {
      customerJuiceCounts[d.customer_id] = { total: 0, chargeable: 0, complimentary: 0 };
    }
    customerJuiceCounts[d.customer_id].total += qty;
    if (isComp) {
      customerJuiceCounts[d.customer_id].complimentary += qty;
    } else {
      customerJuiceCounts[d.customer_id].chargeable += qty;
    }
  });

  // Customers who have reached their configurable threshold and don't have a payment record yet
  const readyForPayment = sortedCustomers
    .filter((c) => c.is_active)
    .filter((c) => {
      const threshold = (c as any).payment_threshold ?? 7;
      const counts = customerJuiceCounts[c.id];
      return (counts?.chargeable || 0) >= threshold && !getPayment(c.id);
    });

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);

  const prevMonth = () => setMonth(format(subMonths(new Date(month + "-01"), 1), "yyyy-MM"));
  const nextMonth = () => setMonth(format(addMonths(new Date(month + "-01"), 1), "yyyy-MM"));

  return (
    <div className="space-y-4">
      {/* Month nav & summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={prevMonth}>← Prev</Button>
          <h3 className="font-display font-bold text-foreground">{format(new Date(month + "-01"), "MMMM yyyy")}</h3>
          <Button variant="ghost" size="sm" onClick={nextMonth}>Next →</Button>
        </div>
        <div className="flex gap-6 mt-3 text-sm">
          <div className="flex items-center gap-1"><IndianRupee className="h-3 w-3 text-green-600" /> Paid: <strong className="text-green-600">₹{totalPaid}</strong></div>
          <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-yellow-600" /> Pending: <strong className="text-yellow-600">₹{totalPending}</strong></div>
        </div>
      </Card>

      {/* Threshold notification */}
      {readyForPayment.length > 0 && (
        <Card className="border-orange-300 bg-orange-50 dark:bg-orange-900/20 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-orange-600" />
            <p className="text-sm font-bold text-orange-800 dark:text-orange-300">
              {readyForPayment.length} villa(s) reached payment threshold — payment due!
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {readyForPayment.map((c) => {
              const counts = customerJuiceCounts[c.id];
              const threshold = (c as any).payment_threshold ?? 7;
              return (
                <Badge key={c.id} className="bg-orange-200 text-orange-900 dark:bg-orange-800 dark:text-orange-100 cursor-pointer" onClick={() => togglePayment(c.id)}>
                  Villa {c.villa_number} — {counts?.chargeable || 0}/{threshold} juices
                  {(counts?.complimentary || 0) > 0 && ` (+${counts.complimentary} free)`}
                  → Add Payment
                </Badge>
              );
            })}
          </div>
        </Card>
      )}

      {/* Customer payment list */}
      <div className="space-y-2">
        {sortedCustomers.filter((c) => c.is_active).map((c) => {
          const payment = getPayment(c.id);
          const isPaid = payment?.status === "paid";
          const counts = customerJuiceCounts[c.id];
          return (
            <Card key={c.id} className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{c.name}</span>
                    <Badge variant="outline" className="text-xs">Villa {c.villa_number}</Badge>
                    {payment ? (
                      <Badge className={`text-xs ${isPaid ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"}`}>
                        {isPaid ? <><CheckCircle className="h-3 w-3 mr-1" /> ₹{payment.amount}</> : <><Clock className="h-3 w-3 mr-1" /> ₹{payment.amount}</>}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">No record</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>Chargeable: {counts?.chargeable || 0}</span>
                    {(counts?.complimentary || 0) > 0 && (
                      <span className="flex items-center gap-0.5 text-purple-600"><Gift className="h-3 w-3" /> Free: {counts.complimentary}</span>
                    )}
                  </div>
                  {payment?.paid_date && <p className="text-xs text-muted-foreground mt-0.5">Paid on {payment.paid_date}</p>}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant={isPaid ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${isPaid ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                    onClick={() => togglePayment(c.id)}
                  >
                    {payment ? (isPaid ? "Paid ✓" : "Mark Paid") : "Add Payment"}
                  </Button>
                  {payment && !isPaid && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => sendWhatsAppReminder(c)} title="WhatsApp Reminder">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle>Add Payment Record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{selectedCustomer?.name} — Villa {selectedCustomer?.villa_number} — {format(new Date(month + "-01"), "MMMM yyyy")}</p>
            
            <div>
              <Label className="text-xs">Pricing Plan</Label>
              <Select value={String(pricingOption)} onValueChange={(v) => {
                const val = Number(v);
                setPricingOption(val);
                if (val > 0) setAmount(String(val));
                else setAmount("");
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRICING_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={String(p.value)}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Amount (₹)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus={pricingOption === -1}
                placeholder="e.g. 500"
                readOnly={pricingOption > 0}
              />
            </div>
            <Button onClick={createPayment} className="w-full bg-primary text-primary-foreground">Create Record</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentTracking;
