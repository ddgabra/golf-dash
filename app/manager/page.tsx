import { AppShell } from "@/components/AppShell";
import { RouteGuard } from "@/components/ui";
import { ManagerPage } from "@/components/pages/ManagerPage";

export default function ManagerRoute() {
  return (
    <AppShell>
      <RouteGuard path="/manager">
        <ManagerPage />
      </RouteGuard>
    </AppShell>
  );
}
