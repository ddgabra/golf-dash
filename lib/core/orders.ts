import type {
  AppData,
  Fulfilment,
  FulfilmentItem,
  FulfilmentStatus,
  FulfilmentType,
  NotificationType,
  Order,
  OrderStatus,
} from "./models";
import { generateId, nowIso } from "./store";
import { findBestStaff, simulateCartMovement } from "./assignment";
import {
  deductOnDelivery,
  getLocationForFulfilment,
  releaseReservation,
  reserveInventory,
} from "./inventory";
import { calculateMinimumSpendCredit, priceOrder } from "./pricing";
import { processPayment } from "./payments";
import { checkAlcoholOrder } from "./alcohol";
import { identities } from "./seed";
import type { CartLine, Role } from "./models";

const FULFILMENT_TRANSITIONS: Record<FulfilmentStatus, FulfilmentStatus[]> = {
  new: ["assigned", "cancelled"],
  assigned: ["accepted", "cancelled"],
  accepted: ["collecting", "en_route", "delayed", "cancelled"],
  collecting: ["en_route", "delayed", "cancelled"],
  en_route: ["arrived", "delayed"],
  arrived: ["partially_completed", "completed"],
  partially_completed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  delayed: ["collecting", "en_route", "cancelled"],
};

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["accepted", "cancelled"],
  accepted: ["partially_fulfilled", "delivered", "partially_cancelled", "cancelled"],
  partially_fulfilled: ["delivered", "partially_cancelled", "cancelled"],
  delivered: [],
  partially_cancelled: ["cancelled"],
  cancelled: [],
};

export function transitionFulfilment(
  fulfilment: Fulfilment,
  next: FulfilmentStatus,
  note?: string,
): boolean {
  const allowed = FULFILMENT_TRANSITIONS[fulfilment.status];
  if (!allowed.includes(next)) return false;
  fulfilment.status = next;
  fulfilment.statusHistory.push({
    status: next,
    at: nowIso(),
    ...(note ? { note } : {}),
  });
  return true;
}

export function transitionOrder(order: Order, next: OrderStatus): boolean {
  const allowed = ORDER_TRANSITIONS[order.status];
  if (!allowed.includes(next)) return false;
  order.status = next;
  order.statusHistory.push({ status: next, at: nowIso() });
  return true;
}

function pushNotification(
  data: AppData,
  type: NotificationType,
  role: Role | "all",
  message: string,
  orderId?: string,
): void {
  data.notifications.push({
    id: generateId("note"),
    type,
    role,
    message,
    createdAt: nowIso(),
    read: false,
    ...(orderId ? { orderId } : {}),
  });
}

