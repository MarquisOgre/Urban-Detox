import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Globe, Image, SlidersHorizontal, Grid3X3,
  HelpCircle, Wallet, MessageCircle, Building, Plus, Trash2, Upload,
  Sun, Moon, Monitor, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { uploadImage } from "@/hooks/useImageUpload";

const settingsTabs = [
  { value: "general", label: "General", icon: Globe },
  { value: "banner", label: "Banner", icon: Image },
  { value: "hero", label: "Hero", icon: SlidersHorizontal },
  { value: "categories", label: "Categories", icon: Grid3X3 },
  { value: "faq", label: "FAQ", icon: HelpCircle },
  { value: "payment", label: "Payment", icon: Wallet },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "portfolio", label: "Portfolio", icon: Building },
];

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <Card className="p-6">
    <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
      <Icon className="h-5 w-5 text-primary" /> {title}
    </h3>
    <div className="mt-4 space-y-4">{children}</div>
  </Card>
);

const SaveBtn = ({ onClick, label = "Save" }: { onClick: () => void; label?: string }) => (
  <Button onClick={onClick} className="bg-nature-gradient text-primary-foreground hover:opacity-90">
    {label}
  </Button>
);

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <div>
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    <div className="mt-1">{children}</div>
  </div>
);

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

type ImageUploadFieldProps = {
  label: string;
  hint?: string;
  currentUrl?: string;
  onUpload: (file: File) => void;
  recommended?: string;
  maxWidth?: number;
  maxHeight?: number;
};

