"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiShoppingBag, FiClock, FiCheck, FiX, FiArrowRight, FiTrendingUp } from "react-icons/fi";
import api from "@/lib/api";
import Link from "next/link";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

const COLORS = ["#CA8A04", "#16A34A", "#DC2626", "#6B7280"];

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0, cancelled: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== "customer") {
        router.push(`/dashboard/${user.role}`);
        return;
      }
      Promise.all([
        api.get("/api/orders/customer/stats"),
        api.get("/api/orders/my-orders"),
      ]).then(([statsRes, ordersRes]) => {
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
      }).catch(() => {}).finally(() => setStatsLoading(false));
    }
  }, [user, loading, router]);

  if (loading || statsLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  );

  const cards = [
    { label: "Total Orders", value: stats.total, icon: FiShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending", value: stats.pending, icon: FiClock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Accepted", value: stats.accepted, icon: FiCheck, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Rejected", value: stats.rejected, icon: FiX, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  // Chart data
  const pieData = [
    { name: "Pending", value: stats.pending || 0 },
    { name: "Accepted", value: stats.accepted || 0 },
    { name: "Rejected", value: stats.rejected || 0 },
    { name: "Cancelled", value: stats.cancelled || 0 },
  ].filter((d) => d.value > 0);

  const barData = [
    { status: "Pending", count: stats.pending || 0 },
    { status: "Accepted", count: stats.accepted || 0 },
    { status: "Rejected", count: stats.rejected || 0 },
  ];

  const radarData = [
    { subject: "Pending", A: stats.pending || 0, fullMark: Math.max(stats.total, 1) },
    { subject: "Accepted", A: stats.accepted || 0, fullMark: Math.max(stats.total, 1) },
    { subject: "Rejected", A: stats.rejected || 0, fullMark: Math.max(stats.total, 1) },
    { subject: "Cancelled", A: stats.cancelled || 0, fullMark: Math.max(stats.total, 1) },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground text-sm mt-1">Your order history and status at a glance</p>
        </div>
        <Link
          href="/menu"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Order Pizza
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-black text-foreground">{card.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Order Status Breakdown</h2>
          </div>
          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "13px" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
              No order data yet
            </div>
          )}
        </motion.div>

        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Orders by Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="status" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "13px" }}
              />
              <Bar dataKey="count" fill="#DC2626" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Radar chart - order activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Order Activity Radar</h2>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Radar name="Orders" dataKey="A" stroke="#DC2626" fill="#DC2626" fillOpacity={0.25} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "13px" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
          <Link href="/dashboard/customer/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <FiArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm mb-4">You haven&apos;t placed any orders yet.</p>
            <Link href="/menu" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {order.itemId?.images?.[0] ? (
                    <img src={order.itemId.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🍕</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{order.itemId?.itemName || "Unknown Item"}</p>
                  <p className="text-xs text-muted-foreground">Delivery: {new Date(order.deliveryDate).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  order.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                  order.status === "accepted" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                  order.status === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
