"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatDate, getStatusColor } from "@/lib/utils";
import toast from "react-hot-toast";
import { FiPackage, FiCalendar, FiMapPin } from "react-icons/fi";

export default function CustomerOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== "customer") { router.push("/dashboard"); return; }
      fetchOrders();
    }
  }, [user, loading]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get("/api/orders/my-orders");
      setOrders(res.data);
    } catch { toast.error("Failed to load orders"); }
    finally { setOrdersLoading(false); }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(orderId);
    try {
      await api.patch(`/api/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully");
      fetchOrders();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(null);
    }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading || ordersLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-1">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "accepted", "rejected", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <div className="text-6xl mb-4">🍕</div>
          <h3 className="text-xl font-bold text-foreground mb-2">No orders found</h3>
          <p className="text-muted-foreground">Start ordering delicious pizzas!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order._id} className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row gap-5">
              {/* Item image */}
              <div className="w-full md:w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                {order.itemId?.images?.[0] ? (
                  <img src={order.itemId.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🍕</div>
                )}
              </div>

              {/* Order info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{order.itemId?.itemName || "Unknown Item"}</h3>
                    <p className="text-xs text-muted-foreground">Order placed {formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1.5">
                    <FiCalendar className="text-primary h-3.5 w-3.5" />
                    Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiMapPin className="text-primary h-3.5 w-3.5" />
                    <span className="truncate">{order.deliveryAddress}</span>
                  </span>
                </div>

                {order.message && (
                  <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 mb-3">
                    💬 {order.message}
                  </p>
                )}

                {order.status === "pending" && (
                  <button
                    onClick={() => cancelOrder(order._id)}
                    disabled={cancelling === order._id}
                    className="text-xs font-semibold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {cancelling === order._id ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
