"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { GiFullPizza } from "react-icons/gi";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-8xl mb-6 inline-block"
        >
          🍕
        </motion.div>
        <h1 className="text-8xl font-black text-primary mb-4">404</h1>
        <h2 className="text-3xl font-black text-foreground mb-3">Page Not Found</h2>
        <p className="text-muted-foreground text-lg mb-8">
          Oops! Looks like this pizza slice got lost. The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg"
        >
          <FiArrowLeft /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
