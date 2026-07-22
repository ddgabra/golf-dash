import { AppShell } from "@/components/AppShell";
import { RouteGuard } from "@/components/ui";
import { RestaurantPage } from "@/components/pages/RestaurantPage";

export default function RestaurantRoute() {
  return (
    <AppShell>
      <RouteGuard path="/restaurant">
        <RestaurantPage />
      </RouteGuard>
    </AppShell>
  );
}
