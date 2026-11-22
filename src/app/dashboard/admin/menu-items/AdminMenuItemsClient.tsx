"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { formatPrice, getStatusColor, CATEGORIES } from "@/lib/utils";
import toast from "react-hot-toast";
import { FiSearch, FiCheck, FiX, FiTrash2 } from "react-icons/fi";

export default function AdminMenuItemsClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== "admin") { router.push("/dashboard"); return; }
      fetchItems();
    }
  }, [user, loading, search, statusFilter, categoryFilter]);

  const fetchItems = async () => {
    setPageLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await api.get("/api/menu-items/admin/all", { params });
      setItems(res.data);
    } catch { toast.error("Failed to load items"); }
    finally { setPageLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await api.patch(`/api/menu-items/admin/${id}/status`, { status });
      toast.success(`Item ${status}`);
      fetchItems();
    } catch (e: any) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setUpdating(null); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item permanently?")) return;
    setUpdating(id);
    try {
      await api.delete(`/api/menu-items/admin/${id}`);
      toast.success("Item deleted");
      fetchItems();
    } catch (e: any) { toast.error(e.response?.data?.message || "Delete failed"); }
    finally { setUpdating(null); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-foreground">Manage Menu Items</h1>
        <p className="text-muted-foreground mt-1">{items.length} items total</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input type="text" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {pageLoading ? (
          <div className="flex items-center justify-center h-32"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary/30 border-t-primary" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16"><p className="text-muted-foreground">No items found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  {["Item", "Category", "Price", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                          {item.images?.[0] ? <img src={item.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🍕</div>}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{item.itemName}</p>
                          <p className="text-xs text-muted-foreground">{item.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{item.category}</td>
                    <td className="px-5 py-4 text-sm font-bold text-primary">{formatPrice(item.price)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {item.status === "pending" && (
                          <>
                            <button onClick={() => updateStatus(item._id, "approved")} disabled={updating === item._id} className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50">
                              <FiCheck className="h-3 w-3" /> Approve
                            </button>
                            <button onClick={() => updateStatus(item._id, "rejected")} disabled={updating === item._id} className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50">
                              <FiX className="h-3 w-3" /> Reject
                            </button>
                          </>
                        )}
                        {item.status === "approved" && <button onClick={() => updateStatus(item._id, "inactive")} disabled={updating === item._id} className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">Deactivate</button>}
                        {(item.status === "inactive" || item.status === "rejected") && <button onClick={() => updateStatus(item._id, "approved")} disabled={updating === item._id} className="text-xs px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50">Activate</button>}
                        <button onClick={() => deleteItem(item._id)} disabled={updating === item._id} className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50">
                          <FiTrash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
