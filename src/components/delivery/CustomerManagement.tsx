import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Search, Phone, X } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const JUICE_TYPES = ["Ash Gourd", "Beetroot", "Carrot", "Cucumber", "Mix Veg", "Tomato", "Wheatgrass"];
const PLANS = ["daily", "weekly", "monthly"];
const FREQUENCIES = ["daily", "alternate"];

type Subscription = { juice_type: string; quantity: number };

const emptyForm = {
  name: "", villa_number: "", phone: "", subscription_plan: "daily",
  delivery_frequency: "daily", preferred_juice: "Ash Gourd", start_date: new Date().toISOString().split("T")[0],
  notes: "", is_active: true,
};

const CustomerManagement = () => {
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");

  const { data: customers = [], refetch } = useQuery({
    queryKey: ["delivery-customers-all"],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_customers").select("*").order("villa_number");
      return data || [];
    },
  });

  const { data: allSubscriptions = [], refetch: refetchSubs } = useQuery({
    queryKey: ["customer-subscriptions-all"],
    queryFn: async () => {
      const { data } = await supabase.from("customer_subscriptions").select("*").eq("is_active", true);
      return data || [];
    },
  });

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.villa_number.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search)
  );

  const getCustomerSubs = (customerId: string) =>
    allSubscriptions.filter((s: any) => s.customer_id === customerId);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setSubscriptions([{ juice_type: "Ash Gourd", quantity: 1 }]);
    setDialog(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      name: c.name, villa_number: c.villa_number, phone: c.phone || "",
      subscription_plan: c.subscription_plan, delivery_frequency: c.delivery_frequency,
      preferred_juice: c.preferred_juice, start_date: c.start_date || emptyForm.start_date,
      notes: c.notes || "", is_active: c.is_active,
    });
    const subs = getCustomerSubs(c.id);
    setSubscriptions(subs.length > 0
      ? subs.map((s: any) => ({ juice_type: s.juice_type, quantity: s.quantity }))
      : [{ juice_type: c.preferred_juice, quantity: 1 }]
    );
    setDialog(true);
  };

  const addSub = () => {
    setSubscriptions([...subscriptions, { juice_type: "Ash Gourd", quantity: 1 }]);
  };

  const removeSub = (idx: number) => {
    if (subscriptions.length <= 1) return;
    setSubscriptions(subscriptions.filter((_, i) => i !== idx));
  };

  const updateSub = (idx: number, field: keyof Subscription, value: string | number) => {
    const updated = [...subscriptions];
    updated[idx] = { ...updated[idx], [field]: value };
    setSubscriptions(updated);
  };

  const save = async () => {
    if (!form.name || !form.villa_number) { toast.error("Name and Villa are required"); return; }
    const payload = {
      ...form,
      preferred_juice: subscriptions[0]?.juice_type || form.preferred_juice,
      updated_at: new Date().toISOString(),
    };

    let customerId: string;

    if (editing) {
      const { error } = await supabase.from("delivery_customers").update(payload).eq("id", editing.id);
      if (error) { toast.error("Update failed"); return; }
      customerId = editing.id;
    } else {
      const { data, error } = await supabase.from("delivery_customers").insert(payload).select("id").single();
      if (error || !data) { toast.error("Add failed"); return; }
      customerId = data.id;
    }

    // Save subscriptions: delete old, insert new
    await supabase.from("customer_subscriptions").delete().eq("customer_id", customerId);
    if (subscriptions.length > 0) {
      const subRows = subscriptions.map((s) => ({
        customer_id: customerId,
        juice_type: s.juice_type,
        quantity: s.quantity,
        is_active: true,
      }));
      await supabase.from("customer_subscriptions").insert(subRows);
    }

    toast.success(editing ? "Customer updated" : "Customer added");
    setDialog(false);
    refetch();
    refetchSubs();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("delivery_customers").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Customer removed");
    refetch();
    refetchSubs();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, villa, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openAdd} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> Add Customer
        </Button>
      </div>

      <div className="text-sm text-muted-foreground flex gap-3">
        <span>Active: <strong className="text-green-600">{customers.filter(c => c.is_active).length}</strong></span>
        <span>Inactive: <strong className="text-destructive">{customers.filter(c => !c.is_active).length}</strong></span>
        {search && <span>Showing: <strong>{filtered.length}</strong></span>}
      </div>

      <div className="space-y-2">
        {filtered.map((c) => {
          const subs = getCustomerSubs(c.id);
          return (
            <Card key={c.id} className={`p-3 ${!c.is_active ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground text-sm">{c.name}</span>
                    <Badge variant="outline" className="text-xs">Villa {c.villa_number}</Badge>
                    <Badge className="text-xs bg-primary/10 text-primary">{c.subscription_plan}</Badge>
                    {!c.is_active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                    <span>📅 {c.delivery_frequency}</span>
                  </div>
                  {/* Show subscriptions */}
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {subs.length > 0 ? subs.map((s: any, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        🥤 {s.juice_type} × {s.quantity}
                      </Badge>
                    )) : (
                      <Badge variant="secondary" className="text-xs">
                        🥤 {c.preferred_juice} × 1
                      </Badge>
                    )}
                  </div>
                  {c.notes && <p className="text-xs text-muted-foreground mt-1 italic">📝 {c.notes}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Customer" : "Add Customer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div>
              <Label className="text-xs">Villa Number *</Label>
              <Input value={form.villa_number} onChange={(e) => setForm({ ...form, villa_number: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} type="tel" />
            </div>
            <div>
              <Label className="text-xs">Subscription Plan</Label>
              <Select value={form.subscription_plan} onValueChange={(v) => setForm({ ...form, subscription_plan: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PLANS.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Delivery Frequency</Label>
              <Select value={form.delivery_frequency} onValueChange={(v) => setForm({ ...form, delivery_frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f} className="capitalize">{f === "alternate" ? "Alternate Days" : "Daily"}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Juice Subscriptions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Juice Subscriptions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSub} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add Juice
                </Button>
              </div>
              {subscriptions.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-md border border-border bg-secondary/30">
                  <Select value={sub.juice_type} onValueChange={(v) => updateSub(idx, "juice_type", v)}>
                    <SelectTrigger className="flex-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{JUICE_TYPES.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-muted-foreground">Qty:</Label>
                    <Input
                      type="number"
                      min={1}
                      value={sub.quantity}
                      onChange={(e) => updateSub(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 h-8 text-xs text-center"
                    />
                  </div>
                  {subscriptions.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeSub(idx)}>
                      <X className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <Label className="text-xs">Start Date</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Leave at gate, etc." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} id="active-cb" />
              <Label htmlFor="active-cb" className="text-xs">Active</Label>
            </div>
            <Button onClick={save} className="w-full bg-primary text-primary-foreground">{editing ? "Update" : "Add"} Customer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
