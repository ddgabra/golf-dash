import { AppShell } from "@/components/AppShell";
import { RouteGuard } from "@/components/ui";
import { ProductDetailPage } from "@/components/pages/ProductDetailPage";

export default async function ProductDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <RouteGuard path="/menu">
        <ProductDetailPage productId={id} />
      </RouteGuard>
    </AppShell>
  );
}
