"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { FiX, FiImage, FiPlus, FiUpload, FiLink, FiAlertCircle } from "react-icons/fi";
import { GiFullPizza } from "react-icons/gi";
import { CATEGORIES, BD_LOCATIONS } from "@/lib/utils";
import Link from "next/link";

const LOCATIONS = BD_LOCATIONS;
const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "";

type UploadMode = "file" | "url";

export default function AddMenuItemPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    itemName: "",
    category: "Classic Pizzas",
    description: "",
    price: "",
    location: "Dhaka",
  });

  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadMode, setUploadMode] = useState<UploadMode>("file");
  const [uploading, setUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [planLimitHit, setPlanLimitHit] = useState(false);

  /* ── ImgBB file upload ─────────────────────────────────── */
  const uploadToImgBB = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", IMGBB_KEY);

    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("ImgBB upload failed");
    const data = await res.json();
    return data?.data?.display_url || null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = 4 - images.length;
    const toUpload = files.slice(0, remaining);

    if (toUpload.length === 0) {
      toast.error("Maximum 4 images allowed");
      return;
    }

    setUploading(true);
    const toastId = toast.loading(`Uploading ${toUpload.length} image(s) to ImgBB…`);

    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`, { id: toastId });
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10 MB`, { id: toastId });
          continue;
        }
        const url = await uploadToImgBB(file);
        if (url) urls.push(url);
      }
      setImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) uploaded!`, { id: toastId });
    } catch (err: any) {
      toast.error("Image upload failed. Try a URL instead.", { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ── URL add ───────────────────────────────────────────── */
  const addImageUrl = () => {
    if (!imageUrl.trim()) return;
    if (!/^https?:\/\/.+\..+/.test(imageUrl.trim())) {
      toast.error("Please enter a valid image URL (must start with http/https)");
      return;
    }
    if (images.length >= 4) { toast.error("Maximum 4 images allowed"); return; }
    if (images.includes(imageUrl.trim())) { toast.error("This URL is already added"); return; }
    setImages((prev) => [...prev, imageUrl.trim()]);
    setImageUrl("");
    setPreviewError(false);
  };

  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  /* ── Form submit ───────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) { toast.error("Please add at least one image"); return; }
    setSubmitting(true);
    setPlanLimitHit(false);
    try {
      await api.post("/api/menu-items", {
        ...form,
        price: parseFloat(form.price),
        image: images[0],
        images,
      });
      toast.success("Menu item submitted! Pending admin approval.");
      router.push("/dashboard/vendor/menu-items");
    } catch (err: any) {
      if (err.response?.data?.code === "PLAN_LIMIT") {
        setPlanLimitHit(true);
        toast.error("Free plan limit reached (3 items max).");
      } else {
        toast.error(err.response?.data?.message || "Failed to create item");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <GiFullPizza className="h-10 w-10 text-primary animate-spin" style={{ animationDuration: "2s" }} />
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

      {/* Plan limit banner */}
      {planLimitHit && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-2xl p-5 flex items-start gap-4">
          <FiAlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800 dark:text-amber-200">Free Plan Limit Reached</p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              You have reached the maximum of 3 menu items on the free plan.{" "}
              <Link href="/dashboard/vendor/subscription" className="underline font-semibold">
                Upgrade to Premium
              </Link>{" "}
              for unlimited items.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">

        {/* Item Name */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Item Name <span className="text-destructive">*</span></label>
          <input
            type="text"
            value={form.itemName}
            onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))}
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
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
              placeholder="e.g. 850"
              className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">City <span className="text-destructive">*</span></label>
            <select
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            >
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Description <span className="text-destructive">*</span></label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
            rows={4}
            placeholder="Describe your menu item — ingredients, crust type, special sauces, etc."
            className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
          />
        </div>

        {/* Images section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-foreground">
              Item Images <span className="text-destructive">*</span>
              <span className="text-muted-foreground font-normal ml-1">({images.length}/4)</span>
            </label>
            {/* Toggle upload mode */}
            <div className="flex gap-1 bg-muted rounded-lg p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                  uploadMode === "file" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FiUpload className="h-3 w-3" /> Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("url")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                  uploadMode === "url" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FiLink className="h-3 w-3" /> URL
              </button>
            </div>
          </div>

          {/* Image previews */}
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

          {images.length < 4 && (
            <>
              {/* File upload mode */}
              {uploadMode === "file" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="imgbb-upload"
                  />
                  <label
                    htmlFor="imgbb-upload"
                    className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors ${
                      uploading ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    {uploading ? (
                      <>
                        <GiFullPizza className="h-8 w-8 text-primary animate-spin" style={{ animationDuration: "1.5s" }} />
                        <span className="text-sm text-muted-foreground">Uploading to ImgBB…</span>
                      </>
                    ) : (
                      <>
                        <FiUpload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Click to upload images</span>
                        <span className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10 MB each</span>
                      </>
                    )}
                  </label>
                </div>
              )}

              {/* URL mode */}
              {uploadMode === "url" && (
                <div>
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
              )}
            </>
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
            disabled={submitting || uploading}
            className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 shadow-lg shadow-primary/20"
          >
            {submitting ? "Submitting…" : "Submit for Approval 🍕"}
          </button>
        </div>
      </form>
    </div>
  );
}
