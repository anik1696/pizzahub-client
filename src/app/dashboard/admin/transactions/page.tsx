"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { FiDollarSign } from "react-icons/fi";

export default function AdminTransactionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== "admin") { router.push("/dashboard"); return; }
      api.get("/api/payments/transactions")
        .then((r) => setTransactions(r.data))
        .catch(() => toast.error("Failed to load transactions"))
        .finally(() => setPageLoading(false));
    }
  }, [user, loading]);

  if (loading || pageLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  );

  const totalRevenue = transactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-foreground">Transactions</h1>
        <p className="text-muted-foreground mt-1">{transactions.length} transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: formatPrice(totalRevenue), icon: "💰", color: "text-green-500" },
          { label: "Completed", value: transactions.filter((t) => t.status === "completed").length, icon: "✅", color: "text-green-500" },
          { label: "Pending / Failed", value: transactions.filter((t) => t.status !== "completed").length, icon: "⏳", color: "text-yellow-500" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                {["Vendor ID", "Plan", "Amount", "Status", "Reference", "Date"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">No transactions found.</td>
                </tr>
              ) : transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 text-xs text-muted-foreground font-mono">{tx.vendorId?.slice(0, 12)}...</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold capitalize px-2.5 py-1 rounded-full bg-secondary/10 text-secondary">{tx.plan}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-primary">{formatPrice(tx.amount)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      tx.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      tx.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}>{tx.status}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground font-mono">{tx.reference || tx.stripeSessionId?.slice(0, 16) || '—'}</td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-muted/50 border border-border rounded-xl p-4 text-xs text-muted-foreground">
        🔒 <strong>Note:</strong> Transaction records are read-only. All vendor subscription plan records are stored here for audit purposes.
      </div>
    </div>
  );
}
