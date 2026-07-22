import { AppShell } from "@/components/AppShell";
import { MemberPageGuarded } from "@/components/pages/MemberPage";

export default function MemberRoute() {
  return (
    <AppShell>
      <MemberPageGuarded />
    </AppShell>
  );
}
