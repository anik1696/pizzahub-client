"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { FiUser, FiBriefcase, FiImage } from "react-icons/fi";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", businessName: "", image: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (!loading && !user) { router.push("/signin"); return; }
    if (user) {
      setForm({ name: user.name || "", businessName: user.businessName || "", image: user.image || "" });
      setImagePreview(user.image || "");
    }
  }, [user, loading]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const formData = new FormData();
        formData.append("key", process.env.NEXT_PUBLIC_IMGBB_API_KEY || "");
        formData.append("image", base64);
        const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
          setForm((f) => ({ ...f, image: data.data.display_url }));
          setImagePreview(data.data.display_url);
          toast.success("Image uploaded!");
        } else { toast.error("Image upload failed"); }
        setUploadingImage(false);
      };
    } catch { toast.error("Image upload failed"); setUploadingImage(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/users/profile/update", { name: form.name, image: form.image, businessName: form.businessName });
      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" /></div>;

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Update your personal information.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-primary/20" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                  <FiUser className="h-10 w-10 text-primary" />
                </div>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
                <FiImage className="h-4 w-4" />
                {uploadingImage ? "Uploading..." : "Change Photo"}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploadingImage} />
              </label>
              <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG up to 5MB</p>
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
              <span className="font-medium capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subscription</span>
              <span className="font-medium capitalize">{user?.subscriptionPlan}</span>
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
