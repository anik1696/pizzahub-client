"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  FiCheck, FiPackage, FiShoppingBag, FiBarChart2, FiHeadphones,
  FiStar, FiLock, FiArrowRight, FiZap,
} from "react-icons/fi";
import { GiFullPizza } from "react-icons/gi";

export default function SubscriptionPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user?.role !== "vendor") router.push("/dashboard");
    if (!loading && user) {
      setIsPremium((user as any).subscriptionPlan === "premium");
      setExpiresAt((user as any).subscriptionExpiresAt || null);
    }
  }, [user, loading, router]);

  const handleUpgrade = async () => {
    setCheckingOut(true);
    try {
      const res = await api.post("/api/payments/create-checkout-session");
      const { url } = res.data;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Could not start checkout. Please try again.");
      }
    } catch (err: any) {
      if (err.response?.data?.message?.includes("already on the Premium")) {
        toast.success("You are already on the Premium plan!");
        await refreshUser();
        setIsPremium(true);
      } else {
        toast.error(err.response?.data?.message || "Checkout failed. Please try again.");
      }
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <GiFullPizza className="h-10 w-10 text-primary animate-spin" style={{ animationDuration: "2s" }} />
    </div>
  );

  const freeFeatures = [
    "Up to 3 menu items",
    "Order management",
    "Basic dashboard",
    "Customer reviews",
  ];

  const premiumFeatures = [
    { icon: FiPackage, title: "Unlimited Menu Items", desc: "Add as many pizzas as you like — no limits, no restrictions." },
    { icon: FiZap, title: "Premium Badge", desc: "Stand out with a Premium vendor badge on all your listings." },
    { icon: FiShoppingBag, title: "Full Order Management", desc: "Accept, reject, and track every customer order in real time." },
    { icon: FiBarChart2, title: "Sales Analytics", desc: "View charts and stats for revenue, orders, and popular items." },
    { icon: FiStar, title: "Featured Placement", desc: "Your items get priority placement on the homepage and search results." },
    { icon: FiHeadphones, title: "Priority Support", desc: "Get dedicated help from the PizzaHub team whenever you need it." },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground">Subscription Plans</h1>
        <p className="text-muted-foreground mt-1">
          {isPremium
            ? "You are on the Premium plan. Enjoy unlimited menu items and all premium features!"
            : "Upgrade to Premium to unlock unlimited menu items and grow your business."}
        </p>
      </div>

      {/* Premium active banner */}
      {isPremium && (
        <div className="bg-gradient-to-r from-amber-500/10 to-primary/10 border-2 border-amber-400/50 rounded-2xl p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-primary flex items-center justify-center flex-shrink-0">
            <FiStar className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-black text-foreground">Premium Plan</span>
              <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-muted-foreground text-sm">
              All premium features are unlocked.
              {expiresAt && (
                <> Renews on <strong>{new Date(expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong>.</>
              )}
            </p>
          </div>
          <div className="ml-auto text-right flex-shrink-0">
            <p className="text-3xl font-black text-primary">৳999</p>
            <p className="text-xs text-muted-foreground">/year</p>
          </div>
        </div>
      )}

      {/* Plan cards */}
      {!isPremium && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free plan */}
          <div className="bg-card border-2 border-border rounded-2xl p-6 flex flex-col">
            <div className="mb-4">
              <span className="text-xs font-bold bg-muted text-muted-foreground px-3 py-1 rounded-full uppercase tracking-wide">Current Plan</span>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-black text-foreground">Free</span>
            </div>
            <p className="text-3xl font-black text-foreground mb-1">৳0</p>
            <p className="text-xs text-muted-foreground mb-6">forever</p>

            <ul className="space-y-3 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
              <li className="flex items-center gap-3 text-sm">
                <FiLock className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                <span className="text-muted-foreground/50 line-through">Unlimited menu items</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <FiLock className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                <span className="text-muted-foreground/50 line-through">Premium badge & featured placement</span>
              </li>
            </ul>

            <div className="mt-6 py-3 border border-border rounded-xl text-center text-sm font-semibold text-muted-foreground cursor-default">
              Current Plan
            </div>
          </div>

          {/* Premium plan */}
          <div className="bg-gradient-to-b from-primary/5 to-transparent border-2 border-primary rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl">
              RECOMMENDED
            </div>
            <div className="mb-4">
              <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wide">Premium Plan</span>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-black text-foreground">Premium</span>
            </div>
            <p className="text-3xl font-black text-primary mb-0.5">৳999</p>
            <p className="text-xs text-muted-foreground mb-6">per year (approx \$9.99 USD)</p>

            <ul className="space-y-3 flex-1">
              {premiumFeatures.map(({ icon: Icon, title }) => (
                <li key={title} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3 w-3 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{title}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={checkingOut}
              className="mt-6 w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {checkingOut ? (
                <>
                  <GiFullPizza className="h-4 w-4 animate-spin" style={{ animationDuration: "1s" }} />
                  Redirecting to Stripe…
                </>
              ) : (
                <>
                  Upgrade to Premium <FiArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Secure payment via Stripe · Test card: 4242 4242 4242 4242
            </p>
          </div>
        </div>
      )}

      {/* Premium features detail (shown to all) */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-bold text-foreground mb-5">
          {isPremium ? "Your Premium Features" : "What you get with Premium"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {premiumFeatures.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                  <FiCheck className="h-3.5 w-3.5 text-green-500" /> {title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isPremium && (
        <p className="text-center text-xs text-muted-foreground">
          Payments are processed securely by Stripe. Cancel anytime.
        </p>
      )}
    </div>
  );
}
