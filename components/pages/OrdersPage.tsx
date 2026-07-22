"use client";

import { useAppData } from "@/lib/hooks/useAppData";
import {
  advanceFulfilment,
  refuseAlcoholOnFulfilment,
  reorderFromOrder,
} from "@/lib/core/orders";
import { formatMoney } from "@/lib/utils";
import { EmptyState, StatusBadge } from "@/components/ui";

export function OrdersPage() {
  const { data, save } = useAppData();
  if (!data) return null;

  if (data.orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Place an order from the menu to track fulfilments here."
      />
    );
  }

  const handleAdvance = async (fulfilmentId: string) => {
    const snapshot = { ...data };
    advanceFulfilment(snapshot, fulfilmentId);
    await save(snapshot);
  };

  const handleRefuseAlcohol = async (fulfilmentId: string, itemId: string) => {
    const snapshot = { ...data };
    refuseAlcoholOnFulfilment(snapshot, fulfilmentId, itemId, "ID not presented");
    await save(snapshot);
  };

  const handleReorder = async (orderId: string) => {
    const snapshot = { ...data };
    reorderFromOrder(snapshot, orderId);
    await save(snapshot);
    window.location.href = "/checkout";
  };

  return (
    <div className="space-y-6">
      {[...data.orders].reverse().map((order) => (
        <article key={order.id} className="panel">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold">{order.id}</h2>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={order.status} />
              <StatusBadge
                status={order.paymentStatus}
                variant={
                  order.paymentStatus === "failed"
                    ? "danger"
                    : order.paymentStatus === "paid"
                      ? "success"
                      : "default"
                }
              />
            </div>
          </div>
          <p className="mt-1 text-fairway-600">
            {order.customerName} • {formatMoney(order.totalCents)} • Min-spend credit{" "}
            {formatMoney(order.minimumSpendCreditCents)}
          </p>

          <div className="mt-4 space-y-3">
            {order.fulfilmentIds.map((fid) => {
              const f = data.fulfilments.find((x) => x.id === fid);
              if (!f) return null;
              return (
                <div
                  key={fid}
                  className="rounded-xl border border-fairway-100 bg-fairway-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">{f.type.replaceAll("_", " ")}</p>
                      <StatusBadge status={f.status} />
                    </div>
                    <p className="text-sm text-fairway-600">ETA {f.etaMinutes} min</p>
                  </div>
                  <p className="mt-2 text-xs text-fairway-500">{f.explanation}</p>
                  <ul className="mt-2 text-sm">
                    {f.items.map((item) => {
                      const product = data.products.find((p) => p.id === item.itemId);
                      return (
                        <li key={item.itemId}>
                          {product?.name} — {item.status}
                          {item.refusalReason && ` (${item.refusalReason})`}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      onClick={() => void handleAdvance(fid)}
                    >
                      Advance status
                    </button>
                    {f.items.some((i) => {
                      const p = data.products.find((x) => x.id === i.itemId);
                      return p?.alcohol && i.status === "pending";
                    }) && (
                      <button
                        type="button"
                        className="btn-danger text-xs"
                        onClick={() => {
                          const alcoholItem = f.items.find((i) =>
                            data.products.find((p) => p.id === i.itemId && p.alcohol),
                          );
                          if (alcoholItem)
                            void handleRefuseAlcohol(fid, alcoholItem.itemId);
                        }}
                      >
                        Refuse alcohol only
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="btn-secondary mt-4"
            onClick={() => void handleReorder(order.id)}
          >
            Reorder
          </button>
        </article>
      ))}
    </div>
  );
}
