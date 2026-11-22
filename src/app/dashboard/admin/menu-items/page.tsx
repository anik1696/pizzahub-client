import { Suspense } from "react";
import AdminMenuItemsClient from "./AdminMenuItemsClient";

export default function AdminMenuItemsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" /></div>}>
      <AdminMenuItemsClient />
    </Suspense>
  );
}
