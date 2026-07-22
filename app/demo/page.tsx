import { AppShell } from "@/components/AppShell";
import { RouteGuard } from "@/components/ui";
import { DemoPage } from "@/components/pages/DemoPage";

export default function DemoRoute() {
  return (
    <AppShell>
      <RouteGuard path="/demo">
        <DemoPage />
      </RouteGuard>
    </AppShell>
  );
}
