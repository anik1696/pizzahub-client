"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import api from "@/lib/api";
import { CATEGORIES, BD_LOCATIONS } from "@/lib/utils";
import MenuItemCard from "@/components/menu/MenuItemCard";

const LOCATIONS = BD_LOCATIONS;

export default function MenuPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [sort, setSort] = useState("newest");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (location) params.location = location;
      if (sort) params.sort = sort;
      const res = await api.get("/api/menu-items", { params });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, location, sort, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const hasFilters = search || category || location || sort !== "newest";

  const clearFilters = () => {
    setSearch(""); setCategory(""); setLocation(""); setSort("newest"); setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-red-950 via-red-900 to-orange-900 py-16">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-black text-white mb-4">
            Browse Our Menu 🍕
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/70 text-lg">
            {total > 0 ? `${total} delicious items available` : "Explore our pizza collection"}
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-10">
        {/* Filters */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search pizzas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchItems()}
                className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm min-w-[160px]">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={location} onChange={(e) => { setLocation(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm min-w-[140px]">
              <option value="">All Locations</option>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
            <button onClick={fetchItems} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
              <FiSearch className="h-4 w-4" /> Search
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="px-4 py-2.5 border border-border rounded-xl text-muted-foreground hover:text-destructive hover:border-destructive transition-colors text-sm flex items-center gap-1">
                <FiX className="h-4 w-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
                <div className="h-52 bg-muted" />
                <div className="p-5 space-y-3"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-1/2" /><div className="h-10 bg-muted rounded" /></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-4">🍕</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
            <button onClick={clearFilters} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">Showing <span className="font-semibold text-foreground">{items.length}</span> of <span className="font-semibold text-foreground">{total}</span> items</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => <MenuItemCard key={item._id} item={item} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-50 hover:bg-accent transition-colors">Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground" : "border border-border hover:bg-accent"}`}>{p}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-50 hover:bg-accent transition-colors">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
