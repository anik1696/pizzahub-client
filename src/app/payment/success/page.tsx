import { Suspense } from "react";
import PaymentSuccessContent from "./PaymentSuccessContent";
import { GiFullPizza } from "react-icons/gi";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <GiFullPizza className="h-16 w-16 text-primary animate-spin" style={{ animationDuration: "2s" }} />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
