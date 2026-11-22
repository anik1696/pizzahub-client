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

        // Fetch full user profile from our DB (includes role, etc.)
        let userRole = "customer";
        try {
          const userRes = await api.get(`/api/users/${userId}`);
          userRole = userRes.data?.role || "customer";
        } catch {
          // If user not found in DB yet, default to customer
          userRole = "customer";
        }

        // Generate JWT and get user role from Next.js endpoint
        try {
          const jwtRes = await fetch("/api/jwt", { method: "POST", credentials: "include" });
          if (jwtRes.ok) {
            const jwtData = await jwtRes.json();
            if (jwtData.token) {
              localStorage.setItem("pizzahub_token", jwtData.token);
              userRole = jwtData.user?.role || "customer";
            }
          }
        } catch {
          // default to customer
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