export function createOrderFromCart(
  data: AppData,
  role: Role,
  lines: CartLine[],
  paymentMethod: string,
  alcoholConfirmed: boolean,
  tipPercent = 15,
): { ok: boolean; order?: Order; error?: string } {
  if (data.cart.lines.length === 0 && lines.length === 0) {
    return { ok: false, error: "Cart is empty" };
  }

  if (data.checkoutInProgress) {
    return { ok: false, error: "Checkout already in progress. Please wait." };
  }

  data.checkoutInProgress = true;

  const fail = (error: string): { ok: false; error: string } => {
    data.checkoutInProgress = false;
    return { ok: false, error };
  };

  const activeLines = lines.length ? lines : data.cart.lines;
  const identity = identities.find((i) => i.role === role)!;
  const session = data.sessions.find((s) => s.active);
  const alcoholCheck = checkAlcoholOrder(
    data,
    activeLines,
    session,
    alcoholConfirmed,
    role,
    identity.alcoholVerified,
  );

  if (!alcoholCheck.allowed) {
    return fail(alcoholCheck.reasons.join("; "));
  }

  if (!data.settings.orderingOpen || data.settings.weatherClosed) {
    return fail("Ordering is currently closed");
  }

  const priced = priceOrder(activeLines, data.products, role, data.settings);
  const payment = processPayment(
    data,
    paymentMethod,
    priced.totalCents,
    identity.memberAccountId,
    paymentMethod.includes("fail"),
  );

  if (payment.status === "failed") {
    pushNotification(data, "payment_failure", role, payment.message);
    return fail(payment.message);
  }

  const orderId = generateId("order");
  const groups = new Map<FulfilmentType, CartLine[]>();

  for (const line of activeLines) {
    const type = line.fulfilmentType;
    const existing = groups.get(type) ?? [];
    groups.set(type, [...existing, line]);
  }

  const fulfilmentIds: string[] = [];
  const requiresAlcohol = activeLines.some((l) => {
    const p = data.products.find((x) => x.id === l.itemId);
    return p?.alcohol;
  });

  for (const [type, groupLines] of groups) {
    const assignment = findBestStaff(data, type, session, requiresAlcohol);
    const items: FulfilmentItem[] = groupLines.map((l) => ({
      itemId: l.itemId,
      quantity: l.quantity,
      status: "pending",
    }));

    for (const line of groupLines) {
      const loc = getLocationForFulfilment(type);
      reserveInventory(data, loc, line.itemId, line.quantity, orderId);
    }

    const f: Fulfilment = {
      id: generateId("ful"),
      orderId,
      type,
      status: assignment ? "assigned" : "new",
      items,
      ...(assignment?.staffId ? { assignedStaffId: assignment.staffId } : {}),
      statusHistory: [
        { status: "new", at: nowIso() },
        ...(assignment
          ? [{ status: "assigned" as FulfilmentStatus, at: nowIso() }]
          : []),
      ],
      assignmentHistory: assignment
        ? [
            {
              staffId: assignment.staffId,
              at: nowIso(),
              explanation: assignment.explanation,
            },
          ]
        : [],
      etaMinutes: assignment?.etaMinutes ?? 20,
      explanation: assignment?.explanation ?? "Awaiting assignment",
      routeCoordinates: assignment?.routeCoordinates ?? [],
    };
    data.fulfilments.push(f);
    fulfilmentIds.push(f.id);

    pushNotification(
      data,
      "staff_assigned",
      "all",
      `Fulfilment ${f.id} assigned: ${f.explanation}`,
      orderId,
    );
  }

  let minimumSpendCreditCents = 0;
  if (role === "club_member" && identity.memberAccountId) {
    const member = data.members.find((m) => m.id === identity.memberAccountId);
    if (member) {
      minimumSpendCreditCents = calculateMinimumSpendCredit(
        member,
        priced,
        data.settings,
      );
      if (payment.status === "paid") {
        member.completedCents += minimumSpendCreditCents;
        member.pendingCents = Math.max(
          0,
          member.pendingCents - minimumSpendCreditCents,
        );
        member.adjustments.push({
          amountCents: minimumSpendCreditCents,
          note: `Posted from ${orderId}`,
          at: nowIso(),
        });
        pushNotification(
          data,
          "minimum_spend_update",
          "club_member",
          `Minimum spend updated: +$${(minimumSpendCreditCents / 100).toFixed(2)}`,
          orderId,
        );
      }
    }
  }

  const order: Order = {
    id: orderId,
    courseId: data.courses[0]?.id ?? "demo-course",
    customerRole: role,
    customerName: identity.name,
    ...(session?.id ? { sessionId: session.id } : {}),
    lines: activeLines,
    status: "submitted",
    paymentStatus: payment.status,
    paymentMethod,
    ...priced,
    statusHistory: [{ status: "submitted", at: nowIso() }],
    fulfilmentIds,
    minimumSpendCreditCents,
    alcoholConfirmed,
    createdAt: nowIso(),
    checkoutLocked: true,
  };

  data.orders.push(order);
  data.previousOrderIds = [orderId, ...data.previousOrderIds].slice(0, 20);
  data.cart.lines = [];

  for (const line of activeLines) {
    const product = data.products.find((p) => p.id === line.itemId);
    if (product && product.prepMinutes > 5) {
      const linkedFulfilmentId = fulfilmentIds.find((fid) => {
        const ful = data.fulfilments.find((f) => f.id === fid);
        return ful?.type === line.fulfilmentType;
      });
      const ticket = {
        id: generateId("kit"),
        orderId,
        status:
          line.deliveryTiming === "future_meal"
            ? ("scheduled" as const)
            : ("new" as const),
        requestedReadyTime:
          line.deliveryTiming === "future_meal" ? "after round" : "ASAP",
        recommendedStartTime: "now",
        estimatedGolferFinish: session
          ? `${String(9 + Math.floor(session.currentHole / 2)).padStart(2, "0")}:30`
          : "unknown",
        timingConfidence: "medium" as const,
        partySize: session?.groupSize ?? 1,
        items: [line.itemId],
        modifiers: line.modifiers,
        allergyWarnings: product.allergens,
        prepEstimateMinutes: product.prepMinutes,
        fulfilmentType: line.fulfilmentType,
        pickupLocation: line.fulfilmentType === "patio_dine_in" ? "Patio" : "Clubhouse",
        ...(linkedFulfilmentId ? { fulfilmentId: linkedFulfilmentId } : {}),
      };
      data.kitchenTickets.push(ticket);
    }
  }

  for (const type of ["patio_dine_in", "clubhouse_dine_in", "takeout"] as const) {
    if (groupLinesHasType(activeLines, type)) {
      data.restaurantRequests.push({
        id: generateId("rest"),
        orderId,
        status: "requested",
        area:
          type === "patio_dine_in"
            ? "patio"
            : type === "takeout"
              ? "takeout"
              : "dining_room",
        partySize: session?.groupSize ?? 2,
        accessibilityNote: "",
        foodReady: false,
        memberContext: role === "club_member" ? "Club member" : "Guest",
      });
    }
  }

  data.cart.lines = [];
  data.checkoutInProgress = false;

  pushNotification(data, "order_placed", role, `Order placed: ${orderId}`, orderId);
  return { ok: true, order };
}

