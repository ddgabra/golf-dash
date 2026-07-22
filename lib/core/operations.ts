import type { AppData, KitchenTicket, RestaurantRequest } from "./models";
import { generateId, nowIso } from "./store";

const KITCHEN_SEQUENCE = [
  "new",
  "accepted",
  "scheduled",
  "preparing",
  "ready",
  "completed",
] as const;

export function advanceKitchenTicket(ticket: KitchenTicket): boolean {
  const idx = KITCHEN_SEQUENCE.indexOf(
    ticket.status as (typeof KITCHEN_SEQUENCE)[number],
  );
  if (idx < 0 || idx >= KITCHEN_SEQUENCE.length - 1) return false;
  const next = KITCHEN_SEQUENCE[idx + 1]!;
  if (ticket.status === "cancelled" || ticket.status === "delayed") return false;
  ticket.status = next;
  return true;
}

export function delayKitchenTicket(
  data: AppData,
  ticketId: string,
  extraMinutes: number,
): void {
  const ticket = data.kitchenTickets.find((t) => t.id === ticketId);
  if (!ticket) return;
  ticket.status = "delayed";
  ticket.prepEstimateMinutes += extraMinutes;
  data.notifications.push({
    id: generateId("note"),
    type: "delivery_delayed",
    role: "all",
    message: `Kitchen delay: +${extraMinutes} min on ${ticketId}`,
    createdAt: nowIso(),
    read: false,
    orderId: ticket.orderId,
  });
}

export function rejectKitchenItem(
  data: AppData,
  ticketId: string,
  itemId: string,
): void {
  const ticket = data.kitchenTickets.find((t) => t.id === ticketId);
  if (!ticket) return;
  ticket.items = ticket.items.filter((i) => i !== itemId);
  data.notifications.push({
    id: generateId("note"),
    type: "item_unavailable",
    role: "all",
    message: `Kitchen rejected unavailable item ${itemId}`,
    createdAt: nowIso(),
    read: false,
    orderId: ticket.orderId,
  });
}

export function contactGolferPreset(
  data: AppData,
  ticketId: string,
  message: string,
): void {
  const ticket = data.kitchenTickets.find((t) => t.id === ticketId);
  if (!ticket) return;
  data.notifications.push({
    id: generateId("note"),
    type: "delivery_delayed",
    role: "guest_golfer",
    message: `Kitchen message: ${message}`,
    createdAt: nowIso(),
    read: false,
    orderId: ticket.orderId,
  });
}

export function advanceRestaurantRequest(req: RestaurantRequest): boolean {
  const sequence = [
    "requested",
    "confirmed",
    "waitlisted",
    "table_assigned",
    "table_ready",
    "guest_seated",
    "closed",
  ] as const;
  const idx = sequence.indexOf(req.status);
  if (idx < 0 || idx >= sequence.length - 1) return false;
  req.status = sequence[idx + 1]!;
  if (req.status === "table_assigned" && !req.table) {
    req.table = `T${Math.floor(Math.random() * 20) + 1}`;
  }
  return true;
}

export function markTableReady(data: AppData, requestId: string): void {
  const req = data.restaurantRequests.find((r) => r.id === requestId);
  if (!req) return;
  req.status = "table_ready";
  data.notifications.push({
    id: generateId("note"),
    type: "table_ready",
    role: "all",
    message: `Table ready${req.table ? ` — ${req.table}` : ""} for party of ${req.partySize}`,
    createdAt: nowIso(),
    read: false,
    ...(req.orderId ? { orderId: req.orderId } : {}),
  });
}

export function markFoodReady(data: AppData, requestId: string): void {
  const req = data.restaurantRequests.find((r) => r.id === requestId);
  if (!req) return;
  req.foodReady = true;
  data.notifications.push({
    id: generateId("note"),
    type: "food_ready",
    role: "all",
    message: `Food ready for ${requestId}`,
    createdAt: nowIso(),
    read: false,
    ...(req.orderId ? { orderId: req.orderId } : {}),
  });
}
