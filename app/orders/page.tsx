import { AppShell } from "@/components/AppShell";
import { RouteGuard } from "@/components/ui";
import { OrdersPage } from "@/components/pages/OrdersPage";

export default function OrdersRoute() {
  return (
    <AppShell>
      <RouteGuard path="/orders">
        <OrdersPage />
      </RouteGuard>
    </AppShell>
  );
}
