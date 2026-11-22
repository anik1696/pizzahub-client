"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiX, FiArrowLeft, FiShoppingBag } from "react-icons/fi";
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiX className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-3">Order Cancelled</h1>
        <p className="text-muted-foreground mb-6">
          Your order was not placed. No charges were made. Feel free to browse the menu and try again anytime!
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <FiShoppingBag /> Browse Menu
          </Link>
          <Link
            href="/dashboard/customer"
            className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-muted/50 transition-colors"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
