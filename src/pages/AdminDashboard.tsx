import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "@/components/admin/AdminHeader";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Package, ShoppingCart, Clock, DollarSign,
  Plus, Trash2, Edit2, Eye, Mail, Download, Upload, GlassWater,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { uploadImage } from "@/hooks/useImageUpload";
import DetoxJuices from "@/components/DetoxJuices";

const CATEGORIES = ["Wheatgrass", "Ash Gourd", "Carrot", "Beetroot", "Tomato", "Mix Veg"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const queryClient = useQueryClient();
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin/login"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (!roles?.some((r) => r.role === "admin")) { navigate("/admin/login"); return; }
      setAuthChecked(true);
    };
    checkAdmin();
  }, [navigate]);

  const { data: products = [], refetch: refetchProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: authChecked,
  });

  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: authChecked,
  });

  const { data: orderItems = [] } = useQuery({
    queryKey: ["admin-order-items"],
    queryFn: async () => {
      const { data } = await supabase.from("order_items").select("*");
      return data || [];
    },
    enabled: authChecked,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: authChecked,
  });

  // Product dialog
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "", category: "Wheatgrass", price: "", stock: "0", description: "", is_active: true, image_url: "",
  });
  const [productImage, setProductImage] = useState<File | null>(null);

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", category: "Wheatgrass", price: "", stock: "0", description: "", is_active: true, image_url: "" });
    setProductImage(null);
    setProductDialog(true);
  };

  const openEditProduct = (p: any) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, category: p.category, price: String(p.price), stock: String(p.stock),
      description: p.description || "", is_active: p.is_active, image_url: p.image_url || "",
    });
    setProductImage(null);
    setProductDialog(true);
  };

  const saveProduct = async () => {
    let imageUrl = productForm.image_url;
    if (productImage) {
      const url = await uploadImage(productImage, "products");
      if (url) imageUrl = url;
    }

    const payload = {
      name: productForm.name,
      category: productForm.category,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      description: productForm.description || null,
      is_active: productForm.is_active,
      image_url: imageUrl || null,
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) { toast.error("Failed to update product"); return; }
      toast.success("Product updated!");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error("Failed to add product"); return; }
      toast.success("Product added!");
    }
    setProductDialog(false);
    refetchProducts();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Product deleted");
    refetchProducts();
  };

  // Bulk import/export
  const handleExport = () => {
    const headers = ["name", "category", "price", "stock", "description", "is_active", "image_url"];
    const csv = [
      headers.join(","),
      ...products.map((p) =>
        headers.map((h) => {
          const val = (p as any)[h];
          if (typeof val === "string" && (val.includes(",") || val.includes('"') || val.includes("\n"))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val ?? "";
        }).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Products exported!");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) { toast.error("CSV file is empty or invalid"); return; }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].match(/(".*?"|[^,]*),?/g)?.map((v) => v.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"')) || [];
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });
      if (!row.name || !row.category || !row.price) continue;
      rows.push({
        name: row.name,
        category: row.category,
        price: Number(row.price),
        stock: Number(row.stock) || 0,
        description: row.description || null,
        is_active: row.is_active === "false" ? false : true,
        image_url: row.image_url || null,
      });
    }

    if (rows.length === 0) { toast.error("No valid rows found"); return; }

    const { error } = await supabase.from("products").insert(rows);
    if (error) { toast.error("Import failed: " + error.message); return; }
    toast.success(`${rows.length} products imported!`);
    refetchProducts();
    if (importRef.current) importRef.current.value = "";
  };

  const downloadTemplate = () => {
    const csv = "name,category,price,stock,description,is_active,image_url\nWheatgrass Shot 500ml,Wheatgrass,150,50,Fresh cold-pressed wheatgrass juice,true,\nCarrot Glow 300ml,Carrot,120,30,Pure carrot juice for glowing skin,true,";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Order detail dialog
  const [orderDialog, setOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const viewOrder = (order: any) => {
    setSelectedOrder(order);
    setOrderDialog(true);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) { toast.error("Failed to update status"); return; }
    toast.success(`Order status updated to ${status}`);
    refetchOrders();
    if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status });
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    refetchMessages();
    toast.success("Message deleted");
  };

  if (!authChecked) return null;

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

  const stats = [
    { label: "Products", value: String(products.length), icon: Package, color: "text-primary" },
    { label: "Orders", value: String(orders.length), icon: ShoppingCart, color: "text-primary" },
    { label: "Pending", value: String(pendingOrders), icon: Clock, color: "text-nature-amber" },
    { label: "Revenue", value: `₹${revenue}`, icon: DollarSign, color: "text-nature-amber" },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="flex items-center gap-4 p-5">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="mt-8">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-secondary/50 p-1">
            <TabsTrigger value="products" className="flex items-center gap-1.5 data-[state=active]:bg-card">
              <Package className="h-4 w-4" /> Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1.5 data-[state=active]:bg-card">
              <ShoppingCart className="h-4 w-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1.5 data-[state=active]:bg-card">
              <Mail className="h-4 w-4" /> Messages
            </TabsTrigger>
            <TabsTrigger value="detox" className="flex items-center gap-1.5 data-[state=active]:bg-card">
              <GlassWater className="h-4 w-4" /> Detox Juice
            </TabsTrigger>
          </TabsList>

          {/* PRODUCTS TAB */}
          <TabsContent value="products">
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
                <h2 className="font-display text-lg font-bold text-foreground">Manage Products</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="mr-1 h-4 w-4" /> Template
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
                    <Upload className="mr-1 h-4 w-4" /> Import CSV
                  </Button>
                  <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-1 h-4 w-4" /> Export
                  </Button>
                  <Button onClick={openAddProduct} className="bg-nature-gradient text-primary-foreground hover:opacity-90">
                    <Plus className="mr-1 h-4 w-4" /> Add Product
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <img src={p.image_url || "/placeholder.svg"} alt={p.name} className="h-10 w-10 rounded object-cover" />
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>₹{p.price}</TableCell>
                      <TableCell>{p.stock}</TableCell>
                      <TableCell>
                        <span className={`inline-block h-2 w-2 rounded-full ${p.is_active ? "bg-green-500" : "bg-red-500"}`} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditProduct(p)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No products yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ORDERS TAB */}
          <TabsContent value="orders">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-border p-5">
                <h2 className="font-display text-lg font-bold text-foreground">Orders</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
                      <TableCell className="font-medium">{o.user_name}</TableCell>
                      <TableCell>{o.user_phone}</TableCell>
                      <TableCell>₹{o.total}</TableCell>
                      <TableCell className="uppercase text-xs">{o.payment_method}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[o.status] || ""}`}>
                          {o.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => viewOrder(o)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select onValueChange={(v) => updateOrderStatus(o.id, v)}>
                            <SelectTrigger className="h-8 w-28 text-xs">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No orders yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* MESSAGES TAB */}
          <TabsContent value="messages">
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border p-5">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-bold text-foreground">Contact Messages</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.email || "-"}</TableCell>
                      <TableCell>{m.phone || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{m.message}</TableCell>
                      <TableCell className="text-xs">{new Date(m.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => deleteMessage(m.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {messages.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No messages yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* DETOX JUICE TAB */}
          <TabsContent value="detox">
            <DetoxJuices onBackToDashboard={() => {}} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      {/* Product Dialog */}
      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={productForm.category} onValueChange={(v) => setProductForm({ ...productForm, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (₹)</Label>
                <Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div>
              <Label>Product Image</Label>
              {productForm.image_url && (
                <img src={productForm.image_url} alt="" className="mt-1 h-20 w-20 rounded object-cover" />
              )}
              <Input type="file" accept="image/*" onChange={(e) => setProductImage(e.target.files?.[0] || null)} className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={productForm.is_active} onCheckedChange={(v) => setProductForm({ ...productForm, is_active: v })} />
              <Label>Active</Label>
            </div>
            <Button onClick={saveProduct} className="w-full bg-nature-gradient text-primary-foreground hover:opacity-90">
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={orderDialog} onOpenChange={setOrderDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Order ID:</span> <span className="font-mono">{selectedOrder.id.slice(0, 8)}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[selectedOrder.status] || ""}`}>{selectedOrder.status}</span></div>
                <div><span className="text-muted-foreground">Customer:</span> {selectedOrder.user_name}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selectedOrder.user_phone}</div>
                <div><span className="text-muted-foreground">Email:</span> {selectedOrder.user_email || "-"}</div>
                <div><span className="text-muted-foreground">Payment:</span> {selectedOrder.payment_method.toUpperCase()}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {selectedOrder.address}</div>
                <div><span className="text-muted-foreground">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                <div><span className="text-muted-foreground">Total:</span> <span className="font-bold text-primary">₹{selectedOrder.total}</span></div>
              </div>
              <div>
                <h4 className="font-display font-semibold text-foreground">Items</h4>
                <div className="mt-2 space-y-1">
                  {orderItems.filter((i) => i.order_id === selectedOrder.id).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>₹{Number(item.price) * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Update Status</Label>
                <Select value={selectedOrder.status} onValueChange={(v) => updateOrderStatus(selectedOrder.id, v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
