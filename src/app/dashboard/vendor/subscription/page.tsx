"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { FiCheck, FiPackage, FiShoppingBag, FiBarChart2, FiHeadphones } from "react-icons/fi";
import { GiFullPizza } from "react-icons/gi";

export default function SubscriptionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== "vendor") router.push("/dashboard");
  }, [user, loading, router]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <GiFullPizza className="h-10 w-10 text-primary animate-spin" style={{ animationDuration: "2s" }} />
    </div>
  );

  const features = [
    { icon: FiPackage, title: "Unlimited Menu Items", desc: "Add as many pizzas and items as you like — no limits, no restrictions." },
    { icon: FiShoppingBag, title: "Full Order Management", desc: "Accept, reject, and track every customer order from your dashboard." },
    { icon: FiBarChart2, title: "Sales Analytics", desc: "View charts and stats for your orders, revenue, and popular items." },
    { icon: FiHeadphones, title: "Customer Support", desc: "Get help from the PizzaHub team whenever you need it." },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground">Your Plan</h1>
        <p className="text-muted-foreground mt-1">All vendor features are included — completely free.</p>
      </div>

      {/* Active plan banner */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
          <GiFullPizza className="h-8 w-8 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-black text-foreground">PizzaHub Vendor</span>
            <span className="text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">Active</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Your vendor account is active. All features are available at no cost.
          </p>
        </div>
        <div className="ml-auto text-right flex-shrink-0">
          <p className="text-3xl font-black text-primary">৳0</p>
          <p className="text-xs text-muted-foreground">forever</p>
        </div>
      </div>

      {/* Feature list */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-bold text-foreground mb-5">What's included</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
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

      <p className="text-center text-xs text-muted-foreground">
        PizzaHub is free for all vendors. No credit card required. No hidden charges.
      </p>
    </div>
  );
}
