"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import Link from "next/link";
import { FiUsers, FiList, FiDollarSign, FiShoppingBag, FiClock, FiArrowRight, FiTrendingUp } from "react-icons/fi";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { FiAlertTriangle } from "react-icons/fi";

const COLORS = ["#DC2626", "#EA580C", "#16A34A", "#2563EB", "#9333EA", "#CA8A04"];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0, totalVendors: 0, totalCustomers: 0,
    totalMenuItems: 0, pendingMenuItems: 0, totalTransactions: 0,
  });
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== "admin") { router.push("/dashboard/" + user.role); return; }
      api.get("/api/users/admin/stats")
        .then((r) => setStats(r.data))
        .catch(() => {})
        .finally(() => setPageLoading(false));
    }
  }, [user, loading, router]);

  if (loading || pageLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  );

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: FiUsers, color: "text-blue-500", bg: "bg-blue-500/10", href: "/dashboard/admin/users" },
    { label: "Vendors", value: stats.totalVendors, icon: FiShoppingBag, color: "text-purple-500", bg: "bg-purple-500/10", href: "/dashboard/admin/users?role=vendor" },
    { label: "Customers", value: stats.totalCustomers, icon: FiUsers, color: "text-green-500", bg: "bg-green-500/10", href: "/dashboard/admin/users?role=customer" },
    { label: "Menu Items", value: stats.totalMenuItems, icon: FiList, color: "text-orange-500", bg: "bg-orange-500/10", href: "/dashboard/admin/menu-items" },
    { label: "Pending Items", value: stats.pendingMenuItems, icon: FiClock, color: "text-yellow-500", bg: "bg-yellow-500/10", href: "/dashboard/admin/menu-items?status=pending" },
    { label: "Transactions", value: stats.totalTransactions, icon: FiDollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/dashboard/admin/transactions" },
  ];

  // Chart data
  const userPieData = [
    { name: "Vendors", value: stats.totalVendors || 0 },
    { name: "Customers", value: stats.totalCustomers || 0 },
  ];

  const menuBarData = [
    { name: "Approved", value: Math.max(0, stats.totalMenuItems - stats.pendingMenuItems), fill: "#16A34A" },
    { name: "Pending", value: stats.pendingMenuItems || 0, fill: "#CA8A04" },
  ];

  const platformData = [
    { name: "Users", Total: stats.totalUsers },
    { name: "Menu Items", Total: stats.totalMenuItems },
    { name: "Transactions", Total: stats.totalTransactions },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform overview and management</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link href={card.href} className="block bg-card border border-border rounded-2xl p-5 hover:border-primary hover:shadow-lg transition-all group">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-black text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5 group-hover:text-primary transition-colors">{card.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <FiUsers className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">User Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={userPieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {userPieData.map((entry, index) => (
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

        {/* Menu Item Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <FiList className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Menu Item Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={menuBarData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "13px" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {menuBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Platform Overview Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <FiTrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Platform Overview</h2>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={platformData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "13px" }}
            />
            <Bar dataKey="Total" fill="#DC2626" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/admin/users", label: "Manage Users", desc: "View, search, and block users" },
          { href: "/dashboard/admin/menu-items", label: "Review Menu Items", desc: "Approve or reject submissions" },
          { href: "/dashboard/admin/transactions", label: "Transactions", desc: "View all payment records" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="bg-card border border-border rounded-2xl p-5 hover:border-primary hover:shadow-lg transition-all group">
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1">{a.label}</h3>
            <p className="text-sm text-muted-foreground">{a.desc}</p>
            <div className="flex items-center gap-1 text-primary text-xs font-semibold mt-3">Go <FiArrowRight className="h-3 w-3" /></div>
          </Link>
        ))}
      </div>

      {stats.pendingMenuItems > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">{stats.pendingMenuItems} items pending review</p>
              <p className="text-sm text-muted-foreground">Review and approve or reject vendor submissions.</p>
            </div>
          </div>
          <Link href="/dashboard/admin/menu-items?status=pending" className="bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-600 transition-colors flex-shrink-0">
            Review Now
          </Link>
        </div>
      )}
    </div>
  );
}
