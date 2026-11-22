import React from "react";
import { GiFullPizza } from "react-icons/gi";

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <GiFullPizza className="h-16 w-16 text-primary animate-spin" />
      <p className="mt-4 text-muted-foreground font-medium">Loading...</p>
    </div>
  );
}
