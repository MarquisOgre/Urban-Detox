import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Trash2, ShoppingBag, CheckCircle, History, MessageCircle, Home } from "lucide-react";
import { toast } from "sonner";

type UpiStep = "select" | "qr" | "txn";

type PlacedOrderSummary = {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  customerName: string;
  createdAt: string;
};

const badgeClass = (value: string) => {
  if (value === "pending") return "bg-secondary text-foreground";
  if (value === "paid" || value === "processing") return "bg-primary/10 text-primary";
  if (value === "cancelled") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
};

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrderSummary | null>(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [upiStep, setUpiStep] = useState<UpiStep>("select");
  const [transactionId, setTransactionId] = useState("");

  const { data: paymentSettings } = useQuery({
    queryKey: ["settings", "payment"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("setting_value").eq("setting_key", "payment").maybeSingle();
      return data?.setting_value as Record<string, any> | null;
    },
  });

  const { data: whatsappSettings } = useQuery({
    queryKey: ["settings", "whatsapp"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("setting_value").eq("setting_key", "whatsapp").maybeSingle();
      return data?.setting_value as { enabled: boolean; number: string } | null;
    },
  });

  const detailsFilled = useMemo(
    () => form.name.trim() !== "" && form.phone.trim() !== "" && form.address.trim() !== "",
    [form.name, form.phone, form.address],
  );

  const sanitizePhone = (phone: string) => phone.replace(/[^0-9]/g, "");

  const buildWhatsAppUrl = (phone: string, lines: string[]) => {
    const sanitizedPhone = sanitizePhone(phone);
    const encodedText = encodeURIComponent(lines.join("\n"));
    const isDesktopViewport = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;

    return isDesktopViewport
      ? `https://web.whatsapp.com/send?phone=${sanitizedPhone}&text=${encodedText}`
      : `https://wa.me/${sanitizedPhone}?text=${encodedText}`;
  };

  const openWhatsAppLink = (url: string, targetWindow?: Window | null) => {
    if (targetWindow && !targetWindow.closed) {
      targetWindow.location.replace(url);
      return;
    }

    const popup = window.open(url, "_blank");
    if (popup) {
      popup.opener = null;
      return;
    }

    try {
      if (window.top && window.top !== window) {
        window.top.location.href = url;
        return;
      }
    } catch {
      // Ignore cross-origin access issues and fall back to current window.
    }

    window.location.href = url;
  };

  const whatsappOrderUrl = useMemo(() => {
    if (!whatsappSettings?.enabled || !whatsappSettings?.number || items.length === 0 || !detailsFilled) return null;

    const lines = [
      "*New Juice Order*",
      "",
      ...items.map((item) => `• ${item.name} x ${item.quantity} — ₹${item.price * item.quantity}`),
      "",
      `*Total:* ₹${totalPrice.toFixed(2)}`,
      `*Payment:* ${paymentMethod.toUpperCase()}`,
      paymentMethod === "upi" && transactionId.trim() ? `*Transaction ID:* ${transactionId.trim()}` : null,
      "",
      `*Customer:* ${form.name.trim()}`,
      `*Phone:* ${form.phone.trim()}`,
      form.email.trim() ? `*Email:* ${form.email.trim()}` : null,
      `*Address:* ${form.address.trim()}`,
    ].filter(Boolean);

    return buildWhatsAppUrl(whatsappSettings.number, lines as string[]);
  }, [whatsappSettings, items, detailsFilled, totalPrice, paymentMethod, transactionId, form]);

  const saveRecentOrder = (order: PlacedOrderSummary) => {
    const existing = localStorage.getItem("urban-detox-recent-orders");
    const parsed: PlacedOrderSummary[] = existing ? JSON.parse(existing) : [];
    const next = [order, ...parsed].slice(0, 10);
    localStorage.setItem("urban-detox-recent-orders", JSON.stringify(next));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailsFilled) return;
    if (paymentMethod === "upi" && !transactionId.trim()) {
      toast.error("Please enter your UPI Transaction ID.");
      return;
    }

    const orderId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const confirmationWindow = whatsappSettings?.enabled && whatsappSettings?.number ? window.open("", "_blank") : null;

    if (confirmationWindow) {
      confirmationWindow.opener = null;
    }

    setSubmitting(true);
    try {
      const { error: orderError } = await supabase.from("orders").insert({
        id: orderId,
        created_at: createdAt,
        user_name: form.name.trim(),
        user_email: form.email.trim() || null,
        user_phone: form.phone.trim(),
        address: form.address.trim(),
        total: totalPrice,
        payment_method: paymentMethod,
        transaction_id: paymentMethod === "upi" ? transactionId.trim() : null,
      } as never);

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems as never[]);
      if (itemsError) throw itemsError;

      const summary: PlacedOrderSummary = {
        id: orderId,
        amount: totalPrice,
        paymentMethod: paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending",
        customerName: form.name.trim(),
        createdAt,
      };

      setPlacedOrder(summary);
      saveRecentOrder(summary);
      clearCart();
      toast.success("Order placed successfully!");

      if (whatsappSettings?.enabled && whatsappSettings?.number) {
        const confirmLines = [
          "*✅ Order Confirmed!*",
          "",
          `*Order ID:* ${orderId.slice(0, 8).toUpperCase()}`,
          "",
          ...items.map((item) => `• ${item.name} x ${item.quantity} — ₹${item.price * item.quantity}`),
          "",
          `*Total:* ₹${totalPrice.toFixed(2)}`,
          `*Payment:* ${paymentMethod.toUpperCase()}`,
          paymentMethod === "upi" && transactionId.trim() ? `*Transaction ID:* ${transactionId.trim()}` : null,
          "",
          `*Customer:* ${form.name.trim()}`,
          `*Phone:* ${form.phone.trim()}`,
          form.email.trim() ? `*Email:* ${form.email.trim()}` : null,
          `*Address:* ${form.address.trim()}`,
        ].filter(Boolean);

        openWhatsAppLink(buildWhatsAppUrl(whatsappSettings.number, confirmLines as string[]), confirmationWindow);
      } else if (confirmationWindow && !confirmationWindow.closed) {
        confirmationWindow.close();
      }
    } catch (error) {
      if (confirmationWindow && !confirmationWindow.closed) {
        confirmationWindow.close();
      }

      const message = error instanceof Error ? error.message : "Failed to place order. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-background pb-14">
        <PromoBanner />
        <Navbar />
        <main className="container mx-auto flex justify-center px-4 py-16">
          <Card className="w-full max-w-lg p-8 text-center shadow-lg">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold text-foreground">Thank You!</h1>
            <p className="mt-3 text-lg text-muted-foreground">Your order has been placed successfully.</p>
            <p className="text-muted-foreground">Payment verification is pending.</p>

            <div className="mt-6 rounded-2xl bg-secondary p-5 text-left">
              <div className="space-y-2 text-sm text-foreground">
                <p><span className="text-muted-foreground">Order ID:</span> <span className="font-mono">{placedOrder.id.slice(0, 8).toUpperCase()}</span></p>
                <p><span className="text-muted-foreground">Amount:</span> ₹{placedOrder.amount}</p>
                <p className="flex items-center gap-2"><span className="text-muted-foreground">Payment:</span> <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass(placedOrder.paymentStatus)}`}>{placedOrder.paymentStatus}</span></p>
                <p className="flex items-center gap-2"><span className="text-muted-foreground">Order:</span> <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass(placedOrder.orderStatus)}`}>{placedOrder.orderStatus}</span></p>
                <p><span className="text-muted-foreground">Name:</span> {placedOrder.customerName}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link to="/recent-orders">
                <Button variant="outline" size="lg" className="w-full">
                  <History className="mr-2 h-4 w-4" /> Recent Orders
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" className="w-full bg-nature-gradient text-primary-foreground hover:opacity-90">
                  <Home className="mr-2 h-4 w-4" /> Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-14">
        <PromoBanner />
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Your <span className="text-gradient-nature">Cart</span>
            </h1>
            <Link to="/recent-orders">
              <Button variant="outline" size="icon" aria-label="Recent Orders">
                <History className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="mt-12 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">Your cart is empty</p>
            <Button onClick={() => navigate("/products")} className="mt-4 bg-nature-gradient text-primary-foreground">
              Browse Juices
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-14">
      <PromoBanner />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-bold text-foreground">
            <span className="text-gradient-nature">Checkout</span>
          </h1>
          <Link to="/recent-orders">
            <Button variant="outline" size="icon" aria-label="Recent Orders">
              <History className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <form onSubmit={handleCheckout} className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <h3 className="font-display text-lg font-bold text-foreground">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <img src={item.image_url || "/placeholder.svg"} alt={item.name} className="h-10 w-10 shrink-0 rounded object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-xs">{item.quantity}</span>
                        <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="ml-1 h-6 w-6" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-foreground">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex justify-between font-display text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display text-lg font-bold text-foreground">Your Details</h3>
            <div className="mt-4 space-y-4">
              <div>
                <Label className="text-foreground">Full Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Enter your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-foreground">Email</Label>
                <Input placeholder="Enter email (optional)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-foreground">Phone Number <span className="text-destructive">*</span></Label>
                <Input placeholder="10-digit mobile number" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-foreground">Delivery Address <span className="text-destructive">*</span></Label>
                <Textarea placeholder="Enter full address" required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display text-lg font-bold text-foreground">Payment</h3>
            {!detailsFilled ? (
              <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">Please fill in your details correctly to proceed with payment.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {paymentSettings?.cod_enabled !== false && (
                  <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => { setPaymentMethod("cod"); setUpiStep("select"); }} className="accent-primary" />
                    <div>
                      <p className="font-medium text-foreground">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                    </div>
                  </label>
                )}

                {paymentSettings?.upi_enabled && (
                  <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={() => { setPaymentMethod("upi"); setUpiStep("qr"); }} className="accent-primary" />
                    <div>
                      <p className="font-medium text-foreground">UPI Payment</p>
                      <p className="text-xs text-muted-foreground">Pay via UPI: {paymentSettings.upi_id}</p>
                    </div>
                  </label>
                )}

                {paymentMethod === "upi" && paymentSettings?.upi_enabled && (
                  <div className="space-y-4">
                    {upiStep === "qr" && (
                      <div className="space-y-3 rounded-lg border border-border p-4 text-center">
                        <p className="text-sm font-medium text-foreground">Scan QR Code to Pay ₹{totalPrice.toFixed(2)}</p>
                        {paymentSettings.qr_code_url && (
                          <img src={paymentSettings.qr_code_url} alt="UPI QR Code" className="mx-auto h-52 w-52 rounded-lg object-contain" />
                        )}
                        <p className="text-xs text-muted-foreground">UPI ID: {paymentSettings.upi_id}</p>
                        <Button type="button" onClick={() => setUpiStep("txn")} className="w-full bg-nature-gradient text-primary-foreground hover:opacity-90">
                          <CheckCircle className="mr-2 h-4 w-4" /> I've Made the Payment
                        </Button>
                      </div>
                    )}

                    {upiStep === "txn" && (
                      <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                        <p className="text-sm font-medium text-foreground">Enter UPI Transaction ID</p>
                        <p className="text-xs text-muted-foreground">Please enter the transaction/reference ID from your UPI app to confirm payment.</p>
                        <Input placeholder="e.g. 412345678901" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setUpiStep("qr")}>Back</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === "cod" ? (
                  <Button type="submit" disabled={submitting} className="w-full bg-nature-gradient text-primary-foreground hover:opacity-90">
                    {submitting ? "Placing Order..." : "Place Order"}
                  </Button>
                ) : upiStep === "txn" ? (
                  <Button type="submit" disabled={submitting || !transactionId.trim()} className="w-full bg-nature-gradient text-primary-foreground hover:opacity-90">
                    {submitting ? "Placing Order..." : "Place Order"}
                  </Button>
                ) : null}

                {whatsappOrderUrl && (
                  <a href={whatsappOrderUrl} target="_blank" rel="noopener noreferrer">
                    <Button type="button" variant="outline" className="w-full">
                      <MessageCircle className="mr-2 h-4 w-4" /> Order on WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            )}
          </Card>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
