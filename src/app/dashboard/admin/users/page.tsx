import { Suspense } from "react";
import AdminUsersPageClient from "./AdminUsersClient";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" /></div>}>
      <AdminUsersPageClient />
    </Suspense>
  );
}
