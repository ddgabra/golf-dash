import { AppShell } from "@/components/AppShell";
import { RouteGuard } from "@/components/ui";
import { MemberPage } from "@/components/pages/MemberPage";

export default function MemberRoute() {
  return (
    <AppShell>
      <RouteGuard path="/member">
        <MemberPage />
      </RouteGuard>
    </AppShell>
  );
}
