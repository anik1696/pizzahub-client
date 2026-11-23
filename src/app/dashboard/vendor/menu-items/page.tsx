"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatPrice, formatDate, getStatusColor, BD_LOCATIONS, CATEGORIES } from "@/lib/utils";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from "react-icons/fi";

export default function VendorMenuItemsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({ itemName: "", category: "", description: "", price: "", location: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== "vendor") { router.push("/dashboard"); return; }
      fetchItems();
    }
  }, [user, loading]);

  const fetchItems = async () => {
    try {
      const res = await api.get("/api/menu-items/vendor/my-items");
      setItems(res.data);
    } catch { toast.error("Could not load menu items."); }
    finally { setPageLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item permanently?")) return;
    setDeleting(id);
    try {
      await api.delete(`/api/menu-items/${id}`);
      toast.success("Item removed.");
      fetchItems();
    } catch (e: any) { toast.error(e.response?.data?.message || "Could not remove item."); }
    finally { setDeleting(null); }
  };

  const handleToggle = async (id: string) => {
    setToggling(id);
    try {
      await api.patch(`/api/menu-items/${id}/toggle`);
      toast.success("Status updated.");
      fetchItems();
    } catch (e: any) { toast.error(e.response?.data?.message || "Could not update status."); }
    finally { setToggling(null); }
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setEditForm({ itemName: item.itemName || item.name || "", category: item.category, description: item.description, price: item.price, location: item.location });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/menu-items/${editItem._id}`, editForm);
      toast.success("Changes saved.");
      setEditItem(null);
      fetchItems();
    } catch (e: any) { toast.error(e.response?.data?.message || "Could not save changes."); }
    finally { setSaving(false); }
  };

  if (loading || pageLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">My Menu Items</h1>
          <p className="text-muted-foreground mt-1">{items.length} items listed</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/vendor/add-item")}
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          + Add New Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <div className="text-6xl mb-4">🍕</div>
          <h3 className="text-xl font-bold mb-2">No menu items yet</h3>
          <p className="text-muted-foreground mb-6">Start adding pizzas to your menu!</p>
          <button onClick={() => router.push("/dashboard/vendor/add-item")} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((item) => (
            <div key={item._id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="relative h-48">
                {(item.images?.[0] || item.image) ? (
                  <img src={item.images?.[0] || item.image} alt={item.itemName || item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-5xl">🍕</div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground mb-1 truncate">{item.itemName}</h3>
                <p className="text-sm text-muted-foreground mb-1">{item.category} · {item.location}</p>
                <p className="text-lg font-black text-primary mb-4">{formatPrice(item.price)}</p>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{item.description}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-accent transition-colors"
                  >
                    <FiEdit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  {item.status === "approved" && (
                    <button
                      onClick={() => handleToggle(item._id)}
                      disabled={toggling === item._id}
                      className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      {toggling === item._id ? "..." : <FiToggleLeft className="h-4 w-4" />}
                    </button>
                  )}
                  {item.status === "inactive" && (
                    <button
                      onClick={() => handleToggle(item._id)}
                      disabled={toggling === item._id}
                      className="flex items-center gap-1.5 px-3 py-2 border border-primary/40 text-primary rounded-xl text-xs font-semibold hover:bg-primary/5 transition-colors disabled:opacity-50"
                    >
                      {toggling === item._id ? "..." : <FiToggleRight className="h-4 w-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deleting === item._id}
                    className="flex items-center gap-1.5 px-3 py-2 border border-destructive/30 text-destructive rounded-xl text-xs font-semibold hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  >
                    {deleting === item._id ? "..." : <FiTrash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-foreground mb-5">Edit Menu Item</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Item Name</label>
                <input value={editForm.itemName} onChange={(e) => setEditForm((f) => ({ ...f, itemName: e.target.value }))} required className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {["Classic Pizzas", "Vegetarian Pizzas", "Meat Lovers", "Specialty / Gourmet Pizzas", "Sides & Appetizers", "Beverages & Desserts"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Price in Taka (৳)</label>
                  <input type="number" step="1" min="1" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} required className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Location</label>
                  <select value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} required className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {BD_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={3} required className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditItem(null)} className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-accent transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
