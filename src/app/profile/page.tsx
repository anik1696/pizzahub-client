"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { FiUser, FiBriefcase, FiImage, FiLink } from "react-icons/fi";

// Compress and convert image to lightweight Data URL so uploads never fail
const resizeImageToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSize = 256;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", businessName: "", image: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  useEffect(() => {
    if (!loading && !user) { router.push("/signin"); return; }
    if (user) {
      setForm({ name: user.name || "", businessName: user.businessName || "", image: user.image || "" });
      setImagePreview(user.image || "");
      setCustomUrl(user.image || "");
    }
  }, [user, loading, router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

      // If ImgBB API key is provided, try uploading to ImgBB
      if (apiKey && apiKey !== "your_imgbb_api_key") {
        try {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => resolve((reader.result as string).split(",")[1]);
            reader.readAsDataURL(file);
          });
          const base64 = await base64Promise;

          const formData = new FormData();
          formData.append("key", apiKey);
          formData.append("image", base64);
          const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: formData });
          const data = await res.json();

          if (data.success && data.data?.display_url) {
            setForm((f) => ({ ...f, image: data.data.display_url }));
            setImagePreview(data.data.display_url);
            setCustomUrl(data.data.display_url);
            toast.success("Image uploaded to ImgBB!");
            setUploadingImage(false);
            return;
          }
        } catch {
          // Fall through to local optimized data URL
        }
      }

      // Fallback: fast local high-quality resized avatar (always succeeds)
      const dataUrl = await resizeImageToDataUrl(file);
      setForm((f) => ({ ...f, image: dataUrl }));
      setImagePreview(dataUrl);
      setCustomUrl(dataUrl);
      toast.success("Profile photo ready! Click 'Save Changes' to update.");
    } catch {
      toast.error("Could not process image file. You can also paste an Image URL below.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUrlApply = () => {
    if (!customUrl.trim()) return;
    setForm((f) => ({ ...f, image: customUrl.trim() }));
    setImagePreview(customUrl.trim());
    toast.success("Image URL applied! Click 'Save Changes' to update.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/users/profile/update", {
        name: form.name,
        image: form.image,
        businessName: form.businessName,
      });
      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Update your personal information and profile picture.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-md"
                  onError={() => setImagePreview("")}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                  <FiUser className="h-12 w-12 text-primary" />
                </div>
              )}
            </div>

            <div className="space-y-3 flex-1 w-full text-center sm:text-left">
              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer bg-background border border-border rounded-xl px-4 py-2 text-sm font-medium hover:bg-accent transition-colors shadow-sm">
                  <FiImage className="h-4 w-4" />
                  {uploadingImage ? "Processing..." : "Upload Photo File"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, WebP</p>
              </div>

              {/* Direct URL input option */}
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
                  <input
                    type="url"
                    placeholder="Or paste an image URL..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-border rounded-lg bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUrlApply}
                  className="px-3 py-1.5 text-xs bg-muted hover:bg-accent text-foreground rounded-lg font-medium transition-colors border border-border"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Account info (read-only) */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Info (Read-only)</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium capitalize px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold text-xs">
                {user?.role}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subscription</span>
              <span className="font-medium capitalize text-xs">
                {user?.subscriptionPlan}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>
            </div>

            {user?.role === "vendor" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Restaurant / Business Name</label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                    placeholder="Your restaurant name"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-60 shadow-lg shadow-primary/20"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
