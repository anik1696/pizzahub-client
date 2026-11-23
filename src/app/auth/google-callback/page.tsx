"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";
import api from "@/lib/api";
import { GiFullPizza } from "react-icons/gi";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export default function GoogleCallbackPage() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const handleCallback = async () => {
      try {
        // Wait briefly to let Better Auth set the session cookie
        await new Promise((r) => setTimeout(r, 800));

        const session = await authClient.getSession();

        if (!session?.data?.user) {
          router.push("/signin?error=google_failed");
          return;
        }

        const userId = session.data.user.id;
        const userEmail = session.data.user.email;

        // Check if there was an intended role stored before Google OAuth redirect
        let intendedRole: string | null = null;
        let intendedBusinessName: string | null = null;
        try {
          intendedRole = localStorage.getItem("pizzahub_intended_role");
          intendedBusinessName = localStorage.getItem("pizzahub_intended_business_name");
          if (!intendedRole) {
            const m = document.cookie.match(/(?:^|; )pizzahub_intended_role=([^;]*)/);
            if (m) intendedRole = decodeURIComponent(m[1]);
          }
          if (!intendedBusinessName) {
            const m = document.cookie.match(/(?:^|; )pizzahub_intended_business_name=([^;]*)/);
            if (m) intendedBusinessName = decodeURIComponent(m[1]);
          }
        } catch (_) {}

        // If user intended to sign up / join as a vendor, apply it now
        if (intendedRole === "vendor") {
          try {
            await fetch("/api/set-role", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: userEmail,
                role: "vendor",
                businessName: intendedBusinessName || "",
              }),
            });
          } catch (e) {
            console.error("Failed to set vendor role from callback:", e);
          } finally {
            try {
              localStorage.removeItem("pizzahub_intended_role");
              localStorage.removeItem("pizzahub_intended_business_name");
              document.cookie = "pizzahub_intended_role=; path=/; max-age=0";
              document.cookie = "pizzahub_intended_business_name=; path=/; max-age=0";
            } catch (_) {}
          }
        }

        // Fetch full user profile from our DB (includes role, etc.)
        let userRole = intendedRole === "vendor" ? "vendor" : "customer";
        try {
          const userRes = await api.get(`/api/users/${userId}`);
          userRole = userRes.data?.role || userRole;
        } catch {
          // Fallback to intended or default
        }

        // Generate JWT and get user role from Next.js endpoint
        try {
          const jwtRes = await fetch("/api/jwt", { method: "POST", credentials: "include" });
          if (jwtRes.ok) {
            const jwtData = await jwtRes.json();
            if (jwtData.token) {
              localStorage.setItem("pizzahub_token", jwtData.token);
              userRole = jwtData.user?.role || userRole;
            }
          }
        } catch {
          // default to userRole
        }

        // Redirect based on role
        if (userRole === "admin") {
          router.push("/dashboard/admin");
        } else if (userRole === "vendor") {
          router.push("/dashboard/vendor");
        } else {
          router.push("/dashboard/customer");
        }
      } catch (err) {
        console.error("Google callback error:", err);
        router.push("/signin?error=google_failed");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <GiFullPizza className="h-12 w-12 text-primary animate-spin" style={{ animationDuration: "2s" }} />
      <p className="text-muted-foreground text-sm">Signing you in with Google...</p>
    </div>
  );
}
