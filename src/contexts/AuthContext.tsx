"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createAuthClient } from "better-auth/react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "customer" | "vendor" | "admin";
  isBlocked: boolean;
  businessName?: string;
  subscriptionPlan: "free" | "premium";
  subscriptionExpiresAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "customer" | "vendor";
  image?: string;
  businessName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const session = await authClient.getSession();

      if (session?.data?.user) {
        try {
          // Generate JWT from Next.js JWT endpoint (auth runs in Next.js now)
          const jwtRes = await fetch("/api/jwt", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
          });
          if (jwtRes.ok) {
            const jwtData = await jwtRes.json();
            if (jwtData.token) {
              localStorage.setItem("pizzahub_token", jwtData.token);
              setUser(jwtData.user);
              return;
            }
          }
        } catch {
          // JWT endpoint failed, fall through to session fallback
        }

        // Fallback: build user from Better Auth session directly
        // This ensures Google OAuth users can still access the dashboard
        const su = session.data.user as Record<string, unknown>;
        setUser({
          id: su.id as string,
          name: su.name as string,
          email: su.email as string,
          image: su.image as string | undefined,
          role: (su.role as "customer" | "vendor" | "admin") || "customer",
          isBlocked: (su.isBlocked as boolean) || false,
          businessName: (su.businessName as string) || "",
          subscriptionPlan: (su.subscriptionPlan as "free" | "premium") || "free",
        });
      } else {
        setUser(null);
        localStorage.removeItem("pizzahub_token");
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) throw new Error(result.error.message || "Login failed");
    await fetchUser();
    toast.success("Logged in successfully!");
  };

  const register = async (data: RegisterData) => {
    const result = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
      image: data.image || "",
      role: data.role,
      businessName: data.businessName || "",
      callbackURL: "/",
    } as Parameters<typeof authClient.signUp.email>[0]);
    if (result.error) throw new Error(result.error.message || "Registration failed");

    // Better Auth may not persist additionalFields from signUp — patch role explicitly
    try {
      await fetch("/api/set-role", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: data.role,
          businessName: data.businessName || "",
        }),
      });
    } catch {
      // Non-fatal — JWT fallback will still try to read from DB
    }

    await fetchUser();
    toast.success("Account created successfully!");
  };

  const loginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/auth/google-callback",
    });
  };

  const logout = async () => {
    await authClient.signOut();
    setUser(null);
    localStorage.removeItem("pizzahub_token");
    toast.success("Logged out successfully");
    router.push("/");
  };

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
