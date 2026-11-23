"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiMapPin, FiClock, FiUsers, FiCheckCircle, FiStar } from "react-icons/fi";
import api from "@/lib/api";
import { formatPrice, CATEGORIES } from "@/lib/utils";
import MenuItemCard from "@/components/menu/MenuItemCard";
import { useAuth } from "@/contexts/AuthContext";

const CATEGORY_DATA: { name: string; image: string; count: string }[] = [
  { name: "Classic Pizzas", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80", count: "12 items" },
  { name: "Vegetarian Pizzas", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80", count: "8 items" },
  { name: "Meat Lovers", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80", count: "10 items" },
  { name: "Specialty / Gourmet Pizzas", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80", count: "6 items" },
  { name: "Sides & Appetizers", image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80", count: "14 items" },
  { name: "Beverages & Desserts", image: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400&q=80", count: "9 items" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const { user } = useAuth();
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    api
      .get("/api/menu-items/featured")
      .then((r) => setFeaturedItems(r.data))
      .catch(() => setFeaturedItems([]))
      .finally(() => setLoadingFeatured(false));
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=1600&q=85"
            alt="Pizza background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-orange-400 font-semibold uppercase tracking-widest text-sm mb-4"
            >
              Order from local pizza shops
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-5"
            >
              Real Pizza,<br />
              <span className="text-orange-400">Real Fast.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/75 text-lg mb-8 leading-relaxed"
            >
              Browse menus from restaurants in your area, pick exactly what you want,
              and have it delivered to your door — no surprises.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-lg font-semibold text-base hover:bg-primary/90 transition-all shadow-lg"
              >
                Browse the Menu <FiArrowRight />
              </Link>
              {user ? (
                <Link
                  href={user.role === "admin" ? "/dashboard/admin" : user.role === "vendor" ? "/dashboard/vendor" : "/dashboard/customer"}
                  className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-7 py-3.5 rounded-lg font-semibold text-base border border-white/25 hover:bg-white/25 transition-all"
                >
                  My Dashboard <FiArrowRight />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-7 py-3.5 rounded-lg font-semibold text-base border border-white/25 hover:bg-white/25 transition-all"
                >
                  Create Account
                </Link>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="mt-10 flex flex-wrap gap-5"
            >
              {[
                { icon: FiMapPin, text: "200+ local vendors" },
                { icon: FiClock, text: "Avg. 28 min delivery" },
                { icon: FiUsers, text: "Trusted by 10,000+ customers" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-white/80 text-sm">
                  <Icon className="h-4 w-4 text-orange-400 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURED ITEMS ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mb-12"
          >
            <motion.p variants={fadeUp} className="text-primary font-semibold uppercase tracking-widest text-xs mb-2">
              Today on PizzaHub
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-foreground">
              Featured Menu Items
            </motion.h2>
          </motion.div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
                  <div className="h-52 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredItems.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl">
              <p className="text-muted-foreground text-sm">No featured items yet — check back soon.</p>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredItems.map((item) => (
                <motion.div key={item._id} variants={fadeUp}>
                  <MenuItemCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-10"
          >
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 border border-primary text-primary px-7 py-3 rounded-lg font-semibold text-sm hover:bg-primary hover:text-white transition-all"
            >
              See Full Menu <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── PIZZA CATEGORIES ── */}
      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mb-12"
          >
            <motion.p variants={fadeUp} className="text-primary font-semibold uppercase tracking-widest text-xs mb-2">
              Browse by type
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-foreground">
              What are you craving?
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {CATEGORY_DATA.map((cat) => (
              <motion.div key={cat.name} variants={fadeUp}>
                <Link
                  href={`/menu?category=${encodeURIComponent(cat.name)}`}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border hover:border-primary hover:shadow-md transition-all duration-300"
                >
                  <div className="relative h-32 overflow-hidden bg-muted">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <p className="text-white font-bold text-xs leading-tight">{cat.name}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — image */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80"
                  alt="Pizza kitchen"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -right-5 bg-primary text-white px-5 py-4 rounded-xl shadow-xl">
                <p className="text-3xl font-black">200+</p>
                <p className="text-xs text-white/80 mt-0.5">local restaurants</p>
              </div>
            </motion.div>

            {/* Right — content */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.p variants={fadeUp} className="text-primary font-semibold uppercase tracking-widest text-xs mb-3">
                Why PizzaHub
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-foreground mb-5">
                Built for people who take pizza seriously
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground mb-8 leading-relaxed">
                We connect you directly with local restaurants — no dark kitchens, no inflated prices.
                Every vendor is verified, every item is real.
              </motion.p>

              <motion.div variants={stagger} className="space-y-4">
                {[
                  { title: "Direct from local kitchens", desc: "No middlemen. Your order goes straight to the restaurant." },
                  { title: "Transparent pricing", desc: "What you see is what you pay — no hidden delivery markups." },
                  { title: "Live order tracking", desc: "Follow your order from the kitchen to your door." },
                  { title: "Secure & trusted", desc: "Every vendor is verified by our admin team before going live." },
                ].map((item) => (
                  <motion.div key={item.title} variants={fadeUp} className="flex gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <FiCheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{item.title}</p>
                      <p className="text-muted-foreground text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-14"
          >
            <motion.p variants={fadeUp} className="text-primary font-semibold uppercase tracking-widest text-xs mb-2">
              How it works
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-foreground">
              Order in three steps
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* connector */}
            <div className="hidden md:block absolute top-10 left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-px bg-border" />

            {[
              {
                step: 1,
                title: "Browse restaurants",
                desc: "Search by name, filter by category or location. Every listing shows real photos and prices.",
                image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80",
              },
              {
                step: 2,
                title: "Place your order",
                desc: "Pick your item, set a delivery date and address, and confirm. No account needed to browse.",
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
              },
              {
                step: 3,
                title: "Receive your pizza",
                desc: "The vendor accepts your order and delivers. Track status live from your dashboard.",
                image: "https://images.unsplash.com/photo-1593504049359-74330189a345?w=400&q=80",
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm shadow-lg">
                    {step.step}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS / TESTIMONIALS ── */}
      <section className="py-20 bg-background border-t border-border">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <motion.p variants={fadeUp} className="text-primary font-semibold uppercase tracking-widest text-xs mb-2">
              Customer Feedback
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Loved by Pizza Lovers Across Bangladesh
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-sm">
              Read real reviews from our community who order their favorite pizzas through PizzaHub every day.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Tanvir Rahman",
                location: "Dhanmondi, Dhaka",
                rating: 5,
                comment: "The Bangladeshi Spicy Beef Pizza from Mario's was piping hot and arrived right on time. Love how easy it is to order directly from local vendors!",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
                date: "Yesterday",
              },
              {
                name: "Nusrat Jahan",
                location: "Banani, Dhaka",
                rating: 5,
                comment: "Finally a platform where I can find authentic local pizzerias. The Deshi Veggie Delight was so fresh and the crust was perfectly crispy.",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
                date: "3 days ago",
              },
              {
                name: "Arafat Hossain",
                location: "GEC Circle, Chittagong",
                rating: 5,
                comment: "Tried the Hilsa Bhuna Gourmet Pizza and was blown away by the creative fusion! Fast delivery and cash-on-delivery made it totally hassle-free.",
                avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80",
                date: "Last week",
              },
            ].map((review, i) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4 text-amber-400">
                    {[...Array(review.rating)].map((_, idx) => (
                      <FiStar key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed italic mb-6">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                  <div>
                    <p className="font-bold text-sm text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1600&q=80"
            alt="Pizza"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="container mx-auto px-4 max-w-3xl relative z-10 text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-white mb-4">
              Hungry? Let&apos;s fix that.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 text-lg mb-8">
              Browse 200+ items from local vendors near you. Ready to deliver in under 30 minutes.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold text-base hover:bg-primary/90 transition-all shadow-lg"
              >
                Order Now <FiArrowRight />
              </Link>
              {!user ? (
                <Link
                  href="/signup?role=vendor"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-base hover:bg-gray-100 transition-all"
                >
                  Join as a Vendor
                </Link>
              ) : (
                <Link
                  href={
                    user.role === "admin"
                      ? "/dashboard/admin"
                      : user.role === "vendor"
                      ? "/dashboard/vendor"
                      : "/dashboard/customer"
                  }
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-base hover:bg-gray-100 transition-all"
                >
                  My Dashboard <FiArrowRight />
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
