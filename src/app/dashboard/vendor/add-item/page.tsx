"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { FiX, FiImage, FiPlus, FiInfo } from "react-icons/fi";
import { CATEGORIES, BD_LOCATIONS } from "@/lib/utils";

const LOCATIONS = BD_LOCATIONS;

const SAMPLE_URLS = [
  "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
  "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
];

export default function AddMenuItemPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    itemName: "",
    category: "Classic Pizzas",
    description: "",
    price: "",
    location: "Dhaka",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [previewError, setPreviewError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addImageUrl = () => {
    if (!imageUrl.trim()) return;
    if (!/^https?:\/\/.+\..+/.test(imageUrl.trim())) {
      toast.error("Please enter a valid image URL (must start with http/https)");
      return;
    }
    if (images.length >= 4) { toast.error("Maximum 4 images allowed"); return; }
    if (images.includes(imageUrl.trim())) { toast.error("This URL is already added"); return; }
    setImages(prev => [...prev, imageUrl.trim()]);
    setImageUrl("");
    setPreviewError(false);
  };

  const removeImage = (i: number) => setImages(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) { toast.error("Please add at least one image URL"); return; }
    setSubmitting(true);
    try {
      await api.post("/api/menu-items", {
        ...form,
        price: parseFloat(form.price),
        image: images[0],   // primary image (single field)
        images,             // all images array
      });
      toast.success("Menu item submitted! Pending admin approval.");
      router.push("/dashboard/vendor/menu-items");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create item");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  );

  if (!user || user.role !== "vendor") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground">Add Menu Item</h1>
        <p className="text-muted-foreground mt-1">New items require admin approval before appearing publicly.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">

        {/* Item Name */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Item Name <span className="text-destructive">*</span></label>
          <input
            type="text"
            value={form.itemName}
            onChange={(e) => setForm(f => ({ ...f, itemName: e.target.value }))}
            required
            placeholder="e.g. Pepperoni Paradise"
            className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Category <span className="text-destructive">*</span></label>
          <select
            value={form.category}
            onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Price & Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Price in Taka (৳) <span className="text-destructive">*</span></label>
            <input
              type="number"
              step="1"
              min="1"
              value={form.price}
              onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
              required
              placeholder="e.g. 850"
              className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">City <span className="text-destructive">*</span></label>
            <select
              value={form.location}
              onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            >
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Description <span className="text-destructive">*</span></label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            required
            rows={4}
            placeholder="Describe your menu item — ingredients, crust type, special sauces, etc."
            className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
          />
        </div>

        {/* Image URL input */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Item Images <span className="text-destructive">*</span>
            <span className="text-muted-foreground font-normal ml-1">(paste image URL, up to 4)</span>
          </label>

          {/* How to get free image URLs */}
          <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-xs text-blue-800 dark:text-blue-300 flex gap-2">
            <FiInfo className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              Get free image URLs from{" "}
              <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="underline font-semibold">unsplash.com</a>
              {" "}— right-click any photo → Copy image address. Or use{" "}
              <a href="https://imgur.com" target="_blank" rel="noreferrer" className="underline font-semibold">imgur.com</a>
              {" "}to upload your own photos and get a URL.
            </span>
          </div>

          {/* Added images preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Cover</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* URL input row */}
          {images.length < 4 && (
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <FiImage className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => { setImageUrl(e.target.value); setPreviewError(false); }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-9 pr-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={addImageUrl}
                className="px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-1.5"
              >
                <FiPlus className="h-4 w-4" /> Add
              </button>
            </div>
          )}

          {/* Live preview of typed URL */}
          {imageUrl && !previewError && (
            <div className="mt-2 rounded-xl overflow-hidden border border-border bg-muted h-32">
              <img
                src={imageUrl}
                alt="preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewError(true)}
              />
            </div>
          )}
          {previewError && imageUrl && (
            <p className="mt-1 text-xs text-destructive">Could not load image from this URL. Try a different one.</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3.5 border border-border rounded-xl font-semibold text-sm hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 shadow-lg shadow-primary/20"
          >
            {submitting ? "Submitting..." : "Submit for Approval 🍕"}
          </button>
        </div>
      </form>
    </div>
  );
}
