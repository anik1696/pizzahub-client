"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiCheck, FiArrowRight, FiShoppingBag, FiStar } from "react-icons/fi";
import { GiFullPizza } from "react-icons/gi";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import api from "@/lib/api";

type Mode = "stripe" | "order" | "loading";

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState<Mode>("loading");
  const [transaction, setTransaction] = useState<any>(null);

  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const init = async () => {
      if (sessionId) {
        // Stripe premium subscription flow
        try {
          const res = await api.get(`/api/payments/verify-session/${sessionId}`);
          setTransaction(res.data);
        } catch {
          // transaction might not be found yet if webhook hasn't fired — still show success
          setTransaction(null);
        }
        // Refresh user to get new subscriptionPlan
        await refreshUser().catch(() => {});
        setMode("stripe");
      } else {
        // Regular order flow
        await refreshUser().catch(() => {});
        setMode("order");
      }
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
      >
        {mode === "loading" ? (
          <div className="flex flex-col items-center justify-center h-40 gap-4">
            <GiFullPizza className="h-12 w-12 text-primary animate-spin" style={{ animationDuration: "2s" }} />
            <p className="text-muted-foreground text-sm">Confirming your payment…</p>
          </div>
        ) : mode === "stripe" ? (
          /* ── Stripe premium subscription success ── */
          <>
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiStar className="h-10 w-10 text-amber-500" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-3">Premium Activated! 🎉</h1>
            <p className="text-muted-foreground mb-6">
              Welcome to PizzaHub Premium! Your subscription is now active. Enjoy unlimited menu items and all premium features.
            </p>

            <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-semibold text-amber-600 flex items-center gap-1">
                  <FiStar className="h-3.5 w-3.5" /> Premium
                </span>
              </div>
              {transaction?.amount && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold">${transaction.amount.toFixed(2)} USD</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-green-600">Paid</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/vendor/add-item"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                <FiShoppingBag /> Add Unlimited Items
              </Link>
              <Link
                href="/dashboard/vendor"
                className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-muted/50 transition-colors"
              >
                Go to Dashboard <FiArrowRight />
              </Link>
            </div>
          </>
        ) : (
          /* ── Regular order success ── */
          <>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-3">Order Confirmed! 🎉</h1>
            <p className="text-muted-foreground mb-6">
              Your order has been placed successfully. Our restaurant team will prepare your pizza and deliver it fresh to your door!
            </p>

            <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left space-y-2">
              {orderId && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono font-semibold text-xs">{orderId.slice(0, 16)}…</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Delivery</span>
                <span className="font-semibold text-primary">28–45 minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-semibold text-green-600">Cash on Delivery</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/customer/orders"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                <FiShoppingBag /> Track My Orders
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-muted/50 transition-colors"
              >
                Order More <FiArrowRight />
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
