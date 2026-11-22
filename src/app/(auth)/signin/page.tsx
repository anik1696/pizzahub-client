"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { GiFullPizza } from "react-icons/gi";
import { useAuth } from "@/contexts/AuthContext";

export default function SignInPage() {
  const { login, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") router.push("/dashboard/admin");
      else if (user.role === "vendor") router.push("/dashboard/vendor");
      else router.push("/dashboard/customer");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
    } catch (err: any) {
      setError(err.message || "Incorrect email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left photo panel */}
      <div className="hidden lg:block lg:w-[52%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=85"
          alt="Restaurant interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <div className="flex items-center gap-2 mb-6">
            <GiFullPizza className="h-7 w-7 text-white" />
            <span className="text-2xl font-bold text-white">
              Pizza<span className="text-orange-400">Hub</span>
            </span>
          </div>
          <h2 className="text-3xl font-black text-white mb-3 leading-snug">
            Your favourite pizza,<br />delivered to your door.
          </h2>
          <p className="text-white/60 text-sm max-w-sm leading-relaxed">
            Sign in to browse local restaurants, track your orders, and manage your account.
          </p>
          <div className="mt-6 flex gap-6">
            {[
              { value: "200+", label: "Restaurants" },
              { value: "10K+", label: "Happy customers" },
              { value: "28 min", label: "Avg. delivery" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-white font-black text-xl">{value}</p>
                <p className="text-white/50 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo (mobile only) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <GiFullPizza className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">
              <span className="text-primary">Pizza</span><span className="text-secondary">Hub</span>
            </span>
          </div>

          <h1 className="text-2xl font-black text-foreground mb-1">Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-7">
            No account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/8 text-destructive border border-destructive/20 rounded-lg px-4 py-3 mb-5 text-sm">
              <FiAlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 text-sm transition-shadow"
                />
              </div>
            </div>

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
                  className="w-full pl-9 pr-10 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 text-sm transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-55 mt-1"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
            </div>
          </div>

          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-2.5 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors text-sm"
          >
            <FcGoogle className="h-4.5 w-4.5" /> Continue with Google
          </button>
        </motion.div>
      </div>
    </div>
  );
}
