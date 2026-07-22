"use client";

import { useState } from "react";
import { useAppData } from "@/lib/hooks/useAppData";
import { acceptExclusiveTask } from "@/lib/core/assignment";
import { advanceFulfilment, refuseAlcoholOnFulfilment } from "@/lib/core/orders";
import { confirmShiftInventory, reconcileShiftInventory } from "@/lib/core/inventory";
import { REFUSAL_REASONS } from "@/lib/core/alcohol";
import { StatusBadge } from "@/components/ui";

export function StaffPage() {
  const { data, save } = useAppData();
  const [staffError, setStaffError] = useState<string | null>(null);
  const [refusalTarget, setRefusalTarget] = useState<{
    fulfilmentId: string;
    itemId: string;
  } | null>(null);
  const [refusalReason, setRefusalReason] = useState(REFUSAL_REASONS[0]!);

  if (!data) return null;

  const activeStaff = data.staff.find((s) => s.role === data.activeRole);
  const isCartStaff = data.activeRole === "beverage_cart_staff";
  const isRunner = data.activeRole === "runner";

  const activeFulfilments = data.fulfilments.filter((f) => {
    if (["completed", "cancelled"].includes(f.status)) return false;
    if (isRunner) {
      return [
        "clubhouse_pickup",
        "takeout",
        "clubhouse_dine_in",
        "patio_dine_in",
      ].includes(f.type);
    }
    return ["cart_delivery"].includes(f.type);
  });

  const startShift = async () => {
    if (!activeStaff) return;
    const staff = data.staff.map((s) =>
      s.id === activeStaff.id
        ? {
            ...s,
            shiftActive: true,
            status: "available" as const,
            shiftInventoryConfirmed: isCartStaff ? true : s.shiftInventoryConfirmed,
          }
        : s,
    );
    const snapshot = { ...data, staff };
    if (isCartStaff && activeStaff.cartId) {
      confirmShiftInventory(snapshot, activeStaff.cartId);
    }
    await save(snapshot);
  };

  const setStatus = async (status: "available" | "busy" | "break" | "offline") => {
    if (!activeStaff) return;
    const staff = data.staff.map((s) =>
      s.id === activeStaff.id
        ? {
            ...s,
            status,
            shiftActive: status !== "offline" ? s.shiftActive : false,
          }
        : s,
    );
    if (status === "offline" && isCartStaff && activeStaff.cartId) {
      const snapshot = { ...data, staff };
      reconcileShiftInventory(snapshot, activeStaff.cartId, {});
      await save(snapshot);
    } else {
      await save({ ...data, staff });
    }
  };

  const acceptOrder = async (fulfilmentId: string) => {
    if (!activeStaff) return;
    setStaffError(null);
    const snapshot = { ...data };
    const result = acceptExclusiveTask(snapshot, fulfilmentId, activeStaff.id);
    if (!result.ok) {
      setStaffError(result.error ?? "Could not accept task");
      return;
    }
    await save(snapshot);
  };

  const advance = async (fulfilmentId: string) => {
    const snapshot = { ...data };
    advanceFulfilment(snapshot, fulfilmentId);
    await save(snapshot);
  };

  const confirmRefusal = async () => {
    if (!refusalTarget) return;
    const snapshot = { ...data };
    refuseAlcoholOnFulfilment(
      snapshot,
      refusalTarget.fulfilmentId,
      refusalTarget.itemId,
      refusalReason,
    );
    await save(snapshot);
    setRefusalTarget(null);
  };

  const session = data.sessions.find((s) => s.active);
  const meetingPoint = data.courses[0]?.meetingPoints.find(
    (m) => m.id === session?.selectedMeetingPointId,
  );

  if (!activeStaff) {
    return (
      <article className="panel text-center">
        <h2 className="text-lg font-bold">No staff profile for this role</h2>
        <p className="mt-2 text-fairway-600">
          Switch to beverage cart staff or runner to use shift controls.
        </p>
      </article>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <article className="panel">
        <h2 className="text-xl font-bold">
          {isRunner ? "Runner shift" : "Beverage cart shift"}
        </h2>
        <p className="mt-2 text-sm text-fairway-600">
          {activeStaff.name} —{" "}
          {isCartStaff ? (activeStaff.cartId ?? "No cart") : "Clubhouse runner"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={() => void startShift()}
          >
            {isCartStaff ? "Start shift & confirm inventory" : "Start runner shift"}
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
            End shift{isCartStaff ? " & reconcile" : ""}
          </button>
        </div>
        {staffError && (
          <p className="mt-4 text-sm font-bold text-red-700" role="alert">
            {staffError}
          </p>
        )}
        {session && isCartStaff && (
          <div className="mt-4 rounded-xl bg-fairway-50 p-4 text-sm">
            <p className="font-bold">Golfer location</p>
            <p>Hole {session.currentHole}</p>
            <p>Meeting: {meetingPoint?.label}</p>
            <p>
              Cart position: ({activeStaff.location.x.toFixed(0)}%,{" "}
              {activeStaff.location.y.toFixed(0)}%)
            </p>
          </div>
        )}
        {isRunner && (
          <div className="mt-4 rounded-xl bg-fairway-50 p-4 text-sm">
            <p className="font-bold">Clubhouse pickup tasks</p>
            <p>
              Collect prepared orders from kitchen and restaurant for golfer delivery.
            </p>
          </div>
        )}
      </article>

      {isCartStaff && (
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
      )}

      {isRunner && (
        <article className="panel">
          <h2 className="text-xl font-bold">Clubhouse inventory</h2>
          <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto text-sm">
            {data.inventory
              .filter((i) => i.locationId === "clubhouse" && i.available > 0)
              .slice(0, 12)
              .map((i) => {
                const p = data.products.find((x) => x.id === i.productId);
                return (
                  <li key={i.id}>
                    {p?.name}: {i.available} avail
                  </li>
                );
              })}
          </ul>
        </article>
      )}

      <div className="space-y-4 lg:col-span-2">
        <h2 className="text-xl font-bold">
          {isRunner ? "Clubhouse tasks" : "Incoming cart deliveries"}
        </h2>
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
              <ul className="mt-2 text-sm">
                {f.items.map((item) => {
                  const p = data.products.find((x) => x.id === item.itemId);
                  return (
                    <li key={item.itemId} className="flex flex-wrap items-center gap-2">
                      <span>
                        {p?.name ?? item.itemId} × {item.quantity} — {item.status}
                      </span>
                      {p?.alcohol && item.status === "pending" && (
                        <button
                          type="button"
                          className="btn-danger text-xs"
                          onClick={() =>
                            setRefusalTarget({
                              fulfilmentId: f.id,
                              itemId: item.itemId,
                            })
                          }
                        >
                          Refuse alcohol service
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
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
                  Advance status
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {refusalTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-labelledby="refusal-title"
        >
          <article className="panel max-w-md">
            <h3 id="refusal-title" className="text-lg font-bold">
              Refuse alcohol service
            </h3>
            <label className="mt-4 grid gap-1 text-sm font-bold">
              Reason
              <select
                className="input-field"
                value={refusalReason}
                onChange={(e) => setRefusalReason(e.target.value)}
              >
                {REFUSAL_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="btn-danger"
                onClick={() => void confirmRefusal()}
              >
                Confirm refusal
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setRefusalTarget(null)}
              >
                Cancel
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
