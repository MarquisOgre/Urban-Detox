import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { Minus, Plus, Trash2, ShoppingBag, Upload } from "lucide-react";
import { toast } from "sonner";

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const { data: paymentSettings } = useQuery({
    queryKey: ["settings", "payment"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("setting_value").eq("setting_key", "payment").maybeSingle();
      return data?.setting_value as Record<string, any> | null;
    },
  });

  const detailsFilled = useMemo(
    () => form.name.trim() !== "" && form.phone.trim() !== "" && form.address.trim() !== "",
    [form.name, form.phone, form.address]
  );

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailsFilled) return;
    setSubmitting(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_name: form.name,
          user_email: form.email || null,
          user_phone: form.phone,
          address: form.address,
          total: totalPrice,
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderId(order.id);
      clearCart();
      toast.success("Order placed successfully!");
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderId) {
    return (
      <div className="min-h-screen bg-background pb-14">
        <PromoBanner />
        <Navbar />
        <main className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold text-foreground">Order Confirmed!</h1>
            <p className="mt-2 text-muted-foreground">
              Your order ID is <span className="font-mono font-semibold text-foreground">{orderId.slice(0, 8)}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              We'll contact you on your phone number to confirm delivery.
            </p>
            <Button onClick={() => navigate("/products")} className="mt-6 bg-nature-gradient text-primary-foreground">
              Continue Shopping
            </Button>
          </div>
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
          <h1 className="font-display text-3xl font-bold text-foreground">
            Your <span className="text-gradient-nature">Cart</span>
          </h1>
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
        <h1 className="font-display text-3xl font-bold text-foreground">
          <span className="text-gradient-nature">Checkout</span>
        </h1>

        <form onSubmit={handleCheckout} className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Order Summary */}
          <Card className="p-6">
            <h3 className="font-display text-lg font-bold text-foreground">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img src={item.image_url || "/placeholder.svg"} alt={item.name} className="h-10 w-10 rounded object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-xs">{item.quantity}</span>
                        <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground shrink-0">₹{item.price * item.quantity}</span>
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

          {/* Your Details */}
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

          {/* Payment */}
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
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-primary" />
                    <div>
                      <p className="font-medium text-foreground">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                    </div>
                  </label>
                )}
                {paymentSettings?.upi_enabled && (
                  <>
                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-border"}`}>
                      <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} className="accent-primary" />
                      <div>
                        <p className="font-medium text-foreground">UPI Payment</p>
                        <p className="text-xs text-muted-foreground">Pay via UPI: {paymentSettings.upi_id}</p>
                      </div>
                    </label>
                    {paymentMethod === "upi" && paymentSettings.qr_code_url && (
                      <div className="rounded-lg border border-border p-4 text-center">
                        <p className="mb-2 text-sm font-medium text-foreground">Scan QR Code to Pay</p>
                        <img src={paymentSettings.qr_code_url} alt="UPI QR Code" className="mx-auto h-48 w-48 rounded-lg object-contain" />
                        <p className="mt-2 text-xs text-muted-foreground">UPI ID: {paymentSettings.upi_id}</p>
                      </div>
                    )}
                  </>
                )}
                <Button type="submit" disabled={submitting} className="w-full bg-nature-gradient text-primary-foreground hover:opacity-90">
                  {submitting ? "Placing Order..." : "Place Order"}
                </Button>
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
