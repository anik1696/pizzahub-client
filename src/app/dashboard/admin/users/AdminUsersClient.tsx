"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { FiSearch, FiShield, FiShieldOff, FiUser } from "react-icons/fi";

export default function AdminUsersClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [blocking, setBlocking] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== "admin") { router.push("/dashboard"); return; }
      fetchUsers();
    }
  }, [user, loading, search, roleFilter]);

  const fetchUsers = async () => {
    setPageLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get("/api/users", { params });
      setUsers(res.data);
    } catch { toast.error("Failed to load users"); }
    finally { setPageLoading(false); }
  };

  const handleBlock = async (userId: string, isBlocked: boolean) => {
    setBlocking(userId);
    try {
      await api.patch(`/api/users/${userId}/block`, { isBlocked: !isBlocked });
      toast.success(`User ${isBlocked ? "unblocked" : "blocked"} successfully`);
      fetchUsers();
    } catch (e: any) { toast.error(e.response?.data?.message || "Failed to update user"); }
    finally { setBlocking(null); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-foreground">Manage Users</h1>
        <p className="text-muted-foreground mt-1">{users.length} users registered</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">All Roles</option>
          <option value="customer">Customers</option>
          <option value="vendor">Vendors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {pageLoading ? (
          <div className="flex items-center justify-center h-32"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary/30 border-t-primary" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-16"><p className="text-muted-foreground">No users found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  {["User", "Role", "Status", "Joined", "Action"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {u.image ? <img src={u.image} alt={u.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" /> : <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><FiUser className="h-4 w-4 text-primary" /></div>}
                        <div>
                          <p className="font-semibold text-sm text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${u.role === "admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" : u.role === "vendor" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"}`}>{u.role}</span>
                      {u.subscriptionPlan === "premium" && <span className="ml-1 text-xs font-semibold text-secondary">⭐</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.isBlocked ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}`}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{u.createdAt ? formatDate(u.createdAt) : "—"}</td>
                    <td className="px-5 py-4">
                      {u.role !== "admin" && (
                        <button onClick={() => handleBlock(u.id, u.isBlocked)} disabled={blocking === u.id}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${u.isBlocked ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"}`}>
                          {u.isBlocked ? <><FiShield className="h-3 w-3" /> Unblock</> : <><FiShieldOff className="h-3 w-3" /> Block</>}
                        </button>
                      )}
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
