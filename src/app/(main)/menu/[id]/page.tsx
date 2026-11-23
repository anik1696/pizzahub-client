"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiMapPin, FiStar, FiShoppingCart, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { GiFullPizza } from "react-icons/gi";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";import toast from "react-hot-toast";
import Link from "next/link";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImg, setCurrentImg] = useState(0);

  // Support both single image (seed data) and images array (vendor uploads)
  const allImages: string[] = item
    ? [
        ...(item.image ? [item.image] : []),
        ...(Array.isArray(item.images) ? item.images : []),
      ].filter(Boolean)
    : [];
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    deliveryDate: "",
    deliveryAddress: "",
    message: "",
  });

  useEffect(() => {
    if (!params.id) return;
    api.get(`/api/menu-items/${params.id}`)
      .then((r) => setItem(r.data))
      .catch((e) => setError(e.response?.data?.message || "Item not found"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const canOrder = user && user.role === "customer" && item?.vendorId !== user.id;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/signin"); return; }
    if (!orderForm.deliveryDate || !orderForm.deliveryAddress) {
      toast.error("Please fill in all required fields");
      return;
    }
    setOrderLoading(true);
    try {
      await api.post("/api/orders", {
        itemId: item._id,
        deliveryDate: orderForm.deliveryDate,
        deliveryAddress: orderForm.deliveryAddress,
        message: orderForm.message,
      });
      toast.success("Order placed successfully! 🍕");
      setOrderOpen(false);
      setOrderForm({ deliveryDate: "", deliveryAddress: "", message: "" });
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to place order");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <GiFullPizza className="h-16 w-16 text-primary animate-spin" style={{ animationDuration: "2s" }} />
    </div>
  );

  if (error || !item) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <FiAlertCircle className="h-16 w-16 text-destructive" />
      <h1 className="text-2xl font-bold text-foreground">{error || "Item not found"}</h1>
      <Link href="/menu" className="flex items-center gap-2 text-primary hover:underline">
        <FiArrowLeft /> Back to Menu
      </Link>
    </div>
  );

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/menu" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium">
          <FiArrowLeft /> Back to Menu
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="rounded-2xl overflow-hidden border border-border bg-muted aspect-square mb-4">
              {allImages[currentImg] ? (
                <img
                  src={allImages[currentImg]}
                  alt={item.name || item.itemName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground/40">
                  <GiFullPizza className="h-32 w-32" />
                  <p className="text-sm">No photo available</p>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3">
                {allImages.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImg(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${currentImg === i ? "border-primary shadow-md" : "border-border hover:border-primary/50"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            {/* Category tag only — NO status badge for customers */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full capitalize">
                {item.category}
              </span>
              {item.isSpicy && <span className="text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded-full">🌶 Spicy</span>}
              {item.isVegan && <span className="text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full">Vegan</span>}
              {!item.isVegan && item.isVegetarian && <span className="text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full">Vegetarian</span>}
              {item.isGlutenFree && <span className="text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-full">Gluten Free</span>}
            </div>

            <h1 className="text-4xl font-black text-foreground mb-3">{item.name || item.itemName}</h1>

            {/* Rating */}
            {(item.rating || item.averageRating || item.ratings?.length) && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => {
                    const ratingScore = item.rating || item.averageRating || 5;
                    return (
                      <FiStar
                        key={s}
                        className={`h-4 w-4 ${
                          s <= Math.round(ratingScore)
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="font-bold text-sm">
                  {(item.rating || item.averageRating || 5).toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({item.reviewCount || item.ratings?.length || 1} {((item.reviewCount || item.ratings?.length || 1) === 1) ? "review" : "reviews"})
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-4xl font-black text-primary">{formatPrice(item.price)}</span>
              <span className="text-sm text-muted-foreground">per pizza</span>
            </div>

            {/* Vendor & Location info */}
            <div className="flex flex-wrap gap-4 mb-5 text-sm text-muted-foreground">
              {item.vendorName && (
                <span className="flex items-center gap-1.5">
                  🏪 {item.vendorName}
                </span>
              )}
              {item.location && (
                <span className="flex items-center gap-1.5">
                  <FiMapPin className="text-primary" /> {item.location}
                </span>
              )}
            </div>

            {/* Ingredients */}
            {item.ingredients?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ingredients</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.ingredients.map((ing: string) => (
                    <span key={ing} className="text-xs bg-muted px-2.5 py-1 rounded-full text-foreground">{ing}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="font-bold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>

            {/* Order section */}
            {!user ? (
              <div className="bg-muted/50 border border-border rounded-2xl p-6 text-center">
                <p className="text-muted-foreground mb-4">Sign in to place an order</p>
                <Link href="/signin" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                  Sign In to Order
                </Link>
              </div>
            ) : user.role === "vendor" || user.role === "admin" ? (
              <div className="bg-muted/50 border border-border rounded-2xl p-6 text-center">
                <p className="text-muted-foreground">Only customers can place orders.</p>
              </div>
            ) : item.vendorId === user.id ? (
              <div className="bg-muted/50 border border-border rounded-2xl p-6 text-center">
                <p className="text-muted-foreground">You cannot order your own items.</p>
              </div>
            ) : item.status !== "approved" ? (
              <div className="bg-muted/50 border border-border rounded-2xl p-6 text-center">
                <p className="text-muted-foreground">This item is not currently available for ordering.</p>
              </div>
            ) : !orderOpen ? (
              <button
                onClick={() => setOrderOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02]"
              >
                <FiShoppingCart /> Order Now
              </button>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleOrder}
                className="bg-card border border-border rounded-2xl p-6 space-y-4"
              >
                <h3 className="font-bold text-lg text-foreground mb-2">Place Your Order</h3>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Delivery Date <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    min={minDateStr}
                    value={orderForm.deliveryDate}
                    onChange={(e) => setOrderForm((f) => ({ ...f, deliveryDate: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Delivery Address <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={orderForm.deliveryAddress}
                    onChange={(e) => setOrderForm((f) => ({ ...f, deliveryAddress: e.target.value }))}
                    required
                    rows={2}
                    placeholder="Enter your full delivery address..."
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Special Instructions (optional)
                  </label>
                  <textarea
                    value={orderForm.message}
                    onChange={(e) => setOrderForm((f) => ({ ...f, message: e.target.value }))}
                    rows={2}
                    placeholder="Any special requests or instructions..."
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOrderOpen(false)}
                    className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={orderLoading}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {orderLoading ? "Placing..." : "Confirm Order 🍕"}
                  </button>
                </div>
              </motion.form>
            )}
          </motion.div>
        </div>

        {/* Customer Reviews Section */}
        {item.ratings && item.ratings.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-black text-foreground">Customer Reviews</h2>
              <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                {item.ratings.length} {item.ratings.length === 1 ? "review" : "reviews"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.ratings.map((rev: any, i: number) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FiStar
                          key={s}
                          className={`h-4 w-4 ${
                            s <= (rev.rating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Verified Order"}
                    </span>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed">&ldquo;{rev.review}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
