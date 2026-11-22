"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiCheck, FiArrowRight, FiShoppingBag } from "react-icons/fi";
import { GiFullPizza } from "react-icons/gi";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Refresh user data after order confirmation
    refreshUser().finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
      >
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <GiFullPizza className="h-12 w-12 text-primary animate-spin" style={{ animationDuration: "2s" }} />
          </div>
        ) : (
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
                  <span className="font-mono font-semibold text-xs">{orderId.slice(0, 16)}...</span>
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