function groupLinesHasType(lines: CartLine[], type: string): boolean {
  return lines.some((l) => l.fulfilmentType === type);
}

export function advanceFulfilment(data: AppData, fulfilmentId: string): boolean {
  const fulfilment = data.fulfilments.find((f) => f.id === fulfilmentId);
  if (!fulfilment) return false;

  const sequence: FulfilmentStatus[] = [
    "accepted",
    "collecting",
    "en_route",
    "arrived",
    "completed",
  ];
  const currentIdx = sequence.indexOf(fulfilment.status);
  const next =
    currentIdx >= 0 && currentIdx < sequence.length - 1
      ? sequence[currentIdx + 1]
      : fulfilment.status === "assigned"
        ? "accepted"
        : fulfilment.status === "new"
          ? "assigned"
          : null;

  if (!next) return false;
  const ok = transitionFulfilment(fulfilment, next);
  if (!ok) return false;

  if (next === "en_route") simulateCartMovement(data, fulfilmentId);
  if (next === "arrived") {
    pushNotification(
      data,
      "staff_arrived",
      "all",
      `Staff arrived for ${fulfilmentId}`,
      fulfilment.orderId,
    );
  }
  if (next === "completed") {
    for (const item of fulfilment.items) {
      if (item.status === "pending" || item.status === "ready") {
        item.status = "delivered";
        const loc = getLocationForFulfilment(fulfilment.type);
        deductOnDelivery(data, loc, item.itemId, item.quantity, fulfilment.orderId);
      }
    }
    pushNotification(
      data,
      "order_delivered",
      "all",
      `Delivery completed for ${fulfilmentId}`,
      fulfilment.orderId,
    );
    updateOrderStatusFromFulfilments(data, fulfilment.orderId);
  }

  return true;
}

export function refuseAlcoholOnFulfilment(
  data: AppData,
  fulfilmentId: string,
  itemId: string,
  reason: string,
): boolean {
  const fulfilment = data.fulfilments.find((f) => f.id === fulfilmentId);
  if (!fulfilment) return false;
  const item = fulfilment.items.find((i) => i.itemId === itemId);
  const product = data.products.find((p) => p.id === itemId);
  if (!item || !product?.alcohol) return false;

  item.status = "refused";
  item.refusalReason = reason;
  const loc = getLocationForFulfilment(fulfilment.type);
  releaseReservation(data, loc, itemId, item.quantity, `Alcohol refused: ${reason}`);

  transitionFulfilment(fulfilment, "partially_completed", reason);
  pushNotification(
    data,
    "alcohol_refused",
    "all",
    `Alcohol refused (${reason}) — food items still being delivered`,
    fulfilment.orderId,
  );
  return true;
}

export function markItemUnavailable(
  data: AppData,
  fulfilmentId: string,
  itemId: string,
): void {
  const fulfilment = data.fulfilments.find((f) => f.id === fulfilmentId);
  if (!fulfilment) return;
  const item = fulfilment.items.find((i) => i.itemId === itemId);
  if (!item) return;
  item.status = "unavailable";
  const loc = getLocationForFulfilment(fulfilment.type);
  releaseReservation(data, loc, itemId, item.quantity, "Item unavailable");
  pushNotification(
    data,
    "item_unavailable",
    "all",
    `Item unavailable: ${itemId}`,
    fulfilment.orderId,
  );
}

export function requestSubstitution(
  data: AppData,
  fulfilmentId: string,
  itemId: string,
  substituteId: string,
): void {
  const fulfilment = data.fulfilments.find((f) => f.id === fulfilmentId);
  if (!fulfilment) return;
  const item = fulfilment.items.find((i) => i.itemId === itemId);
  if (!item) return;
  item.status = "substituted";
  item.substitutionItemId = substituteId;
  pushNotification(
    data,
    "substitution_requested",
    "all",
    `Substitution suggested for ${itemId}`,
    fulfilment.orderId,
  );
}

function updateOrderStatusFromFulfilments(data: AppData, orderId: string): void {
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) return;
  const fulfilments = data.fulfilments.filter((f) => f.orderId === orderId);
  const allDone = fulfilments.every(
    (f) => f.status === "completed" || f.status === "cancelled",
  );
  const anyPartial = fulfilments.some((f) => f.status === "partially_completed");
  if (allDone) transitionOrder(order, anyPartial ? "partially_fulfilled" : "delivered");
  else if (anyPartial) transitionOrder(order, "partially_fulfilled");
}

export function reorderFromOrder(data: AppData, orderId: string): CartLine[] {
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) return [];
  const lines = order.lines.map((l) => ({
    ...l,
    id: generateId("line"),
  }));
  data.cart.lines = [...data.cart.lines, ...lines];
  return lines;
}

export { transitionFulfilment as transitionFulfilmentStatus };
export { priceOrder } from "./pricing";
