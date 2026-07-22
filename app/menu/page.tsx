import { AppShell } from "@/components/AppShell";
import { RouteGuard } from "@/components/ui";
import { MenuPage } from "@/components/pages/MenuPage";

export default function MenuRoute() {
  return (
    <AppShell>
      <RouteGuard path="/menu">
        <MenuPage />
      </RouteGuard>
    </AppShell>
  );
}
