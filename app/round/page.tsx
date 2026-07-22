import { AppShell } from "@/components/AppShell";
import { RouteGuard } from "@/components/ui";
import { RoundPage } from "@/components/pages/RoundPage";

export default function RoundRoute() {
  return (
    <AppShell>
      <RouteGuard path="/round">
        <RoundPage />
      </RouteGuard>
    </AppShell>
  );
}
