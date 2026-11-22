"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import Link from "next/link";
import {
  FiList, FiShoppingBag, FiCreditCard, FiArrowRight,
  FiCheck, FiClock, FiPackage, FiStar, FiTrendingUp,
} from "react-icons/fi";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, RadialBarChart, RadialBar, Legend,
} from "recharts";

const COLORS = ["#DC2626", "#EA580C", "#16A34A", "#2563EB", "#9333EA"];

export default function VendorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState({
    totalItems: 0, activeItems: 0, pendingItems: 0, pendingOrders: 0, acceptedOrders: 0, rejectedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== "vendor") { router.push(`/dashboard/${user.role === "admin" ? "admin" : "customer"}`); return; }
      Promise.all([
        api.get("/api/menu-items/vendor/my-items"),
        api.get("/api/orders/vendor/stats"),
        api.get("/api/orders/vendor-orders"),
      ]).then(([itemsRes, statsRes, ordersRes]) => {
        const items = itemsRes.data;
        setData({
          totalItems: items.length,
          activeItems: items.filter((i: any) => i.status === "approved").length,
          pendingItems: items.filter((i: any) => i.status === "pending").length,
          pendingOrders: statsRes.data.pendingOrders || 0,
          acceptedOrders: statsRes.data.acceptedOrders || 0,
          rejectedOrders: statsRes.data.rejectedOrders || 0,
        });
        setRecentOrders(ordersRes.data.slice(0, 5));
      }).catch(() => {}).finally(() => setPageLoading(false));
    }
  }, [user, loading, router]);

  if (loading || pageLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  );

  const cards = [
    { label: "Total Menu Items", value: data.totalItems, icon: FiList, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Items", value: data.activeItems, icon: FiCheck, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Pending Orders", value: data.pendingOrders, icon: FiClock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Accepted Orders", value: data.acceptedOrders, icon: FiPackage, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  // Chart data
  const orderStatusData = [
    { name: "Pending", value: data.pendingOrders || 0 },
    { name: "Accepted", value: data.acceptedOrders || 0 },
    { name: "Rejected", value: data.rejectedOrders || 0 },
  ];

  const menuStatusData = [
    { name: "Active", value: data.activeItems || 0, fill: "#16A34A" },
    { name: "Pending Review", value: data.pendingItems || 0, fill: "#CA8A04" },
    { name: "Others", value: Math.max(0, data.totalItems - data.activeItems - data.pendingItems), fill: "#6B7280" },
  ];

  const orderBarData = [
    { name: "Pending", orders: data.pendingOrders, fill: "#CA8A04" },
    { name: "Accepted", orders: data.acceptedOrders, fill: "#16A34A" },
    { name: "Rejected", orders: data.rejectedOrders, fill: "#DC2626" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            {user?.businessName || user?.name?.split(" ")[0]}&apos;s Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your restaurant and orders</p>
        </div>
        {user?.subscriptionPlan === "premium" ? (
          <div className="flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-xl border border-secondary/20 font-semibold text-sm">
            <FiStar className="h-4 w-4" /> Premium Vendor
          </div>
        ) : (
          <Link
            href="/dashboard/vendor/subscription"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <FiCreditCard className="h-4 w-4" /> Upgrade to Premium
          </Link>
        )}
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
        {/* Order Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Order Status Overview</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={45}
                paddingAngle={4}
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "13px" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Menu Item Status Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiList className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Menu Item Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={menuStatusData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "13px" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {menuStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Orders Bar Chart - full width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Orders Breakdown</h2>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={orderBarData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "13px" }}
            />
            <Bar dataKey="orders" radius={[8, 8, 0, 0]}>
              {orderBarData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/vendor/add-item", label: "Add New Item", desc: "List a new pizza on your menu" },
          { href: "/dashboard/vendor/orders", label: "View Orders", desc: "Manage customer orders" },
          { href: "/dashboard/vendor/menu-items", label: "My Menu", desc: "Edit and manage your menu" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-card border border-border rounded-2xl p-5 hover:border-primary hover:shadow-lg transition-all group"
          >
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1">{action.label}</h3>
            <p className="text-sm text-muted-foreground">{action.desc}</p>
            <div className="flex items-center gap-1 text-primary text-xs font-semibold mt-3">
              Go <FiArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Recent Customer Orders</h2>
          <Link href="/dashboard/vendor/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <FiArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
              No orders yet.
            </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {order.itemId?.images?.[0] ? (
                    <img src={order.itemId.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center">🍕</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{order.itemId?.itemName || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">Customer ID: {order.customerId?.slice(0, 8)}...</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  order.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                  order.status === "accepted" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}>{order.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
