"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GiFullPizza } from "react-icons/gi";
import {
  FiHome, FiList, FiPlusCircle, FiShoppingBag, FiCreditCard,
  FiUsers, FiSettings, FiMenu, FiX, FiLogOut, FiPackage,
  FiBarChart2, FiDollarSign
} from "react-icons/fi";
import { useTheme } from "next-themes";
import { FiSun, FiMoon } from "react-icons/fi";

const vendorLinks = [
  { href: "/dashboard/vendor", label: "Overview", icon: FiBarChart2 },
  { href: "/dashboard/vendor/menu-items", label: "My Menu Items", icon: FiList },
  { href: "/dashboard/vendor/add-item", label: "Add Menu Item", icon: FiPlusCircle },
  { href: "/dashboard/vendor/orders", label: "Customer Orders", icon: FiShoppingBag },
  { href: "/dashboard/vendor/subscription", label: "Subscription", icon: FiCreditCard },
  { href: "/profile", label: "Profile Settings", icon: FiSettings },
];

const customerLinks = [
  { href: "/dashboard/customer", label: "Overview", icon: FiBarChart2 },
  { href: "/dashboard/customer/orders", label: "My Orders", icon: FiPackage },
  { href: "/profile", label: "Profile Settings", icon: FiSettings },
];

const adminLinks = [
  { href: "/dashboard/admin", label: "Overview", icon: FiBarChart2 },
  { href: "/dashboard/admin/users", label: "Manage Users", icon: FiUsers },
  { href: "/dashboard/admin/menu-items", label: "Manage Menu Items", icon: FiList },
  { href: "/dashboard/admin/transactions", label: "Transactions", icon: FiDollarSign },
  { href: "/profile", label: "Profile Settings", icon: FiSettings },
];

function RedirectToSignin() {
  const router = useRouter();
  useEffect(() => {
    router.push("/signin");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <GiFullPizza className="h-12 w-12 text-primary animate-spin" style={{ animationDuration: "2s" }} />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GiFullPizza className="h-12 w-12 text-primary animate-spin" style={{ animationDuration: "2s" }} />
      </div>
    );
  }

  if (!user) {
    // Use useEffect-style redirect to avoid calling router.push during render
    return <RedirectToSignin />;
  }

  const links = user.role === "admin" ? adminLinks : user.role === "vendor" ? vendorLinks : customerLinks;

  const Sidebar = () => (
    <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 group">
          <GiFullPizza className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">
            <span className="text-primary">Pizza</span><span className="text-secondary">Hub</span>
          </span>
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {user.image ? (
            <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
              {user.subscriptionPlan === "premium" && (
                <span className="text-xs bg-secondary/20 text-secondary px-1.5 py-0.5 rounded font-semibold">⭐ Premium</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" /> {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 pb-16 border-t border-sidebar-border space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all"
        >
          <FiHome className="h-4 w-4" /> Back to Home
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
        >
          <FiLogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {theme === "dark" ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
            </button>
            <div className="text-sm text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
