"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiBriefcase, FiAlertCircle, FiImage } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { GiFullPizza } from "react-icons/gi";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const passwordRules = (pw: string) => ({
  length: pw.length >= 6,
  upper: /[A-Z]/.test(pw),
  lower: /[a-z]/.test(pw),
});

// Inner component that uses useSearchParams (must be inside Suspense)
function SignUpForm() {
  const { register, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer" as "customer" | "vendor",
    businessName: "",
    image: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const rules = passwordRules(form.password);
  const allRules = rules.length && rules.upper && rules.lower;

  // Any logged-in user visiting signup → redirect to their dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") router.push("/dashboard/admin");
      else if (user.role === "vendor") router.push("/dashboard/vendor");
      else router.push("/dashboard/customer");
    }
  }, [user, loading, router]);

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
        } else {
          toast.error("Image upload failed");
        }
        setUploadingImage(false);
      };
    } catch {
      toast.error("Image upload failed");
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!allRules) {
      setError("Password does not meet the requirements.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        image: form.image,
        businessName: form.role === "vendor" ? form.businessName : undefined,
      });
      // Redirect based on the actual role set
      if (form.role === "vendor") router.push("/dashboard/vendor");
      else router.push("/dashboard/customer");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left photo panel */}
      <div className="hidden lg:block lg:w-[52%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=85"
          alt="Pizza"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <div className="flex items-center gap-2 mb-6">
            <GiFullPizza className="h-7 w-7 text-white" />
            <span className="text-2xl font-bold text-white">
              Pizza<span className="text-orange-400">Hub</span>
            </span>
          </div>
          <h2 className="text-3xl font-black text-white mb-3 leading-snug">
            Start ordering from<br />local restaurants today.
          </h2>
          <p className="text-white/60 text-sm max-w-sm leading-relaxed">
            Create a free account as a customer to place orders, or as a vendor to list your restaurant.
          </p>
          <div className="mt-6 space-y-2">
            {[
              "Free to sign up, no credit card required",
              "Browse 200+ local restaurants immediately",
              "Vendors get a free tier with 3 menu items",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-white/70 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md py-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <GiFullPizza className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">
              <span className="text-primary">Pizza</span><span className="text-secondary">Hub</span>
            </span>
          </div>

          <h1 className="text-3xl font-black text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground mb-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(["customer", "vendor"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: r }))}
                className={`flex items-center gap-2 justify-center py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                  form.role === r
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {r === "customer" ? <FiUser className="h-4 w-4" /> : <FiBriefcase className="h-4 w-4" />}
                {r === "customer" ? "Customer" : "Vendor (Restaurant)"}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl px-4 py-3 mb-5 text-sm">
              <FiAlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>
            </div>

            {/* Business Name (vendor) */}
            {form.role === "vendor" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Restaurant / Business Name</label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                    placeholder="Tony's Pizzeria"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  {[{ key: "length", label: "Min. 6 characters" }, { key: "upper", label: "One uppercase letter" }, { key: "lower", label: "One lowercase letter" }].map(({ key, label }) => (
                    <div key={key} className={`text-xs flex items-center gap-1.5 ${rules[key as keyof typeof rules] ? "text-green-600" : "text-muted-foreground"}`}>
                      <span>{rules[key as keyof typeof rules] ? "✓" : "○"}</span> {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  required
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm ${
                    form.confirmPassword && form.password !== form.confirmPassword ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
            </div>

            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Profile Image (optional)</label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
                )}
                <label className="flex-1 flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-xl cursor-pointer hover:bg-accent transition-colors text-sm text-muted-foreground">
                  <FiImage className="h-4 w-4" />
                  {uploadingImage ? "Uploading..." : "Choose image"}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-60 shadow-lg shadow-primary/20 mt-2"
            >
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground">or continue with</span>
            </div>
          </div>

          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 border border-border rounded-xl font-medium hover:bg-accent transition-colors text-sm"
          >
            <FcGoogle className="h-5 w-5" /> Sign Up with Google
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// Suspense wrapper required because SignUpForm uses useSearchParams()
export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <GiFullPizza className="h-12 w-12 text-primary animate-spin" style={{ animationDuration: "2s" }} />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