const ImageUploadField = ({ label, hint, currentUrl, onUpload, recommended, maxWidth, maxHeight }: ImageUploadFieldProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        resolve("Invalid file type. Use PNG, JPG, WebP, SVG, or ICO.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        resolve(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 2MB.`);
        return;
      }
      if (maxWidth && maxHeight) {
        const img = new window.Image();
        img.onload = () => {
          URL.revokeObjectURL(img.src);
          if (img.width > maxWidth * 3 || img.height > maxHeight * 3) {
            resolve(`Image is ${img.width}×${img.height}px — recommended ${maxWidth}×${maxHeight}px or similar ratio.`);
          } else {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const validationError = await validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      if (ref.current) ref.current.value = "";
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {recommended && <p className="text-xs text-muted-foreground/70 italic">Recommended: {recommended}</p>}
      <div className="mt-1 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 overflow-hidden">
          {currentUrl ? <img src={currentUrl} alt="" className="h-full w-full object-contain" /> : <Image className="h-6 w-6 text-muted-foreground" />}
        </div>
        <div className="flex flex-col gap-1">
          <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={uploading} className="text-primary">
            <Upload className="mr-1 h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}
          </Button>
          <span className="text-[10px] text-muted-foreground">PNG, JPG, WebP, SVG · Max 2MB</span>
        </div>
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon" className="hidden" onChange={handleChange} />
      </div>
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
};

/* ────────────────────────── GENERAL TAB ────────────────────────── */
const GeneralTab = () => {
  const { data, loading, save } = useSiteSettings("general");
  const [form, setForm] = useState({
    logo_text: "", logo_highlight: "", tagline: "", phone: "", email: "", address: "",
    footer_text: "", footer_credit: "", site_name: "",
    light_logo_url: "", dark_logo_url: "", favicon_url: "", default_theme: "system",
  });

  useEffect(() => { if (data) setForm((p) => ({ ...p, ...data })); }, [data]);
  const u = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleImageUpload = async (file: File, field: string) => {
    const url = await uploadImage(file, "branding");
    if (url) setForm((p) => ({ ...p, [field]: url }));
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section icon={Globe} title="General">
        <Field label="Logo Text">
          <Input value={form.logo_text} onChange={(e) => u("logo_text", e.target.value)} placeholder="Nature's" />
        </Field>
        <Field label="Logo Highlight" hint="The highlighted part after logo text">
          <Input value={form.logo_highlight} onChange={(e) => u("logo_highlight", e.target.value)} placeholder="Blend" />
        </Field>
        <Field label="Tagline">
          <Input value={form.tagline} onChange={(e) => u("tagline", e.target.value)} placeholder="Fresh Cold-Pressed Juices" />
        </Field>
        <Separator />
        <ImageUploadField label="Light Theme Logo" hint="Displayed when the site is in light mode." recommended="200×60px, transparent PNG" maxWidth={400} maxHeight={120} currentUrl={form.light_logo_url} onUpload={(f) => handleImageUpload(f, "light_logo_url")} />
        <ImageUploadField label="Dark Theme Logo" hint="Displayed when the site is in dark mode." recommended="200×60px, transparent PNG" maxWidth={400} maxHeight={120} currentUrl={form.dark_logo_url} onUpload={(f) => handleImageUpload(f, "dark_logo_url")} />
        <ImageUploadField label="Favicon" hint="Browser tab icon." recommended="32×32 or 64×64px, PNG or ICO" maxWidth={128} maxHeight={128} currentUrl={form.favicon_url} onUpload={(f) => handleImageUpload(f, "favicon_url")} />
        <SaveBtn onClick={() => save(form)} />
      </Section>

      <div className="space-y-6">
        <Section icon={SlidersHorizontal} title="Theme">
          <Field label="Default Theme for Visitors" hint="Sets the default theme for new visitors.">
            <div className="flex items-center gap-4 mt-2">
              {[
                { value: "light", icon: Sun, label: "Light" },
                { value: "dark", icon: Moon, label: "Dark" },
                { value: "system", icon: Monitor, label: "System" },
              ].map((t) => (
                <label key={t.value} className="flex cursor-pointer items-center gap-2">
                  <input type="radio" name="theme" value={t.value} checked={form.default_theme === t.value} onChange={() => u("default_theme", t.value)} className="accent-primary" />
                  <t.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{t.label}</span>
                </label>
              ))}
            </div>
          </Field>
          <SaveBtn onClick={() => save(form)} />
        </Section>

        <Section icon={Globe} title="Contact & Footer">
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => u("phone", e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={(e) => u("email", e.target.value)} />
          </Field>
          <Field label="Address">
            <Textarea value={form.address} onChange={(e) => u("address", e.target.value)} />
          </Field>
          <Separator />
          <Field label="Footer Text">
            <Input value={form.footer_text} onChange={(e) => u("footer_text", e.target.value)} />
          </Field>
          <Field label="Footer Credit">
            <Input value={form.footer_credit} onChange={(e) => u("footer_credit", e.target.value)} />
          </Field>
          <SaveBtn onClick={() => save(form)} />
        </Section>
      </div>
    </div>
  );
};

/* ────────────────────────── BANNER TAB ────────────────────────── */
const BannerTab = () => {
  const { data, loading, save } = useSiteSettings("banner");
  const [form, setForm] = useState({ enabled: true, text: "", bg_color: "#2d6a4f", text_color: "#ffffff" });

  useEffect(() => { if (data) setForm((p) => ({ ...p, ...data })); }, [data]);
  const u = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <Section icon={Image} title="Promotion Header Bar">
      <p className="text-xs text-muted-foreground">This small bar appears above the navigation on all storefront pages.</p>
      <div className="flex items-center gap-3">
        <Switch checked={form.enabled} onCheckedChange={(v) => u("enabled", v)} />
        <Label>Enabled</Label>
      </div>
      <Field label="Banner Text">
        <Input value={form.text} onChange={(e) => u("text", e.target.value)} placeholder="🌿 Free delivery on orders above ₹500!" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Background Color">
          <div className="flex items-center gap-2">
            <input type="color" value={form.bg_color} onChange={(e) => u("bg_color", e.target.value)} className="h-10 w-10 cursor-pointer rounded border border-border" />
            <Input value={form.bg_color} onChange={(e) => u("bg_color", e.target.value)} className="max-w-[120px]" />
          </div>
        </Field>
        <Field label="Text Color">
          <div className="flex items-center gap-2">
            <input type="color" value={form.text_color} onChange={(e) => u("text_color", e.target.value)} className="h-10 w-10 cursor-pointer rounded border border-border" />
            <Input value={form.text_color} onChange={(e) => u("text_color", e.target.value)} className="max-w-[120px]" />
          </div>
        </Field>
      </div>
      <div className="rounded-lg p-2 text-center text-xs font-medium" style={{ backgroundColor: form.bg_color, color: form.text_color }}>
        {form.text || "Preview…"}
      </div>
      <SaveBtn onClick={() => save(form)} label="Save Banner" />
    </Section>
  );
};

/* ────────────────────────── HERO TAB ────────────────────────── */
const HeroTab = () => {
  const { data, loading, save } = useSiteSettings("hero");
  const [slides, setSlides] = useState<{ title: string; subtitle: string; cta: string; image_url: string }[]>([]);

  useEffect(() => { if (data?.slides) setSlides(data.slides.map((s: any) => ({ title: s.title || "", subtitle: s.subtitle || "", cta: s.cta || "", image_url: s.image_url || "" }))); }, [data]);

  const updateSlide = (i: number, k: string, v: string) => {
    setSlides((s) => s.map((sl, idx) => (idx === i ? { ...sl, [k]: v } : sl)));
  };

  const handleSlideImage = async (i: number, file: File) => {
    const url = await uploadImage(file, "hero");
    if (url) updateSlide(i, "image_url", url);
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <Section icon={SlidersHorizontal} title="Hero Slider">
      <p className="text-sm text-muted-foreground">Manage hero slider images and content.</p>
      {slides.map((slide, i) => (
        <div key={i} className="rounded-lg border border-border p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Slide {i + 1}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input value={slide.title} onChange={(e) => updateSlide(i, "title", e.target.value)} placeholder="Title" />
            <Input value={slide.subtitle} onChange={(e) => updateSlide(i, "subtitle", e.target.value)} placeholder="Subtitle" />
            <Input value={slide.cta} onChange={(e) => updateSlide(i, "cta", e.target.value)} placeholder="CTA Text" />
          </div>
          <ImageUploadField
            label="Slide Image"
            currentUrl={slide.image_url}
            onUpload={(file) => handleSlideImage(i, file)}
          />
        </div>
      ))}
      <SaveBtn onClick={() => save({ slides })} label="Save Slides" />
    </Section>
  );
};

/* ────────────────────────── CATEGORIES TAB ────────────────────────── */
const CategoriesTab = () => {
  const { data, loading, save } = useSiteSettings("categories");
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => { if (data?.items) setItems(data.items); }, [data]);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <Section icon={Grid3X3} title="Product Categories">
      <p className="text-sm text-muted-foreground">Manage the category chips shown on the storefront.</p>
      {items.map((cat, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input value={cat} onChange={(e) => { const n = [...items]; n[i] = e.target.value; setItems(n); }} />
          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setItems([...items, ""])}>
        <Plus className="mr-1 h-4 w-4" /> Add Category
      </Button>
      <SaveBtn onClick={() => save({ items })} label="Save Categories" />
    </Section>
  );
};

/* ────────────────────────── FAQ TAB ────────────────────────── */
const FAQTab = () => {
  const { data, loading, save } = useSiteSettings("faq");
  const [items, setItems] = useState<{ question: string; answer: string }[]>([]);

  useEffect(() => { if (data?.items) setItems(data.items); }, [data]);

  const update = (i: number, k: string, v: string) => {
    setItems((s) => s.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <Section icon={HelpCircle} title="FAQ Management">
      <p className="text-sm text-muted-foreground">Add, edit, or remove frequently asked questions.</p>
      {items.map((faq, i) => (
        <div key={i} className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">FAQ {i + 1}</p>
            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Input value={faq.question} onChange={(e) => update(i, "question", e.target.value)} placeholder="Question" />
          <Textarea value={faq.answer} onChange={(e) => update(i, "answer", e.target.value)} placeholder="Answer" rows={2} />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setItems([...items, { question: "", answer: "" }])}>
        <Plus className="mr-1 h-4 w-4" /> Add FAQ
      </Button>
      <SaveBtn onClick={() => save({ items })} label="Save FAQs" />
    </Section>
  );
};

/* ────────────────────────── PAYMENT TAB ────────────────────────── */
const PaymentTab = () => {
  const { data, loading, save } = useSiteSettings("payment");
  const [form, setForm] = useState({
    cod_enabled: true, upi_enabled: true, upi_id: "", qr_code_url: "",
  });

  useEffect(() => { if (data) setForm((p) => ({ ...p, ...data })); }, [data]);
  const u = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleQrUpload = async (file: File) => {
    const url = await uploadImage(file, "payment");
    if (url) u("qr_code_url", url);
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <Section icon={Wallet} title="Payment Settings">
      <div className="flex items-center gap-3">
        <Switch checked={form.cod_enabled} onCheckedChange={(v) => u("cod_enabled", v)} />
        <Label>Cash on Delivery</Label>
      </div>
      <Separator />
      <div className="flex items-center gap-3">
        <Switch checked={form.upi_enabled} onCheckedChange={(v) => u("upi_enabled", v)} />
        <Label>UPI Payment</Label>
      </div>
      {form.upi_enabled && (
        <>
          <Field label="UPI ID">
            <Input value={form.upi_id} onChange={(e) => u("upi_id", e.target.value)} placeholder="yourname@upi" />
          </Field>
          <ImageUploadField
            label="UPI QR Code"
            hint="Upload your UPI QR code image for customers to scan."
            currentUrl={form.qr_code_url}
            onUpload={handleQrUpload}
          />
        </>
      )}
      <SaveBtn onClick={() => save(form)} label="Save Payment Settings" />
    </Section>
  );
};

/* ────────────────────────── WHATSAPP TAB ────────────────────────── */
const WhatsAppTab = () => {
  const { data, loading, save } = useSiteSettings("whatsapp");
  const [form, setForm] = useState({ enabled: true, number: "", default_message: "" });

  useEffect(() => { if (data) setForm((p) => ({ ...p, ...data })); }, [data]);
  const u = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <Section icon={MessageCircle} title="WhatsApp Integration">
      <div className="flex items-center gap-3">
        <Switch checked={form.enabled} onCheckedChange={(v) => u("enabled", v)} />
        <Label>Enable WhatsApp Chat Button</Label>
      </div>
      <Field label="WhatsApp Number (with country code)">
        <Input value={form.number} onChange={(e) => u("number", e.target.value)} placeholder="919441561997" />
      </Field>
      <Field label="Default Message">
        <Textarea value={form.default_message} onChange={(e) => u("default_message", e.target.value)} rows={2} />
      </Field>
      {form.enabled && (
        <div className="rounded-lg bg-primary/10 p-4 text-sm text-foreground">
          <p className="font-medium">Preview:</p>
          <p className="text-muted-foreground">Floating WhatsApp button will appear on your storefront with the message: "<span className="italic">{form.default_message}</span>"</p>
        </div>
      )}
      <SaveBtn onClick={() => save(form)} label="Save WhatsApp Settings" />
    </Section>
  );
};

/* ────────────────────────── PORTFOLIO TAB ────────────────────────── */
type PortfolioProject = { title: string; description: string; url: string; image_url: string };

const PortfolioTab = () => {
  const { data, loading, save } = useSiteSettings("portfolio");
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [previewIdx, setPreviewIdx] = useState(0);

  useEffect(() => {
    if (data?.projects) setProjects(data.projects);
  }, [data]);

  const updateProject = (i: number, k: string, v: string) => {
    setProjects((p) => p.map((proj, idx) => (idx === i ? { ...proj, [k]: v } : proj)));
  };

  const handleProjectImage = async (i: number, file: File) => {
    const url = await uploadImage(file, "portfolio");
    if (url) updateProject(i, "image_url", url);
  };

  const addProject = () => {
    setProjects((p) => [...p, { title: "", description: "", url: "", image_url: "" }]);
  };

  const removeProject = (i: number) => {
    setProjects((p) => p.filter((_, idx) => idx !== i));
    if (previewIdx >= projects.length - 1) setPreviewIdx(Math.max(0, projects.length - 2));
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <Section icon={Building} title="Portfolio Projects">
        <p className="text-sm text-muted-foreground">Add up to 8 portfolio projects. These will display as a slider on the storefront.</p>

        {projects.map((proj, i) => (
          <div key={i} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Project {i + 1}</p>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeProject(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={proj.title} onChange={(e) => updateProject(i, "title", e.target.value)} placeholder="Project Title" />
              <Input value={proj.url} onChange={(e) => updateProject(i, "url", e.target.value)} placeholder="https://..." />
            </div>
            <Textarea value={proj.description} onChange={(e) => updateProject(i, "description", e.target.value)} placeholder="Short description" rows={2} />
            <ImageUploadField
              label="Project Image"
              currentUrl={proj.image_url}
              onUpload={(file) => handleProjectImage(i, file)}
            />
          </div>
        ))}

        <div className="flex items-center gap-3">
          {projects.length < 8 && (
            <Button variant="outline" size="sm" onClick={addProject}>
              <Plus className="mr-1 h-4 w-4" /> Add Project
            </Button>
          )}
          <SaveBtn onClick={() => save({ projects })} label="Save Portfolio" />
        </div>
      </Section>

      {/* Preview slider */}
      {projects.length > 0 && (
        <Card className="p-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <Building className="h-5 w-5 text-primary" /> Slider Preview
          </h3>
          <div className="mt-4 relative">
            <div className="overflow-hidden rounded-lg border border-border">
              {projects[previewIdx]?.image_url ? (
                <img src={projects[previewIdx].image_url} alt={projects[previewIdx].title} className="h-48 w-full object-cover" />
              ) : (
                <div className="flex h-48 items-center justify-center bg-muted text-muted-foreground text-sm">No image</div>
              )}
              <div className="p-3">
                <p className="font-display font-semibold text-foreground">{projects[previewIdx]?.title || "Untitled"}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{projects[previewIdx]?.description}</p>
              </div>
            </div>
            {projects.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-3">
                <Button size="icon" variant="outline" onClick={() => setPreviewIdx((p) => (p - 1 + projects.length) % projects.length)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">{previewIdx + 1} / {projects.length}</span>
                <Button size="icon" variant="outline" onClick={() => setPreviewIdx((p) => (p + 1) % projects.length)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

/* ────────────────────────── MAIN PAGE ────────────────────────── */
const tabComponents: Record<string, React.FC> = {
  general: GeneralTab,
  banner: BannerTab,
  hero: HeroTab,
  categories: CategoriesTab,
  faq: FAQTab,
  payment: PaymentTab,
  whatsapp: WhatsAppTab,
  portfolio: PortfolioTab,
};

const AdminSettings = () => {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8 pb-16">
        <Tabs defaultValue="general">
          <TabsList className="mb-6 flex flex-wrap gap-1 h-auto bg-secondary/50 p-1">
            {settingsTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {settingsTabs.map((tab) => {
            const Comp = tabComponents[tab.value];
            return (
              <TabsContent key={tab.value} value={tab.value}>
                <Comp />
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminSettings;
