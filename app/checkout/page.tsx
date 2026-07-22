import { AppShell } from "@/components/AppShell";
import { RouteGuard } from "@/components/ui";
import { CheckoutPage } from "@/components/pages/CheckoutPage";

export default function CheckoutRoute() {
  return (
    <AppShell>
      <RouteGuard path="/checkout">
        <CheckoutPage />
      </RouteGuard>
    </AppShell>
  );
}
