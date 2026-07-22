"use client";

import { useAppData } from "@/lib/hooks/useAppData";
import { acceptExclusiveTask } from "@/lib/core/assignment";
import { advanceFulfilment, refuseAlcoholOnFulfilment } from "@/lib/core/orders";
import { confirmShiftInventory, reconcileShiftInventory } from "@/lib/core/inventory";
import { StatusBadge } from "@/components/ui";

export function StaffPage() {
  const { data, save } = useAppData();
  if (!data) return null;

  const cartStaff = data.staff.find((s) => s.role === "beverage_cart_staff");
  const activeFulfilments = data.fulfilments.filter(
    (f) => !["completed", "cancelled"].includes(f.status),
  );

  const startShift = async () => {
    if (!cartStaff) return;
    const staff = data.staff.map((s) =>
      s.id === cartStaff.id
        ? {
            ...s,
            shiftActive: true,
            status: "available" as const,
            shiftInventoryConfirmed: true,
          }
        : s,
    );
    const snapshot = { ...data, staff };
    if (cartStaff.cartId) confirmShiftInventory(snapshot, cartStaff.cartId);
    await save(snapshot);
  };

  const setStatus = async (status: "available" | "busy" | "break" | "offline") => {
    if (!cartStaff) return;
    const staff = data.staff.map((s) =>
      s.id === cartStaff.id
        ? {
            ...s,
            status,
            shiftActive: status !== "offline" ? s.shiftActive : false,
          }
        : s,
    );
    if (status === "offline" && cartStaff.cartId) {
      const snapshot = { ...data, staff };
      reconcileShiftInventory(snapshot, cartStaff.cartId, {});
      await save(snapshot);
    } else {
      await save({ ...data, staff });
    }
  };

  const acceptOrder = async (fulfilmentId: string) => {
    if (!cartStaff) return;
    const snapshot = { ...data };
    const result = acceptExclusiveTask(snapshot, fulfilmentId, cartStaff.id);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    await save(snapshot);
  };

  const advance = async (fulfilmentId: string) => {
    const snapshot = { ...data };
    advanceFulfilment(snapshot, fulfilmentId);
    await save(snapshot);
  };

  const session = data.sessions.find((s) => s.active);
  const meetingPoint = data.courses[0]?.meetingPoints.find(
    (m) => m.id === session?.selectedMeetingPointId,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <article className="panel">
        <h2 className="text-xl font-bold">Shift controls</h2>
        <p className="mt-2 text-sm text-fairway-600">
          Beverage cart: {cartStaff?.cartId ?? "Not assigned"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={() => void startShift()}
          >
            Start shift & confirm inventory
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void setStatus("available")}
          >
            Available
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void setStatus("busy")}
          >
            Busy
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void setStatus("break")}
          >
            Break
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={() => void setStatus("offline")}
          >
            End shift & reconcile
          </button>
        </div>
        {session && (
          <div className="mt-4 rounded-xl bg-fairway-50 p-4 text-sm">
            <p className="font-bold">Golfer location</p>
            <p>Hole {session.currentHole}</p>
            <p>Meeting: {meetingPoint?.label}</p>
            <p>
              Cart position: ({cartStaff?.location.x.toFixed(0)}%,{" "}
              {cartStaff?.location.y.toFixed(0)}%)
            </p>
          </div>
        )}
      </article>

      <article className="panel">
        <h2 className="text-xl font-bold">Cart stock</h2>
        <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto text-sm">
          {data.inventory
            .filter((i) => i.locationId === "cart-1" && i.available > 0)
            .slice(0, 12)
            .map((i) => {
              const p = data.products.find((x) => x.id === i.productId);
              return (
                <li key={i.id}>
                  {p?.name}: {i.available} avail, {i.reserved} reserved
                </li>
              );
            })}
        </ul>
      </article>

      <div className="space-y-4 lg:col-span-2">
        <h2 className="text-xl font-bold">Incoming orders</h2>
        {activeFulfilments.length === 0 ? (
          <article className="panel text-center text-fairway-600">
            No active fulfilments
          </article>
        ) : (
          activeFulfilments.map((f) => (
            <article key={f.id} className="panel">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold">{f.id}</h3>
                <StatusBadge status={f.status} />
              </div>
              <p className="text-sm text-fairway-600">
                {f.type.replaceAll("_", " ")} • ETA {f.etaMinutes} min
              </p>
              <p className="text-xs text-fairway-500">{f.explanation}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primary text-sm"
                  onClick={() => void acceptOrder(f.id)}
                >
                  Accept exclusive task
                </button>
                <button
                  type="button"
                  className="btn-secondary text-sm"
                  onClick={() => void advance(f.id)}
                >
                  Collecting → En route → Arrived → Complete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
