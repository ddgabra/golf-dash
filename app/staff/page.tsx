import { AppShell } from "@/components/AppShell";
import { RouteGuard } from "@/components/ui";
import { StaffPage } from "@/components/pages/StaffPage";

export default function StaffRoute() {
  return (
    <AppShell>
      <RouteGuard path="/staff">
        <StaffPage />
      </RouteGuard>
    </AppShell>
  );
}
