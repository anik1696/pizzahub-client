import { Suspense } from "react";
import MenuPage from "./MenuPage";

export default function MenuPageRoute() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    }>
      <MenuPage />
    </Suspense>
  );
}
