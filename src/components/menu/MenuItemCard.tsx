"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import { FiMapPin, FiArrowRight, FiStar } from "react-icons/fi";
import { GiFullPizza } from "react-icons/gi";

interface MenuItem {
  _id: string;
  name?: string;
  itemName?: string;
  category: string;
  description: string;
  price: number;
  location?: string;
  vendorName?: string;
  image?: string;
  images?: string[];
  status: string;
  vendorId: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  isGlutenFree?: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
}

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const { user } = useAuth();
  const displayName = item.name || item.itemName || "Pizza";
  // Support both single image field (from seed) and images array (from vendor upload)
  const imageUrl = item.image || (item.images && item.images.length > 0 ? item.images[0] : null);

  const getDetailLink = () => {
    if (!user) return "/signin";
    return `/menu/${item._id}`;
  };

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        {/* Fallback icon (shown when no image or image fails) */}
        <div className={`w-full h-full flex items-center justify-center ${imageUrl ? "hidden" : ""}`}>
          <GiFullPizza className="h-16 w-16 text-muted-foreground/25" />
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="text-xs font-medium bg-black/60 text-white px-2.5 py-1 rounded-full backdrop-blur-sm capitalize">
            {item.category}
          </span>
        </div>

        {/* Diet badges */}
        <div className="absolute top-3 right-3 flex gap-1 flex-col items-end">
          {item.isVegan && (
            <span className="text-[10px] font-bold bg-green-600 text-white px-1.5 py-0.5 rounded-full">Vegan</span>
          )}
          {!item.isVegan && item.isVegetarian && (
            <span className="text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">Veg</span>
          )}
          {item.isSpicy && (
            <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">🌶 Spicy</span>
          )}
          {item.isGlutenFree && (
            <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">GF</span>
          )}
        </div>

        {/* Featured ribbon */}
        {item.isFeatured && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/80 to-transparent py-1 px-3">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">⭐ Featured</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-base text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {displayName}
        </h3>

        {/* Rating */}
        {Boolean(item.rating && item.rating > 0) ? (
          <div className="flex items-center gap-1 mb-1.5">
            <FiStar className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-foreground">{item.rating.toFixed(1)}</span>
            {Boolean(item.reviewCount && item.reviewCount > 0) && (
              <span className="text-xs text-muted-foreground">({item.reviewCount})</span>
            )}
          </div>
        ) : null}

        <p className="text-muted-foreground text-xs mb-3 line-clamp-2 flex-1 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FiMapPin className="h-3 w-3 text-primary" />
            <span>{item.vendorName || item.location || "PizzaHub"}</span>
          </div>
          <span className="text-primary font-black text-base">{formatPrice(item.price)}</span>
        </div>

        <Link
          href={getDetailLink()}
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg border border-primary/30 text-primary font-semibold text-xs hover:bg-primary hover:text-white transition-all duration-200"
        >
          View Details <FiArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
