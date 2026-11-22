"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { FiMenu, FiSun, FiMoon, FiX } from "react-icons/fi";
import { GiFullPizza } from "react-icons/gi";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render theme icon after mount
  useEffect(() => { setMounted(true); }, []);

  const getDashboardLink = () => {
    if (!user) return "/signin";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "vendor") return "/dashboard/vendor";
    return "/dashboard/customer";
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <GiFullPizza className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-2xl font-bold">
              <span className="text-primary">Pizza</span>
              <span className="text-secondary">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/menu" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Browse Menu</Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && (theme === "dark" ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />)}
            </button>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-accent transition-colors"
                >
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-popover border border-border rounded-xl shadow-xl py-1 z-50">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                          {user.subscriptionPlan === "premium" && (
                            <span className="text-xs bg-secondary/20 text-secondary px-1.5 py-0.5 rounded font-semibold ml-1">⭐ Premium</span>
                          )}
                        </div>
                      </div>
                      <Link href={getDashboardLink()} className="block px-3 py-2 text-sm hover:bg-accent transition-colors" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                      <Link href="/profile" className="block px-3 py-2 text-sm hover:bg-accent transition-colors" onClick={() => setDropdownOpen(false)}>Profile Settings</Link>
                      <hr className="border-border my-1" />
                      <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors">Logout</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/signin" className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent transition-colors">Sign In</Link>
                <Link href="/signup" className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg hover:bg-accent transition-colors">
              {mounted && (theme === "dark" ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />)}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-accent transition-colors">
              {mobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-1">
            <Link href="/" className="block py-2.5 px-3 font-medium rounded-lg hover:bg-accent hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/menu" className="block py-2.5 px-3 font-medium rounded-lg hover:bg-accent hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>Browse Menu</Link>
            {user ? (
              <>
                <Link href={getDashboardLink()} className="block py-2.5 px-3 font-medium rounded-lg hover:bg-accent hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link href="/profile" className="block py-2.5 px-3 font-medium rounded-lg hover:bg-accent hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>Profile Settings</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left py-2.5 px-3 font-medium text-destructive rounded-lg hover:bg-accent transition-colors">Logout</button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/signin" className="flex-1 text-center py-2.5 border border-border rounded-lg font-medium hover:bg-accent transition-colors" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/signup" className="flex-1 text-center py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
