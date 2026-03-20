import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ShoppingBag, ArrowLeft } from "lucide-react";

type RecentOrder = {
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

const RecentOrders = () => {
  const [orders, setOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("urban-detox-recent-orders");
    if (!stored) return;
    try {
      setOrders(JSON.parse(stored));
    } catch {
      setOrders([]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background pb-14">
      <PromoBanner />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
              <History className="h-7 w-7 text-primary" /> Recent Orders
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Your latest placed orders on this device.</p>
          </div>
          <Link to="/products">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
            </Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <Card className="mt-8 p-10 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No recent orders found yet.</p>
          </Card>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono font-semibold text-foreground">{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <span className="font-display text-xl font-bold text-primary">₹{order.amount}</span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {order.customerName}</p>
                  <p><span className="text-muted-foreground">Payment:</span> {order.paymentMethod.toUpperCase()}</p>
                  <p><span className="text-muted-foreground">Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass(order.paymentStatus)}`}>
                    Payment: {order.paymentStatus}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass(order.orderStatus)}`}>
                    Order: {order.orderStatus}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RecentOrders;
