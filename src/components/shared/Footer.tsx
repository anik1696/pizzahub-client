import React from "react";
import Link from "next/link";
import { GiFullPizza } from "react-icons/gi";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-14 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 w-fit">
              <GiFullPizza className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold">
                <span className="text-primary">Pizza</span><span className="text-secondary">Hub</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A platform connecting pizza lovers with the best local restaurants.
              Browse menus, place orders, and track deliveries — all in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Navigate</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "Browse Menu", href: "/menu" },
                { label: "Sign In", href: "/signin" },
                { label: "Create Account", href: "/signup" },
                { label: "Vendor Dashboard", href: "/dashboard/vendor" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <FiMail className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <a href="mailto:hello@pizzahub.app" className="hover:text-primary transition-colors">
                  hello@pizzahub.app
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <FiPhone className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>+1 (800) 749-2284</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <FiMapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Follow Us</h3>
            <div className="flex gap-2.5">
              {[
                { icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
                { icon: FaXTwitter, href: "https://x.com", label: "X (Twitter)" },
                { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
                { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
            <p className="text-muted-foreground text-xs mt-5 leading-relaxed">
              Open daily 10 AM – 11 PM.<br />
              We respond to messages within 2 hours.
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PizzaHub. All rights reserved.
          </p>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <span key={item} className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
