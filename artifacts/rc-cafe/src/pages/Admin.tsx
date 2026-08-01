import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import {
  useGetStats,
  useListBookings, useUpdateBooking, useDeleteBooking,
  useListMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem,
  useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useListContactMessages,
  getListBookingsQueryKey, getListMenuItemsQueryKey, getListProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  LogOut, Activity, Calendar, Package, Utensils, MessageSquare,
  Trash2, Edit2, Plus, X, Images, CheckCircle2, XCircle, Link2, Building2, Copy,
  Upload, ImageIcon, Eye, TrendingUp, ChevronUp, ChevronDown, LayoutDashboard, Wallet, Smartphone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
type Product = {
  id: number; name: string; description: string; price: number;
  category: string; featured: boolean; inStock: boolean; stock: number;
  imageUrl: string | null;
  extraImages: string | null; // JSON array of extra image URLs
};
type Slide = { id: number; imageUrl: string; videoUrl?: string | null; title: string; subtitle: string; sortOrder: number; active: boolean };
type Booking = {
  id: number; firstName: string; lastName: string; email: string; phone: string | null;
  date: string; time: string; experienceType: string; specialRequests: string | null; status: string;
};

// ─── Booking Form ─────────────────────────────────────────────────────────────
const EXPERIENCE_TYPES = ["30 Min Track", "1 Hour Track", "Full Day", "Drift Session", "RC Rental - Basic", "RC Rental - 4x4", "RC Rental - Crawler", "RC Rental - Competition", "Private Event", "Coaching"];
const BOOKING_STATUSES = ["pending", "confirmed", "cancelled"];
const TIME_SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00"];

function BookingForm({ initial, onSave, onCancel }: {
  initial?: Partial<Booking>;
  onSave: (data: Omit<Booking, "id">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    date: initial?.date ?? "",
    time: initial?.time ?? "",
    experienceType: initial?.experienceType ?? EXPERIENCE_TYPES[0],
    specialRequests: initial?.specialRequests ?? "",
    status: initial?.status ?? "pending",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.date || !form.time) return;
    onSave({
      firstName: form.firstName, lastName: form.lastName, email: form.email,
      phone: form.phone || null, date: form.date, time: form.time,
      experienceType: form.experienceType, specialRequests: form.specialRequests || null,
      status: form.status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">First Name *</Label>
          <Input className="rounded-none" value={form.firstName} onChange={e => set("firstName", e.target.value)} required />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Last Name</Label>
          <Input className="rounded-none" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Email *</Label>
          <Input className="rounded-none" type="email" value={form.email} onChange={e => set("email", e.target.value)} required />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Phone</Label>
          <Input className="rounded-none" value={form.phone} onChange={e => set("phone", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Date *</Label>
          <Input className="rounded-none" type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Time *</Label>
          <select className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" value={form.time} onChange={e => set("time", e.target.value)}>
            <option value="">Select time</option>
            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Experience Type</Label>
        <select className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" value={form.experienceType} onChange={e => set("experienceType", e.target.value)}>
          {EXPERIENCE_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Status</Label>
        <select className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" value={form.status} onChange={e => set("status", e.target.value)}>
          {BOOKING_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Special Requests</Label>
        <Input className="rounded-none" value={form.specialRequests} onChange={e => set("specialRequests", e.target.value)} placeholder="Any special requests..." />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="rounded-none uppercase tracking-widest text-xs font-bold flex-1 bg-primary hover:bg-primary/90">Save Booking</Button>
        <Button type="button" variant="outline" className="rounded-none uppercase tracking-widest text-xs" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// ─── Image compression helper ─────────────────────────────────────────────────
const MAX_IMAGE_DIMENSION = 1600;
const COMPRESSED_QUALITY = 0.8;

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  let { width, height } = bitmap;
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    const scale = MAX_IMAGE_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob: Blob | null = await new Promise(resolve =>
    canvas.toBlob(resolve, outputType, COMPRESSED_QUALITY)
  );
  if (!blob || blob.size >= file.size) return file;

  const newName = file.name.replace(/\.\w+$/, outputType === "image/png" ? ".png" : ".jpg");
  return new File([blob], newName, { type: outputType });
}

// ─── Admin Image Upload ────────────────────────────────────────────────────────
function AdminVideoUpload({ currentUrl, onUploaded }: { currentUrl: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setError("");
    setUploading(true);
    try {
      const token = localStorage.getItem("rc_admin_token") ?? "";
      const res = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: rawFile.name, size: rawFile.size, contentType: rawFile.type || "video/mp4" }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await res.json();
      const put = await fetch(uploadURL, { method: "PUT", body: rawFile, headers: { "Content-Type": rawFile.type || "video/mp4" } });
      if (!put.ok) throw new Error("Upload to storage failed");
      onUploaded(`/api/storage${objectPath}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {currentUrl && (
        <div className="relative w-full h-32 bg-muted/10 border border-border/30 overflow-hidden flex items-center justify-center">
          <video src={currentUrl} className="w-full h-full object-cover" muted playsInline />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="text-white text-xs uppercase tracking-widest font-bold bg-black/50 px-2 py-1">Video Preview</span>
          </div>
        </div>
      )}
      <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-none uppercase tracking-widest text-xs border-dashed border-primary/40 hover:border-primary"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading
          ? <><Upload className="w-3 h-3 mr-2 animate-bounce" /> Uploading Video...</>
          : <><Upload className="w-3 h-3 mr-2" /> {currentUrl ? "Change Video" : "Upload Video"}</>
        }
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function AdminImageUpload({ currentUrl, onUploaded }: { currentUrl: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setError("");
    setUploading(true);
    try {
      const file = await compressImage(rawFile);
      const token = localStorage.getItem("rc_admin_token") ?? "";
      // Step 1: get presigned URL
      const res = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "image/jpeg" }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await res.json();
      // Step 2: upload directly to GCS
      const put = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type || "image/jpeg" } });
      if (!put.ok) throw new Error("Upload to storage failed");
      // Step 3: return serving URL
      onUploaded(`/api/storage${objectPath}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {/* Preview */}
      {currentUrl && (
        <div className="relative w-full h-32 bg-muted/10 border border-border/30 overflow-hidden">
          <img src={currentUrl} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
        </div>
      )}
      {/* Upload button */}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-none uppercase tracking-widest text-xs border-dashed border-primary/40 hover:border-primary"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading
          ? <><Upload className="w-3 h-3 mr-2 animate-bounce" /> Uploading...</>
          : <><ImageIcon className="w-3 h-3 mr-2" /> {currentUrl ? "Change Image" : "Upload Image"}</>
        }
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Reusable dialog-like overlay ─────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border/50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h2 className="font-bold uppercase tracking-widest text-sm">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Product Form ─────────────────────────────────────────────────────────────
const PRODUCT_CATEGORIES = [
  "RC Cars",
  "Off-Road RTR",
  "On-Road RTR",
  "Construction Vehicles",
  "Batteries",
  "Connectors",
  "Chargers",
  "Parts",
  "Accessories",
  "Apparel",
  "Other",
];

function ProductForm({ initial, onSave, onCancel }: {
  initial?: Partial<Product>;
  onSave: (data: Omit<Product, "id">) => void;
  onCancel: () => void;
}) {
  const parseExtra = (v: string | null | undefined): [string,string,string,string] => {
    try { const a = JSON.parse(v ?? "[]"); return [a[0]??"",a[1]??"",a[2]??"",a[3]??""]; } catch { return ["","","",""]; }
  };

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: String(initial?.price ?? ""),
    category: initial?.category ?? "RC Cars",
    featured: initial?.featured ?? false,
    inStock: initial?.inStock ?? true,
    stock: String(initial?.stock ?? "0"),
    imageUrl: initial?.imageUrl ?? "",
    extraImages: parseExtra(initial?.extraImages),
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));
  const setExtra = (i: number, url: string) =>
    setForm(f => { const e = [...f.extraImages] as [string,string,string,string]; e[i] = url; return { ...f, extraImages: e }; });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price) return;
    const extras = form.extraImages.filter(u => u.trim());
    onSave({
      name: form.name,
      description: form.description,
      price: parseInt(form.price) || 0,
      category: form.category,
      featured: form.featured,
      inStock: form.inStock,
      stock: parseInt(form.stock) || 0,
      imageUrl: form.imageUrl || null,
      extraImages: extras.length ? JSON.stringify(extras) : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Product Name *</Label>
        <Input className="rounded-none" value={form.name} onChange={e => set("name", e.target.value)} required placeholder="e.g. Drift RC Car" />
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Description</Label>
        <Input className="rounded-none" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Short description" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Price (₹) *</Label>
          <Input className="rounded-none" type="number" value={form.price} onChange={e => set("price", e.target.value)} required min={0} placeholder="0" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Stock Qty</Label>
          <Input className="rounded-none" type="number" value={form.stock} onChange={e => set("stock", e.target.value)} min={0} placeholder="0" />
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Category</Label>
        <select
          className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={form.category}
          onChange={e => set("category", e.target.value)}
        >
          {PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block flex items-center gap-1">
          <ImageIcon className="w-3 h-3" /> Product Image
        </Label>
        <AdminImageUpload currentUrl={form.imageUrl} onUploaded={url => set("imageUrl", url)} />
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-px bg-border/30" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or paste URL</span>
          <div className="flex-1 h-px bg-border/30" />
        </div>
        <Input
          className="rounded-none mt-2"
          value={form.imageUrl}
          onChange={e => set("imageUrl", e.target.value)}
          placeholder="https://... (paste image link)"
        />
      </div>

      {/* Extra images 2–5 */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
          <ImageIcon className="w-3 h-3" /> Extra Photos (2–5)
        </Label>
        {([0,1,2,3] as const).map(i => (
          <div key={i}>
            <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">Photo {i + 2}</p>
            <AdminImageUpload currentUrl={form.extraImages[i]} onUploaded={url => setExtra(i, url)} />
            <Input
              className="rounded-none mt-1"
              value={form.extraImages[i]}
              onChange={e => setExtra(i, e.target.value)}
              placeholder={`https://... extra photo ${i + 2}`}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-6 pt-1">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} className="accent-primary" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.inStock} onChange={e => set("inStock", e.target.checked)} className="accent-primary" />
          In Stock
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="rounded-none uppercase tracking-widest text-xs font-bold flex-1 bg-primary hover:bg-primary/90">Save Product</Button>
        <Button type="button" variant="outline" className="rounded-none uppercase tracking-widest text-xs" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// ─── Slide Form ───────────────────────────────────────────────────────────────
function SlideForm({ initial, onSave, onCancel }: {
  initial?: Partial<Slide>;
  onSave: (data: Omit<Slide, "id">) => void;
  onCancel: () => void;
}) {
  const [mediaType, setMediaType] = useState<"image" | "video">(initial?.videoUrl ? "video" : "image");
  const [form, setForm] = useState({
    imageUrl: initial?.imageUrl ?? "",
    videoUrl: initial?.videoUrl ?? "",
    title: initial?.title ?? "",
    subtitle: initial?.subtitle ?? "",
    sortOrder: String(initial?.sortOrder ?? "0"),
    active: initial?.active ?? true,
  });
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mediaType === "image" && !form.imageUrl) return;
    if (mediaType === "video" && !form.videoUrl) return;
    onSave({
      imageUrl: mediaType === "image" ? form.imageUrl : "",
      videoUrl: mediaType === "video" ? form.videoUrl : null,
      title: form.title,
      subtitle: form.subtitle,
      sortOrder: parseInt(form.sortOrder) || 0,
      active: form.active,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Media type toggle */}
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Slide Media Type</Label>
        <div className="flex gap-0 border border-border/40">
          <button
            type="button"
            onClick={() => setMediaType("image")}
            className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors ${mediaType === "image" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted/20"}`}
          >
            <ImageIcon className="w-3 h-3" /> Image
          </button>
          <button
            type="button"
            onClick={() => setMediaType("video")}
            className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors ${mediaType === "video" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted/20"}`}
          >
            <Upload className="w-3 h-3" /> Video
          </button>
        </div>
      </div>

      {mediaType === "image" ? (
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> Slide Image *
          </Label>
          <AdminImageUpload currentUrl={form.imageUrl} onUploaded={url => set("imageUrl", url)} />
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-px bg-border/30" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or paste URL</span>
            <div className="flex-1 h-px bg-border/30" />
          </div>
          <Input className="rounded-none mt-2" value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} placeholder="https://... image link" />
        </div>
      ) : (
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block flex items-center gap-1">
            <Upload className="w-3 h-3" /> Hero Video *
          </Label>
          <AdminVideoUpload currentUrl={form.videoUrl ?? ""} onUploaded={url => set("videoUrl", url)} />
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-px bg-border/30" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or paste URL</span>
            <div className="flex-1 h-px bg-border/30" />
          </div>
          <Input className="rounded-none mt-2" value={form.videoUrl ?? ""} onChange={e => set("videoUrl", e.target.value)} placeholder="https://... video link (mp4)" />
          <p className="text-[10px] text-muted-foreground mt-1">Video will autoplay muted & looped in the hero. Keep under 30MB for best performance.</p>
        </div>
      )}

      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Heading Text</Label>
        <Input className="rounded-none" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Race. Relax. Repeat." />
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Subheading Text</Label>
        <Input className="rounded-none" value={form.subtitle} onChange={e => set("subtitle", e.target.value)} placeholder="India's Premier RC Experience" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Order (0 = first)</Label>
          <Input className="rounded-none" type="number" value={form.sortOrder} onChange={e => set("sortOrder", e.target.value)} min={0} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => set("active", e.target.checked)} className="accent-primary" />
            Visible on site
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="rounded-none uppercase tracking-widest text-xs font-bold flex-1 bg-primary hover:bg-primary/90">Save Slide</Button>
        <Button type="button" variant="outline" className="rounded-none uppercase tracking-widest text-xs" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// ─── Main Admin Component ─────────────────────────────────────────────────────
export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!localStorage.getItem("rc_admin_token")) setLocation("/admin/login");
  }, [setLocation]);

  const handleLogout = () => { localStorage.removeItem("rc_admin_token"); setLocation("/admin/login"); };

  const { data: stats } = useGetStats();
  const { data: bookings = [] } = useListBookings();
  const { data: products = [] } = useListProducts();
  const { data: menuItems = [] } = useListMenuItems();
  const { data: messages = [] } = useListContactMessages();

  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  // Visit stats
  const [visitStats, setVisitStats] = useState({ totalVisits: 0, todayVisits: 0 });
  useEffect(() => {
    fetch("/api/visits/stats").then(r => r.json()).then(setVisitStats).catch(() => {});
  }, []);

  // Slides state (manual fetch, no codegen needed)
  const [slides, setSlides] = useState<Slide[]>([]);
  const [slidesLoading, setSlidesLoading] = useState(false);
  const fetchSlides = () => { setSlidesLoading(true); fetch("/api/slides").then(r => r.json()).then(setSlides).finally(() => setSlidesLoading(false)); };
  useEffect(() => { if (activeTab === "slides") { fetchSlides(); fetchNotice(); } }, [activeTab]);

  // Notice state
  const [notice, setNotice] = useState("");
  const [noticeSaving, setNoticeSaving] = useState(false);
  const fetchNotice = () => fetch("/api/notice").then(r => r.json()).then(d => setNotice(d.notice ?? "")).catch(() => {});
  const handleSaveNotice = async () => {
    const tok = localStorage.getItem("rc_admin_token") ?? "";
    setNoticeSaving(true);
    await fetch("/api/notice", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` }, body: JSON.stringify({ notice }) });
    setNoticeSaving(false);
    toast({ title: "Notice Saved" });
  };

  // Layout order state
  const DEFAULT_SECTIONS = [
    { key: "stats",    label: "Stats Bar" },
    { key: "services", label: "The Experience (Services)" },
    { key: "pricing",  label: "Ready to Race (Pricing)" },
    { key: "map",      label: "Find The Track (Map)" },
  ];
  const [layoutOrder, setLayoutOrder] = useState<string[]>(["stats","services","pricing","map"]);
  const [layoutSaving, setLayoutSaving] = useState(false);
  const fetchLayout = () => fetch("/api/layout").then(r => r.json()).then(d => { if (Array.isArray(d.order)) setLayoutOrder(d.order); }).catch(() => {});
  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = [...layoutOrder];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setLayoutOrder(next);
  };
  const handleSaveLayout = async () => {
    const tok = localStorage.getItem("rc_admin_token") ?? "";
    setLayoutSaving(true);
    await fetch("/api/layout", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` }, body: JSON.stringify({ order: layoutOrder }) });
    setLayoutSaving(false);
    toast({ title: "Layout Saved" });
  };

  // Font state
  const FONT_OPTIONS = [
    { value: "Inter",            label: "Inter",           style: "font-sans" },
    { value: "Poppins",          label: "Poppins",         style: "" },
    { value: "Roboto",           label: "Roboto",          style: "" },
    { value: "Montserrat",       label: "Montserrat",      style: "" },
    { value: "Oswald",           label: "Oswald",          style: "" },
    { value: "Rajdhani",         label: "Rajdhani",        style: "" },
    { value: "Exo 2",            label: "Exo 2",           style: "" },
    { value: "Bebas Neue",       label: "Bebas Neue",      style: "" },
    { value: "Playfair Display", label: "Playfair Display",style: "" },
  ];
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [fontSaving, setFontSaving] = useState(false);
  const fetchFont = () => fetch("/api/font").then(r => r.json()).then(d => setSelectedFont(d.font ?? "Inter")).catch(() => {});
  const handleSaveFont = async () => {
    const tok = localStorage.getItem("rc_admin_token") ?? "";
    setFontSaving(true);
    await fetch("/api/font", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` }, body: JSON.stringify({ font: selectedFont }) });
    setFontSaving(false);
    document.documentElement.style.setProperty("--font-family", selectedFont);
    toast({ title: `Font changed to ${selectedFont}` });
  };

  // Booking modal state
  const [bookingModal, setBookingModal] = useState<{ mode: "add" | "edit"; booking?: Booking } | null>(null);

  // Bank details state
  const [bankDetails, setBankDetails] = useState({ accountNo: "", holderName: "", ifscCode: "", bankName: "ICICI Bank", upiId: "" });
  const [bankSaving, setBankSaving] = useState(false);
  const fetchBankDetails = () => fetch("/api/bank-details").then(r => r.json()).then(d => setBankDetails({ accountNo: d.accountNo ?? "", holderName: d.holderName ?? "", ifscCode: d.ifscCode ?? "", bankName: d.bankName ?? "ICICI Bank", upiId: d.upiId ?? "" })).catch(() => {});
  useEffect(() => { if (activeTab === "settings") { fetchBankDetails(); fetchLayout(); fetchFont(); } }, [activeTab]);
  const handleSaveBank = async () => {
    setBankSaving(true);
    try {
      const res = await fetch("/api/bank-details", { method: "PATCH", headers: authHeader, body: JSON.stringify(bankDetails) });
      if (res.ok) toast({ title: "Bank Details Saved" });
    } finally { setBankSaving(false); }
  };
  // ── Cashbacks / Payments state ──
  type Payment = { id: number; customerName: string; customerUpiId: string; amount: number; cashbackAmount: number; status: string; note: string | null; createdAt: string };
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [upiEdit, setUpiEdit] = useState("");
  const [upiSaving, setUpiSaving] = useState(false);

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const tok = localStorage.getItem("rc_admin_token") ?? "";
      const r = await fetch("/api/payments", { headers: { Authorization: `Bearer ${tok}` } });
      const data = await r.json();
      if (Array.isArray(data)) setPayments(data);
    } finally { setPaymentsLoading(false); }
  };

  const handleUpdatePayment = async (id: number, status: string) => {
    const tok = localStorage.getItem("rc_admin_token") ?? "";
    await fetch(`/api/payments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` }, body: JSON.stringify({ status }) });
    toast({ title: status === "paid" ? "✅ Cashback Paid!" : "❌ Rejected" });
    fetchPayments();
  };

  const handleSaveUpi = async () => {
    setUpiSaving(true);
    try {
      const tok = localStorage.getItem("rc_admin_token") ?? "";
      await fetch("/api/bank-details", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` }, body: JSON.stringify({ upiId: upiEdit }) });
      toast({ title: "UPI ID saved!" });
    } finally { setUpiSaving(false); }
  };

  useEffect(() => {
    if (activeTab === "cashbacks") {
      fetchPayments();
      fetch("/api/bank-details").then(r => r.json()).then(d => setUpiEdit(d.upiId ?? "")).catch(() => {});
    }
  }, [activeTab]);

  // Product modal state
  const [productModal, setProductModal] = useState<{ mode: "add" | "edit"; product?: Product } | null>(null);
  // Menu modal state
  const [menuModal, setMenuModal] = useState<{ mode: "add" | "edit"; item?: typeof menuItems[0] } | null>(null);
  // Slide modal state
  const [slideModal, setSlideModal] = useState<{ mode: "add" | "edit"; slide?: Slide } | null>(null);

  // ── Booking handlers ──
  const handleSaveBooking = (data: Omit<Booking, "id">) => {
    if (!bookingModal?.booking) return;
    const payload = { ...data, phone: data.phone ?? undefined, specialRequests: data.specialRequests ?? undefined };
    updateBooking.mutate({ id: bookingModal.booking.id, data: payload }, {
      onSuccess: () => { toast({ title: "Booking Updated" }); queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() }); setBookingModal(null); }
    });
  };
  const handleDeleteBooking = (id: number) => {
    if (!confirm("Delete this booking?")) return;
    deleteBooking.mutate({ id }, { onSuccess: () => { toast({ title: "Booking Deleted" }); queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() }); } });
  };

  // ── Product handlers ──
  const handleSaveProduct = (data: Omit<Product, "id">) => {
    const payload = { ...data, imageUrl: data.imageUrl ?? undefined };
    if (productModal?.mode === "edit" && productModal.product) {
      updateProduct.mutate({ id: productModal.product.id, data: payload }, {
        onSuccess: () => { toast({ title: "Product Updated" }); queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); setProductModal(null); }
      });
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => { toast({ title: "Product Added" }); queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); setProductModal(null); }
      });
    }
  };
  const handleDeleteProduct = (id: number) => {
    if (!confirm("Delete this product?")) return;
    deleteProduct.mutate({ id }, { onSuccess: () => { toast({ title: "Product Deleted" }); queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); } });
  };

  // ── Menu handlers ──
  const MENU_CATEGORIES = ["coffee","cold_drinks","snacks","pizza","rc_track","rc_rental","combo"] as const;
  type MenuCat = typeof MENU_CATEGORIES[number];
  const [menuForm, setMenuForm] = useState({ name: "", description: "", price: "", category: "coffee" as MenuCat, featured: false });

  const handleSaveMenu = () => {
    if (!menuForm.name || !menuForm.price) return;
    const data = { name: menuForm.name, description: menuForm.description, price: parseInt(menuForm.price) || 0, category: menuForm.category as MenuCat, featured: menuForm.featured };
    if (menuModal?.mode === "edit" && menuModal.item) {
      updateMenuItem.mutate({ id: menuModal.item.id, data }, {
        onSuccess: () => { toast({ title: "Item Updated" }); queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() }); setMenuModal(null); }
      });
    } else {
      createMenuItem.mutate({ data }, {
        onSuccess: () => { toast({ title: "Item Added" }); queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() }); setMenuModal(null); }
      });
    }
  };
  const handleDeleteMenu = (id: number) => {
    if (!confirm("Delete this menu item?")) return;
    deleteMenuItem.mutate({ id }, { onSuccess: () => { toast({ title: "Item Deleted" }); queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() }); } });
  };

  // ── Slide handlers ──
  const token = localStorage.getItem("rc_admin_token") ?? "";
  const authHeader = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const handleSaveSlide = async (data: Omit<Slide, "id">) => {
    const url = slideModal?.mode === "edit" && slideModal.slide ? `/api/slides/${slideModal.slide.id}` : "/api/slides";
    const method = slideModal?.mode === "edit" ? "PATCH" : "POST";
    await fetch(url, { method, headers: authHeader, body: JSON.stringify(data) });
    toast({ title: slideModal?.mode === "edit" ? "Slide Updated" : "Slide Added" });
    setSlideModal(null);
    fetchSlides();
  };
  const handleDeleteSlide = async (id: number) => {
    if (!confirm("Delete this slide?")) return;
    await fetch(`/api/slides/${id}`, { method: "DELETE", headers: authHeader });
    toast({ title: "Slide Deleted" });
    fetchSlides();
  };
  const handleToggleSlide = async (slide: Slide) => {
    await fetch(`/api/slides/${slide.id}`, { method: "PATCH", headers: authHeader, body: JSON.stringify({ active: !slide.active }) });
    fetchSlides();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Modals */}
      {productModal && (
        <Modal title={productModal.mode === "add" ? "Add New Product" : "Edit Product"} onClose={() => setProductModal(null)}>
          <ProductForm initial={productModal.product} onSave={handleSaveProduct} onCancel={() => setProductModal(null)} />
        </Modal>
      )}
      {menuModal && (
        <Modal title={menuModal.mode === "add" ? "Add Menu Item" : "Edit Menu Item"} onClose={() => setMenuModal(null)}>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Name *</Label>
              <Input className="rounded-none" value={menuForm.name} onChange={e => setMenuForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Description</Label>
              <Input className="rounded-none" value={menuForm.description} onChange={e => setMenuForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Price (₹)</Label>
                <Input className="rounded-none" type="number" value={menuForm.price} onChange={e => setMenuForm(f => ({ ...f, price: e.target.value }))} min={0} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Category</Label>
                <select className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm" value={menuForm.category} onChange={e => setMenuForm(f => ({ ...f, category: e.target.value as MenuCat }))}>
                  {MENU_CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_"," ")}</option>)}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={menuForm.featured} onChange={e => setMenuForm(f => ({ ...f, featured: e.target.checked }))} className="accent-primary" />
              Featured item
            </label>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSaveMenu} className="rounded-none uppercase tracking-widest text-xs font-bold flex-1 bg-primary hover:bg-primary/90">Save Item</Button>
              <Button variant="outline" className="rounded-none uppercase tracking-widest text-xs" onClick={() => setMenuModal(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
      {bookingModal && (
        <Modal title="Edit Booking" onClose={() => setBookingModal(null)}>
          <BookingForm initial={bookingModal.booking} onSave={handleSaveBooking} onCancel={() => setBookingModal(null)} />
        </Modal>
      )}
      {slideModal && (
        <Modal title={slideModal.mode === "add" ? "Add Hero Slide" : "Edit Slide"} onClose={() => setSlideModal(null)}>
          <SlideForm initial={slideModal.slide} onSave={handleSaveSlide} onCancel={() => setSlideModal(null)} />
        </Modal>
      )}

      {/* Header */}
      <header className="border-b border-border/50 bg-card px-6 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-primary/30 overflow-hidden">
            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif font-bold text-lg tracking-widest text-primary uppercase">Pit Wall Control</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="uppercase tracking-widest text-xs font-bold text-muted-foreground hover:text-destructive rounded-none">
          <LogOut className="w-4 h-4 mr-2" /> Disconnect
        </Button>
      </header>

      <div className="flex-1 container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent h-auto p-0 mb-8 overflow-x-auto">
            {[
              { value: "overview", icon: <Activity className="w-4 h-4 mr-2" />, label: "Overview" },
              { value: "bookings", icon: <Calendar className="w-4 h-4 mr-2" />, label: "Bookings" },
              { value: "products", icon: <Package className="w-4 h-4 mr-2" />, label: "Shop" },
              { value: "menu", icon: <Utensils className="w-4 h-4 mr-2" />, label: "Menu" },
              { value: "slides", icon: <Images className="w-4 h-4 mr-2" />, label: "Slider" },
              { value: "messages", icon: <MessageSquare className="w-4 h-4 mr-2" />, label: "Messages" },
              { value: "settings", icon: <Building2 className="w-4 h-4 mr-2" />, label: "Settings" },
              { value: "cashbacks", icon: <Wallet className="w-4 h-4 mr-2" />, label: "Cashbacks" },
            ].map(t => (
              <TabsTrigger key={t.value} value={t.value} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-5 py-3 uppercase tracking-widest text-xs font-bold whitespace-nowrap flex items-center">
                {t.icon}{t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="space-y-6 animate-in fade-in">
            {/* Visit Stats */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" /> Website Visitors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="rounded-none border-primary/30 bg-primary/5">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Aaj Ki Visits</CardTitle>
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold font-serif text-primary">{visitStats.todayVisits}</div>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Aaj {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })} tak</p>
                  </CardContent>
                </Card>
                <Card className="rounded-none border-border/50 bg-card">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Total Visits (All Time)</CardTitle>
                    <Eye className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold font-serif">{visitStats.totalVisits.toLocaleString("en-IN")}</div>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Shuroo se ab tak</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Booking Stats */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Bookings Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Bookings", value: stats?.totalBookings ?? 0, icon: <Calendar className="w-4 h-4 text-primary" /> },
                  { label: "Pending", value: stats?.pendingBookings ?? 0, icon: <Activity className="w-4 h-4 text-amber-500" />, color: "text-amber-500" },
                  { label: "Products", value: stats?.totalProducts ?? 0, icon: <Package className="w-4 h-4 text-primary" /> },
                  { label: "Active Members", value: stats?.memberCount ?? 0, icon: <Activity className="w-4 h-4 text-primary" /> },
                ].map(s => (
                  <Card key={s.label} className="rounded-none border-border/50 bg-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</CardTitle>{s.icon}</CardHeader>
                    <CardContent><div className={`text-3xl font-bold font-serif ${s.color ?? ""}`}>{s.value}</div></CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── Bookings ── */}
          <TabsContent value="bookings" className="animate-in fade-in">
            <Card className="rounded-none border-border/50 bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/10 text-muted-foreground uppercase tracking-widest text-xs border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Driver</th>
                      <th className="px-6 py-4">Experience</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-muted/5">
                        <td className="px-6 py-4"><div className="font-bold">{b.date}</div><div className="text-xs text-muted-foreground">{b.time}</div></td>
                        <td className="px-6 py-4"><div className="font-bold">{b.firstName} {b.lastName}</div><div className="text-xs text-muted-foreground">{b.phone}</div></td>
                        <td className="px-6 py-4">{b.experienceType}</td>
                        <td className="px-6 py-4">
                          <Badge className="rounded-none uppercase tracking-widest text-[10px]" variant={b.status === "confirmed" ? "default" : b.status === "cancelled" ? "destructive" : "secondary"}>{b.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button size="sm" variant="outline" className="h-8 rounded-none text-xs uppercase" onClick={() => setBookingModal({ mode: "edit", booking: b as Booking })}>
                            <Edit2 className="w-3 h-3 mr-1" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-none text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteBooking(b.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No bookings yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ── Shop / Products ── */}
          <TabsContent value="products" className="animate-in fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold uppercase tracking-widest text-sm">Shop Inventory ({products.length} items)</h2>
              <Button className="rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90" onClick={() => setProductModal({ mode: "add" })}>
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <Card key={p.id} className="rounded-none border-border/50 bg-card overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-36 object-cover border-b border-border/30" />
                  ) : (
                    <div className="w-full h-36 bg-muted/20 border-b border-border/30 flex items-center justify-center">
                      <Package className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-bold leading-tight">{p.name}</span>
                      <span className="font-serif font-bold text-primary whitespace-nowrap">₹{p.price}</span>
                    </div>
                    <div className="flex gap-2 items-center mb-3">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">{p.category}</span>
                      <span className={`text-xs font-bold ${p.inStock ? "text-green-500" : "text-destructive"}`}>{p.inStock ? `In Stock (${p.stock})` : "Out of Stock"}</span>
                      {p.featured && <span className="text-xs bg-primary/20 text-primary px-1">Featured</span>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 rounded-none text-xs flex-1" onClick={() => { setProductModal({ mode: "edit", product: p as Product }); }}>
                        <Edit2 className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-none text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProduct(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Menu ── */}
          <TabsContent value="menu" className="animate-in fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold uppercase tracking-widest text-sm">Cafe Menu ({menuItems.length} items)</h2>
              <Button className="rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90" onClick={() => { setMenuForm({ name: "", description: "", price: "", category: "coffee", featured: false }); setMenuModal({ mode: "add" }); }}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>
            <Card className="rounded-none border-border/50 bg-card divide-y divide-border/20">
              {menuItems.map(m => (
                <div key={m.id} className="flex justify-between items-center px-6 py-3 hover:bg-muted/5">
                  <div>
                    <span className="font-bold">{m.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground uppercase tracking-wider">{m.category.replace("_"," ")}</span>
                    {m.featured && <span className="ml-2 text-xs bg-primary/20 text-primary px-1">Featured</span>}
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="font-serif font-bold text-primary">₹{m.price}</span>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-none" onClick={() => { setMenuForm({ name: m.name, description: m.description, price: String(m.price), category: m.category as MenuCat, featured: m.featured }); setMenuModal({ mode: "edit", item: m }); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-none text-destructive hover:bg-destructive/10" onClick={() => handleDeleteMenu(m.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {menuItems.length === 0 && <div className="px-6 py-8 text-center text-muted-foreground">No menu items yet.</div>}
            </Card>
          </TabsContent>

          {/* ── Hero Slider ── */}
          <TabsContent value="slides" className="animate-in fade-in">

            {/* Notice Editor */}
            <div className="mb-8 bg-card border border-primary/20 p-5">
              <h3 className="text-xs uppercase tracking-widest font-bold text-primary mb-1 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" /> Slider Footer Notice
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Yeh notice slider ke neeche red bar mein dikhega. Khaali chhod do agar hide karna ho.</p>
              <div className="flex gap-2">
                <Input
                  className="rounded-none flex-1"
                  value={notice}
                  onChange={e => setNotice(e.target.value)}
                  placeholder="jaise: Aaj ka offer — 20% off sab RC cars!"
                />
                <Button onClick={handleSaveNotice} disabled={noticeSaving} className="rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90 whitespace-nowrap">
                  {noticeSaving ? "Saving..." : "Save Notice"}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold uppercase tracking-widest text-sm">Homepage Slider ({slides.length} slides)</h2>
              <Button className="rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90" onClick={() => setSlideModal({ mode: "add" })}>
                <Plus className="w-4 h-4 mr-2" /> Add Slide
              </Button>
            </div>
            <p className="text-muted-foreground text-sm mb-6">Upload a video or image for each hero slide. Videos autoplay muted in the background.</p>
            {slidesLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slides.map(slide => (
                  <Card key={slide.id} className="rounded-none border-border/50 bg-card overflow-hidden">
                    <div className="relative">
                      {slide.videoUrl ? (
                        <div className="relative w-full h-40 bg-black flex items-center justify-center overflow-hidden">
                          <video src={slide.videoUrl} className="w-full h-full object-cover opacity-80" muted playsInline />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold px-2 py-1 flex items-center gap-1">
                              <Upload className="w-3 h-3" /> Video Slide
                            </span>
                          </div>
                        </div>
                      ) : (
                        <img src={slide.imageUrl} alt={slide.title} className="w-full h-40 object-cover" onError={e => { e.currentTarget.src = ""; e.currentTarget.className = "hidden"; }} />
                      )}
                      <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-bold uppercase ${slide.active ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"}`}>
                        {slide.active ? "Live" : "Hidden"}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-sm leading-tight mb-1 truncate">{slide.title || "(No heading)"}</p>
                      <p className="text-xs text-muted-foreground mb-3 truncate">{slide.subtitle || "(No subheading)"}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 rounded-none text-xs flex-1" onClick={() => setSlideModal({ mode: "edit", slide })}>
                          <Edit2 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className={`h-8 w-8 p-0 rounded-none ${slide.active ? "text-amber-500 hover:bg-amber-500/10" : "text-green-500 hover:bg-green-500/10"}`} onClick={() => handleToggleSlide(slide)} title={slide.active ? "Hide slide" : "Show slide"}>
                          {slide.active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-none text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSlide(slide.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {slides.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border/50">
                    No slides yet. Click "Add Slide" to add your first hero image or video.
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── Messages ── */}
          <TabsContent value="messages" className="animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {messages.map(msg => (
                <Card key={msg.id} className="rounded-none border-border/50 bg-card">
                  <CardHeader className="pb-2 border-b border-border/20">
                    <CardTitle className="text-base font-bold">{msg.subject || "No Subject"}</CardTitle>
                    <div className="text-xs text-muted-foreground">{format(new Date(msg.createdAt), "PP p")}</div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <p className="text-sm">{msg.message}</p>
                    <div className="text-xs text-muted-foreground border-t border-border/20 pt-2">
                      <span className="font-bold text-foreground">{msg.name}</span> &bull; {msg.email}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {messages.length === 0 && <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border/50">No messages yet.</div>}
            </div>
          </TabsContent>

          {/* ── Settings ── */}
          <TabsContent value="settings" className="animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

              {/* ── Homepage Layout ── */}
              <div className="bg-card border border-border/50 p-6">
                <h3 className="font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-primary" /> Homepage Layout
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Sections ko upar neeche kar ke homepage ka layout change karo.</p>
                <div className="space-y-2">
                  {layoutOrder.map((key, idx) => {
                    const sec = DEFAULT_SECTIONS.find(s => s.key === key);
                    return (
                      <div key={key} className="flex items-center gap-2 border border-border/40 bg-background px-4 py-3">
                        <span className="flex-1 text-sm font-medium">{sec?.label ?? key}</span>
                        <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-20 transition-colors">
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => moveSection(idx, 1)} disabled={idx === layoutOrder.length - 1} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-20 transition-colors">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <Button onClick={handleSaveLayout} disabled={layoutSaving} className="rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90 w-full mt-4">
                  {layoutSaving ? "Saving..." : "Save Layout"}
                </Button>
              </div>

              {/* ── Font Selector ── */}
              <div className="bg-card border border-border/50 p-6">
                <h3 className="font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2">
                  <span className="text-primary font-serif text-base">A</span> Site Font
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Poori website ka font change karo.</p>
                <div className="space-y-2">
                  {FONT_OPTIONS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setSelectedFont(f.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 border transition-colors ${selectedFont === f.value ? "border-primary bg-primary/10 text-primary" : "border-border/40 bg-background hover:border-primary/40"}`}
                    >
                      <span style={{ fontFamily: `'${f.value}', sans-serif` }} className="text-sm font-medium">{f.label}</span>
                      <span style={{ fontFamily: `'${f.value}', sans-serif` }} className="text-xs text-muted-foreground">Aa Bb Cc 123</span>
                    </button>
                  ))}
                </div>
                <Button onClick={handleSaveFont} disabled={fontSaving} className="rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90 w-full mt-4">
                  {fontSaving ? "Saving..." : "Apply Font"}
                </Button>
              </div>
            </div>

            <h2 className="font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Bank Transfer Details
            </h2>
            <div className="bg-card border border-border/50 p-6 space-y-4 max-w-xl">
              <p className="text-xs text-muted-foreground">Yeh details checkout page pe show hongi jab customer "Bank Transfer" choose kare.</p>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Account Holder Name *</Label>
                <Input className="rounded-none" value={bankDetails.holderName} onChange={e => setBankDetails(d => ({ ...d, holderName: e.target.value }))} placeholder="THINLAS NORBOO" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Account Number *</Label>
                <Input className="rounded-none font-mono" value={bankDetails.accountNo} onChange={e => setBankDetails(d => ({ ...d, accountNo: e.target.value }))} placeholder="216001502780" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">IFSC Code *</Label>
                  <Input className="rounded-none font-mono uppercase" value={bankDetails.ifscCode} onChange={e => setBankDetails(d => ({ ...d, ifscCode: e.target.value.toUpperCase() }))} placeholder="ICIC0003623" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Bank Name</Label>
                  <Input className="rounded-none" value={bankDetails.bankName} onChange={e => setBankDetails(d => ({ ...d, bankName: e.target.value }))} placeholder="ICICI Bank" />
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">UPI ID (optional)</Label>
                <Input className="rounded-none" value={bankDetails.upiId} onChange={e => setBankDetails(d => ({ ...d, upiId: e.target.value }))} placeholder="yourname@upi" />
              </div>
              <Button onClick={handleSaveBank} disabled={bankSaving} className="rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90 w-full mt-2">
                {bankSaving ? "Saving..." : "Save Bank Details"}
              </Button>
            </div>
          </TabsContent>

          {/* ── Cashbacks Tab ── */}
          <TabsContent value="cashbacks" className="space-y-8 animate-in fade-in">

            {/* UPI ID Edit */}
            <div>
              <h2 className="font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" /> Shop Ka UPI ID
              </h2>
              <div className="bg-card border border-border/50 p-6 max-w-md space-y-4">
                <p className="text-xs text-muted-foreground">Yeh UPI ID Pay button par QR code mein dikhega. Customers is par seedha payment karenge.</p>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">UPI ID *</Label>
                  <Input
                    className="rounded-none font-mono text-base h-12"
                    placeholder="yourshop@upi"
                    value={upiEdit}
                    onChange={e => setUpiEdit(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Jaise: larcafe@oksbi, thinlas@paytm, 9876543210@upi</p>
                </div>
                <Button
                  onClick={handleSaveUpi}
                  disabled={upiSaving || !upiEdit.trim()}
                  className="rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90 w-full h-11"
                >
                  {upiSaving ? "Saving..." : "Save UPI ID"}
                </Button>
              </div>
            </div>

            {/* Cashback Claims */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Cashback Claims
                  <Badge variant="outline" className="ml-2 text-xs">{payments.filter(p => p.status === "pending").length} pending</Badge>
                </h2>
                <Button variant="outline" size="sm" onClick={fetchPayments} disabled={paymentsLoading} className="rounded-none uppercase tracking-widest text-xs">
                  {paymentsLoading ? "Loading..." : "Refresh"}
                </Button>
              </div>

              {/* How-to guide */}
              <div className="bg-primary/10 border border-primary/20 p-4 mb-4 text-xs space-y-1">
                <p className="font-bold uppercase tracking-widest text-primary mb-2">Cashback Bhejne ka Tarika</p>
                <p className="text-muted-foreground">1. Neeche claim dekho → <strong className="text-foreground">"UPI se Bhejo"</strong> button dabao</p>
                <p className="text-muted-foreground">2. Aapka UPI app khulega — amount aur UPI ID pehle se bhara hoga</p>
                <p className="text-muted-foreground">3. Payment bhejo → wapas aao → <strong className="text-green-400">"Paid ✓"</strong> button dabao</p>
              </div>

              {payments.length === 0 ? (
                <div className="bg-card border border-border/50 p-12 text-center text-muted-foreground">
                  <Wallet className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm uppercase tracking-widest">Abhi koi cashback claim nahi hai</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map(p => {
                    const upiDeepLink = `upi://pay?pa=${encodeURIComponent(p.customerUpiId)}&pn=${encodeURIComponent(p.customerName)}&am=${p.cashbackAmount}&cu=INR&tn=LA+RC+Cafe+Cashback`;
                    const gpayDeepLink = `gpay://upi/pay?pa=${encodeURIComponent(p.customerUpiId)}&pn=${encodeURIComponent(p.customerName)}&am=${p.cashbackAmount}&cu=INR&tn=LA+RC+Cafe+Cashback`;
                    return (
                    <div key={p.id} className="bg-card border border-border/50 p-4 space-y-3">
                      {/* Top row: name + status + date */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm">{p.customerName}</span>
                        <Badge className={`text-xs rounded-none ${p.status === "paid" ? "bg-green-600" : p.status === "rejected" ? "bg-destructive" : "bg-yellow-600"}`}>
                          {p.status === "paid" ? "✅ Paid" : p.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      {/* UPI + amounts */}
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span className="font-mono bg-muted px-2 py-1 text-foreground select-all">{p.customerUpiId}</span>
                        <span className="text-muted-foreground">Paid: <strong className="text-foreground">Rs {p.amount}</strong></span>
                        <span className="text-muted-foreground">Cashback Due: <strong className="text-primary text-sm">Rs {p.cashbackAmount}</strong></span>
                      </div>

                      {/* Action buttons */}
                      {p.status === "pending" && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {/* UPI deep link — sends money directly */}
                          <a
                            href={upiDeepLink}
                            className="flex items-center gap-1.5 px-4 h-10 bg-[#4285F4] hover:bg-[#3367d6] text-white font-bold uppercase tracking-widest text-xs transition-colors"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            UPI se Bhejo (Rs {p.cashbackAmount})
                          </a>
                          <a
                            href={gpayDeepLink}
                            className="flex items-center gap-1.5 px-3 h-10 bg-white border border-gray-300 text-gray-800 font-bold uppercase tracking-widest text-xs transition-colors hover:bg-gray-50"
                          >
                            GPay
                          </a>
                          {/* Mark as paid — after sending */}
                          <Button
                            size="sm"
                            className="rounded-none uppercase tracking-widest text-xs bg-green-600 hover:bg-green-700 h-10 px-4"
                            onClick={() => handleUpdatePayment(p.id, "paid")}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Paid ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-none uppercase tracking-widest text-xs border-destructive/50 text-destructive hover:bg-destructive hover:text-white h-10 px-3"
                            onClick={() => handleUpdatePayment(p.id, "rejected")}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
