"use client";

import Link from "next/link";
import { useAppData } from "@/lib/hooks/useAppData";
import { identities } from "@/lib/core/seed";
import { generateId } from "@/lib/core/store";
import { moveCartStaff } from "@/lib/core/assignment";
import {
  advanceFulfilment,
  createOrderFromCart,
  markItemUnavailable,
  refuseAlcoholOnFulfilment,
  requestSubstitution,
} from "@/lib/core/orders";
import { delayKitchenTicket, markTableReady } from "@/lib/core/operations";
import type { Role } from "@/lib/core/models";

const SIMULATIONS = [
  "Reset demo data",
  "Create incoming order",
  "Simulate payment failure",
  "Simulate substitution",
  "Simulate item unavailable",
  "Simulate alcohol refusal",
  "Move golfer to another hole",
  "Move beverage cart",
  "Simulate kitchen delay",
  "Mark table ready",
  "Simulate poor connection",
  "Complete delivery",
] as const;

export function DemoPage() {
  const { data, save, reset, setRole } = useAppData();
  if (!data) return null;

  const runSimulation = async (action: (typeof SIMULATIONS)[number]) => {
    if (action === "Reset demo data") {
      await reset();
      return;
    }

    const snapshot = { ...data };

    switch (action) {
      case "Create incoming order": {
        snapshot.cart.lines = [
          {
            id: generateId("line"),
            itemId: "prod-01",
            quantity: 1,
            fulfilmentType: "cart_delivery",
            deliveryTiming: "immediate",
            modifiers: [],
            addOns: [],
            substitutionPreference: "ask",
          },
          {
            id: generateId("line"),
            itemId: "prod-25",
            quantity: 1,
            fulfilmentType: "clubhouse_pickup",
            deliveryTiming: "immediate",
            modifiers: [],
            addOns: [],
            substitutionPreference: "ask",
          },
        ];
        createOrderFromCart(
          snapshot,
          "guest_golfer",
          snapshot.cart.lines,
          "Demo Visa ending in 4242",
          false,
        );
        break;
      }
      case "Simulate payment failure": {
        snapshot.cart.lines = [
          {
            id: generateId("line"),
            itemId: "prod-13",
            quantity: 1,
            fulfilmentType: "cart_delivery",
            deliveryTiming: "immediate",
            modifiers: [],
            addOns: [],
            substitutionPreference: "ask",
          },
        ];
        createOrderFromCart(
          snapshot,
          "guest_golfer",
          snapshot.cart.lines,
          "fail payment simulation",
          false,
        );
        break;
      }
      case "Simulate substitution": {
        const f = snapshot.fulfilments[0];
        if (f) requestSubstitution(snapshot, f.id, f.items[0]?.itemId ?? "", "prod-02");
        break;
      }
      case "Simulate item unavailable": {
        const f = snapshot.fulfilments[0];
        if (f) markItemUnavailable(snapshot, f.id, f.items[0]?.itemId ?? "");
        break;
      }
      case "Simulate alcohol refusal": {
        const f = snapshot.fulfilments.find((x) =>
          x.items.some(
            (i) => snapshot.products.find((p) => p.id === i.itemId)?.alcohol,
          ),
        );
        if (f) {
          const alcoholItem = f.items.find(
            (i) => snapshot.products.find((p) => p.id === i.itemId)?.alcohol,
          );
          if (alcoholItem) {
            refuseAlcoholOnFulfilment(
              snapshot,
              f.id,
              alcoholItem.itemId,
              "ID not presented",
            );
          }
        }
        break;
      }
      case "Move golfer to another hole": {
        snapshot.sessions = snapshot.sessions.map((s) =>
          s.active
            ? {
                ...s,
                currentHole: Math.min(18, s.currentHole + 1),
                selectedMeetingPointId: `mp-${Math.min(18, s.currentHole + 1)}`,
              }
            : s,
        );
        break;
      }
      case "Move beverage cart": {
        moveCartStaff(snapshot, "staff-cart-1", { x: 45, y: 40 });
        break;
      }
      case "Simulate kitchen delay": {
        const ticket = snapshot.kitchenTickets[0];
        if (ticket) delayKitchenTicket(snapshot, ticket.id, 15);
        break;
      }
      case "Mark table ready": {
        const req = snapshot.restaurantRequests[0];
        if (req) markTableReady(snapshot, req.id);
        break;
      }
      case "Simulate poor connection": {
        snapshot.poorConnection = !snapshot.poorConnection;
        break;
      }
      case "Complete delivery": {
        const f = snapshot.fulfilments.find(
          (x) => !["completed", "cancelled"].includes(x.status),
        );
        if (f) {
          let guard = 0;
          while (f.status !== "completed" && guard < 10) {
            if (!advanceFulfilment(snapshot, f.id)) break;
            guard += 1;
          }
        }
        break;
      }
    }

    snapshot.notifications.push({
      id: generateId("note"),
      type: "order_placed",
      role: "all",
      message: `Demo simulation: ${action}`,
      createdAt: new Date().toISOString(),
      read: false,
    });
    await save(snapshot);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <article className="panel">
        <h2 className="text-xl font-bold">Simulation tools</h2>
        <p className="mt-2 text-sm text-amber-800">
          All controls below are labeled demo simulations — not production behaviour.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {SIMULATIONS.map((action) => (
            <button
              key={action}
              type="button"
              className="btn-secondary text-left text-sm"
              onClick={() => void runSimulation(action)}
            >
              {action}
            </button>
          ))}
        </div>
      </article>

      <article className="panel">
        <h2 className="text-xl font-bold">Open views in new tab</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/round" target="_blank" className="btn-secondary">
            Golfer view
          </Link>
          <Link href="/staff" target="_blank" className="btn-secondary">
            Staff view
          </Link>
          <Link href="/kitchen" target="_blank" className="btn-secondary">
            Kitchen view
          </Link>
        </div>

        <h3 className="mt-6 font-bold">Quick role switch</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {identities.map((i) => (
            <button
              key={i.role}
              type="button"
              className="btn-secondary text-xs"
              onClick={() => void setRole(i.role as Role)}
            >
              {i.name}
            </button>
          ))}
        </div>
      </article>

      <article className="panel lg:col-span-2">
        <h2 className="text-xl font-bold">Reliability features</h2>
        <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-fairway-700">
          <li>Corrupt storage recovers safely to seed data</li>
          <li>Offline indicator when browser goes offline</li>
          <li>Error boundary with retry action</li>
          <li>Loading and empty states on all major screens</li>
          <li>Duplicate checkout click protection</li>
          <li>BroadcastChannel multi-tab synchronization</li>
        </ul>
      </article>
    </div>
  );
}
