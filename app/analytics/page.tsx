import { AppShell } from "@/components/AppShell";
import { RouteGuard } from "@/components/ui";
import { AnalyticsPage } from "@/components/pages/AnalyticsPage";

export default function AnalyticsRoute() {
  return (
    <AppShell>
      <RouteGuard path="/analytics">
        <AnalyticsPage />
      </RouteGuard>
    </AppShell>
  );
}
