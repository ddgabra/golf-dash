"use client";

import { useAppData } from "@/lib/hooks/useAppData";
import {
  advanceRestaurantRequest,
  markFoodReady,
  markTableReady,
} from "@/lib/core/operations";
import { StatusBadge } from "@/components/ui";

export function RestaurantPage() {
  const { data, save } = useAppData();
  if (!data) return null;

  const advance = async (id: string) => {
    const snapshot = { ...data };
    const req = snapshot.restaurantRequests.find((r) => r.id === id);
    if (req) advanceRestaurantRequest(req);
    await save(snapshot);
  };

  const tableReady = async (id: string) => {
    const snapshot = { ...data };
    markTableReady(snapshot, id);
    await save(snapshot);
  };

  const foodReady = async (id: string) => {
    const snapshot = { ...data };
    markFoodReady(snapshot, id);
    await save(snapshot);
  };

  const approaching = data.sessions.filter((s) => s.active && s.currentHole >= 8);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Dining requests</h2>
        {data.restaurantRequests.map((r) => (
          <article key={r.id} className="panel">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold capitalize">{r.area.replaceAll("_", " ")}</h3>
              <StatusBadge status={r.status} />
            </div>
            <p className="text-sm text-fairway-600">
              Party of {r.partySize} • {r.accessibilityNote || "No accessibility notes"}
            </p>
            {r.table && <p className="text-sm font-bold">Table {r.table}</p>}
            {r.memberContext && (
              <p className="text-sm text-fairway-500">{r.memberContext}</p>
            )}
            <p className="text-sm">Food ready: {r.foodReady ? "Yes" : "No"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => void advance(r.id)}
              >
                Advance status
              </button>
              <button
                type="button"
                className="btn-primary text-sm"
                onClick={() => void tableReady(r.id)}
              >
                Mark table ready
              </button>
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => void foodReady(r.id)}
              >
                Mark food ready
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="space-y-4">
        <article className="panel">
          <h2 className="text-xl font-bold">Approaching groups</h2>
          {approaching.length === 0 ? (
            <p className="mt-2 text-sm text-fairway-500">No groups approaching turn</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {approaching.map((s) => (
                <li key={s.id}>
                  {s.playerName} — Hole {s.currentHole}, party of {s.groupSize}
                </li>
              ))}
            </ul>
          )}
        </article>
        <article className="panel">
          <h2 className="text-xl font-bold">Open meal orders</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {data.orders
              .filter((o) => o.lines.some((l) => l.fulfilmentType === "scheduled_meal"))
              .map((o) => (
                <li key={o.id}>
                  {o.id} — {o.status}
                </li>
              ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
