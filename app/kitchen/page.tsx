import { AppShell } from "@/components/AppShell";
import { RouteGuard } from "@/components/ui";
import { KitchenPage } from "@/components/pages/KitchenPage";

export default function KitchenRoute() {
  return (
    <AppShell>
      <RouteGuard path="/kitchen">
        <KitchenPage />
      </RouteGuard>
    </AppShell>
  );
}
