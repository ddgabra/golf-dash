"use client";

import { useAppData } from "@/lib/hooks/useAppData";
import { managerReassign } from "@/lib/core/assignment";
import { formatMoney } from "@/lib/utils";

export function ManagerPage() {
  const { data, save } = useAppData();
  if (!data) return null;

  const updateSettings = async (updates: Partial<typeof data.settings>) => {
    await save({
      ...data,
      settings: { ...data.settings, ...updates },
    });
  };

  const updateProductPrice = async (
    productId: string,
    field: "priceCents" | "memberPriceCents",
    value: number,
  ) => {
    const products = data.products.map((p) =>
      p.id === productId ? { ...p, [field]: value } : p,
    );
    await save({ ...data, products });
  };

  const toggleProductAvailability = async (productId: string) => {
    const products = data.products.map((p) =>
      p.id === productId ? { ...p, available: !p.available } : p,
    );
    await save({ ...data, products });
  };

  const reassignFulfilment = async (fulfilmentId: string, staffId: string) => {
    const snapshot = { ...data };
    managerReassign(snapshot, fulfilmentId, staffId, "Manager reassignment");
    await save(snapshot);
  };

  const activeFulfilments = data.fulfilments.filter(
    (f) => !["completed", "cancelled"].includes(f.status),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <article className="panel">
        <h2 className="text-xl font-bold">Operating controls</h2>
        <div className="mt-4 space-y-3">
          {[
            ["orderingOpen", "Ordering open"],
            ["alcoholOrderingOpen", "Alcohol ordering open"],
            ["kitchenOpen", "Kitchen open"],
            ["weatherClosed", "Weather closure"],
            ["tournamentMode", "Tournament mode"],
            ["payAtCounterEnabled", "Pay at counter"],
            ["lockerRoomDeliveryEnabled", "Locker room delivery"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 font-semibold">
              <input
                type="checkbox"
                checked={data.settings[key as keyof typeof data.settings] as boolean}
                onChange={(e) => {
                  const updates: Partial<typeof data.settings> = {};
                  updates[key as keyof typeof data.settings] = e.target
                    .checked as never;
                  void updateSettings(updates);
                }}
              />
              {label}
            </label>
          ))}
          <label className="grid gap-1 text-sm font-bold">
            Service delay (minutes)
            <input
              type="number"
              className="input-field"
              value={data.settings.serviceDelayMinutes}
              onChange={(e) =>
                void updateSettings({ serviceDelayMinutes: Number(e.target.value) })
              }
            />
          </label>
        </div>
      </article>

      <article className="panel">
        <h2 className="text-xl font-bold">Staff</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {data.staff.map((s) => (
            <li key={s.id} className="flex justify-between">
              <span>
                {s.name} ({s.role.replaceAll("_", " ")})
              </span>
              <span className="font-bold">{s.status}</span>
            </li>
          ))}
        </ul>
      </article>

      <article className="panel lg:col-span-2">
        <h2 className="text-xl font-bold">Menu availability & prices</h2>
        <div className="mt-4 max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Product</th>
                <th className="p-2">Price</th>
                <th className="p-2">Member</th>
                <th className="p-2">Available</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p) => (
                <tr key={p.id} className="border-b border-fairway-50">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="input-field w-24"
                      value={p.priceCents}
                      onChange={(e) =>
                        void updateProductPrice(
                          p.id,
                          "priceCents",
                          Number(e.target.value),
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="input-field w-24"
                      value={p.memberPriceCents}
                      onChange={(e) =>
                        void updateProductPrice(
                          p.id,
                          "memberPriceCents",
                          Number(e.target.value),
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={p.available}
                      onChange={() => void toggleProductAvailability(p.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="panel lg:col-span-2">
        <h2 className="text-xl font-bold">Active fulfilment reassignment</h2>
        {activeFulfilments.length === 0 ? (
          <p className="mt-4 text-sm text-fairway-600">
            No active fulfilments to reassign.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {activeFulfilments.map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center gap-3 rounded-lg bg-fairway-50 p-3 text-sm"
              >
                <span className="font-bold">{f.id}</span>
                <span>{f.type.replaceAll("_", " ")}</span>
                <span className="text-fairway-600">{f.status}</span>
                <select
                  className="input-field w-auto"
                  defaultValue={f.assignedStaffId ?? ""}
                  onChange={(e) => void reassignFulfilment(f.id, e.target.value)}
                  aria-label={`Reassign ${f.id}`}
                >
                  <option value="" disabled>
                    Reassign to…
                  </option>
                  {data.staff
                    .filter((s) => ["beverage_cart_staff", "runner"].includes(s.role))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role.replaceAll("_", " ")})
                      </option>
                    ))}
                </select>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="panel lg:col-span-2">
        <h2 className="text-xl font-bold">Inventory snapshot</h2>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {data.inventory.slice(0, 18).map((i) => {
            const p = data.products.find((x) => x.id === i.productId);
            return (
              <li key={i.id} className="rounded-lg bg-fairway-50 p-2">
                {i.locationId} — {p?.name}: {i.available} avail / {i.reserved} res
              </li>
            );
          })}
        </ul>
      </article>
    </div>
  );
}
