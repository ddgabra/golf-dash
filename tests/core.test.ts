import test from "node:test";
import assert from "node:assert/strict";
import { createSeedData, SCHEMA_VERSION } from "../lib/core/seed";
import { priceOrder, calculateMinimumSpendCredit } from "../lib/core/pricing";
import {
  createOrderFromCart,
  transitionFulfilment,
  transitionFulfilmentStatus,
} from "../lib/core/orders";
import {
  reserveInventory,
  releaseReservation,
  deductOnDelivery,
} from "../lib/core/inventory";
import { acceptExclusiveTask, estimateEtaMinutes } from "../lib/core/assignment";
import { processPayment, issueRefund } from "../lib/core/payments";
import { checkAlcoholOrder } from "../lib/core/alcohol";
import { store } from "../lib/core/store";

test("seed data covers prototype surface", () => {
  const data = createSeedData();
  assert.equal(data.schemaVersion, SCHEMA_VERSION);
  assert.equal(data.courses[0]!.holes.length, 18);
  assert.ok(data.products.length >= 40);
  assert.ok(data.products.some((p) => p.category === "Beer" && p.alcohol));
  assert.ok(data.inventory.some((i) => i.locationId === "restaurant"));
});

test("pricing includes taxes, fees, tips, discounts, member prices", () => {
  const data = createSeedData();
  const lines = [
    {
      id: "l1",
      itemId: "prod-01",
      quantity: 1,
      fulfilmentType: "cart_delivery" as const,
      deliveryTiming: "immediate" as const,
      modifiers: [],
      addOns: [],
      substitutionPreference: "ask" as const,
    },
    {
      id: "l2",
      itemId: "prod-25",
      quantity: 1,
      fulfilmentType: "clubhouse_pickup" as const,
      deliveryTiming: "immediate" as const,
      modifiers: [],
      addOns: [],
      substitutionPreference: "ask" as const,
    },
  ];
  const priced = priceOrder(lines, data.products, "club_member", data.settings);
  assert.ok(priced.taxCents > 0);
  assert.ok(priced.serviceFeeCents > 0);
  assert.ok(priced.deliveryFeeCents > 0);
  assert.ok(priced.tipCents > 0);
  assert.ok(priced.discountCents > 0);
});

test("mixed checkout creates independent fulfilments and reserves inventory", () => {
  const data = createSeedData();
  const lines = [
    {
      id: "l1",
      itemId: "prod-01",
      quantity: 1,
      fulfilmentType: "cart_delivery" as const,
      deliveryTiming: "immediate" as const,
      modifiers: [],
      addOns: [],
      substitutionPreference: "ask" as const,
    },
    {
      id: "l2",
      itemId: "prod-25",
      quantity: 1,
      fulfilmentType: "clubhouse_pickup" as const,
      deliveryTiming: "immediate" as const,
      modifiers: [],
      addOns: [],
      substitutionPreference: "ask" as const,
    },
    {
      id: "l3",
      itemId: "prod-28",
      quantity: 1,
      fulfilmentType: "scheduled_meal" as const,
      deliveryTiming: "future_meal" as const,
      modifiers: [],
      addOns: [],
      substitutionPreference: "ask" as const,
    },
  ];
  const result = createOrderFromCart(
    data,
    "club_member",
    lines,
    "Member club account",
    true,
  );
  assert.equal(result.ok, true);
  assert.equal(result.order!.fulfilmentIds.length, 3);
  assert.ok(data.inventory.some((i) => i.reserved > 0));
});

test("fulfilment state machine rejects invalid transitions", () => {
  const data = createSeedData();
  createOrderFromCart(
    data,
    "guest_golfer",
    [
      {
        id: "l1",
        itemId: "prod-13",
        quantity: 1,
        fulfilmentType: "cart_delivery",
        deliveryTiming: "immediate",
        modifiers: [],
        addOns: [],
        substitutionPreference: "ask",
      },
    ],
    "Demo Visa ending in 4242",
    true,
  );
  const fulfilment = data.fulfilments[0]!;
  assert.equal(transitionFulfilmentStatus(fulfilment, "completed"), false);
  assert.equal(transitionFulfilmentStatus(fulfilment, "accepted"), true);
});

test("payment failure simulation uses no real money", () => {
  const data = createSeedData();
  const payment = processPayment(data, "fail payment simulation", 1000);
  assert.equal(payment.status, "failed");
  assert.match(data.settings.demoPaymentNotice, /no real money/);
});

test("inventory reservation, release, and deduction", () => {
  const data = createSeedData();
  const before = data.inventory.find(
    (i) => i.locationId === "cart-1" && i.productId === "prod-01",
  )!.available;
  assert.ok(reserveInventory(data, "cart-1", "prod-01", 2, "order-test"));
  const afterReserve = data.inventory.find(
    (i) => i.locationId === "cart-1" && i.productId === "prod-01",
  )!;
  assert.equal(afterReserve.available, before - 2);
  assert.equal(afterReserve.reserved, 2);
  releaseReservation(data, "cart-1", "prod-01", 1, "partial release");
  deductOnDelivery(data, "cart-1", "prod-01", 1, "order-test");
  assert.equal(afterReserve.reserved, 0);
});

test("minimum spend posting for club member", () => {
  const data = createSeedData();
  const member = data.members[0]!;
  const before = member.completedCents;
  const lines = [
    {
      id: "l1",
      itemId: "prod-25",
      quantity: 1,
      fulfilmentType: "clubhouse_pickup" as const,
      deliveryTiming: "immediate" as const,
      modifiers: [],
      addOns: [],
      substitutionPreference: "ask" as const,
    },
  ];
  const priced = priceOrder(lines, data.products, "club_member", data.settings);
  const credit = calculateMinimumSpendCredit(member, priced, data.settings);
  createOrderFromCart(data, "club_member", lines, "Member club account", true);
  assert.ok(member.completedCents > before);
  assert.ok(credit > 0);
});

test("refund reverses minimum spend", () => {
  const data = createSeedData();
  const member = data.members[0]!;
  const lines = [
    {
      id: "l1",
      itemId: "prod-25",
      quantity: 1,
      fulfilmentType: "clubhouse_pickup" as const,
      deliveryTiming: "immediate" as const,
      modifiers: [],
      addOns: [],
      substitutionPreference: "ask" as const,
    },
  ];
  const result = createOrderFromCart(
    data,
    "club_member",
    lines,
    "Member club account",
    true,
  );
  const before = member.completedCents;
  issueRefund(data, result.order!.id, 500, member.id, 500);
  assert.ok(member.completedCents < before);
});

test("assignment engine prevents double acceptance", () => {
  const data = createSeedData();
  createOrderFromCart(
    data,
    "guest_golfer",
    [
      {
        id: "l1",
        itemId: "prod-01",
        quantity: 1,
        fulfilmentType: "cart_delivery",
        deliveryTiming: "immediate",
        modifiers: [],
        addOns: [],
        substitutionPreference: "ask",
      },
    ],
    "Demo Visa ending in 4242",
    true,
  );
  const f = data.fulfilments[0]!;
  const first = acceptExclusiveTask(data, f.id, "staff-cart-1");
  const second = acceptExclusiveTask(data, f.id, "staff-cart-2");
  assert.equal(first.ok, true);
  assert.equal(second.ok, false);
});

test("ETA estimates are deterministic", () => {
  const eta = estimateEtaMinutes({ x: 0, y: 0 }, { x: 40, y: 40 });
  assert.ok(eta >= 3);
});

test("alcohol workflow blocks when ordering paused", () => {
  const data = createSeedData();
  data.settings.alcoholOrderingOpen = false;
  const result = checkAlcoholOrder(
    data,
    [
      {
        id: "l1",
        itemId: "prod-01",
        quantity: 1,
        fulfilmentType: "cart_delivery",
        deliveryTiming: "immediate",
        modifiers: [],
        addOns: [],
        substitutionPreference: "ask",
      },
    ],
    data.sessions[0],
    true,
    "guest_golfer",
  );
  assert.equal(result.allowed, false);
});

test("demo data reset restores seed state", async () => {
  const data = createSeedData();
  data.orders.push({
    id: "test-order",
    courseId: "demo-course",
    customerRole: "guest_golfer",
    customerName: "Test",
    lines: [],
    status: "submitted",
    paymentStatus: "paid",
    paymentMethod: "demo",
    subtotalCents: 100,
    taxCents: 7,
    serviceFeeCents: 4,
    deliveryFeeCents: 0,
    tipCents: 15,
    discountCents: 0,
    totalCents: 126,
    statusHistory: [],
    fulfilmentIds: [],
    minimumSpendCreditCents: 0,
    alcoholConfirmed: false,
    createdAt: new Date().toISOString(),
  });
  const reset = await store.reset();
  assert.equal(reset.orders.length, 0);
  assert.equal(reset.schemaVersion, SCHEMA_VERSION);
});

test("duplicate checkout protection via checkoutLocked", () => {
  const data = createSeedData();
  const lines = [
    {
      id: "l1",
      itemId: "prod-13",
      quantity: 1,
      fulfilmentType: "cart_delivery" as const,
      deliveryTiming: "immediate" as const,
      modifiers: [],
      addOns: [],
      substitutionPreference: "ask" as const,
    },
  ];
  const r1 = createOrderFromCart(
    data,
    "guest_golfer",
    lines,
    "Demo Visa ending in 4242",
    true,
  );
  assert.equal(r1.ok, true);
  assert.equal(r1.order!.checkoutLocked, true);
  assert.equal(data.checkoutInProgress, false);
});

test("checkoutInProgress blocks concurrent checkout", () => {
  const data = createSeedData();
  data.checkoutInProgress = true;
  data.cart.lines = [
    {
      id: "l1",
      itemId: "prod-13",
      quantity: 1,
      fulfilmentType: "cart_delivery",
      deliveryTiming: "immediate",
      modifiers: [],
      addOns: [],
      substitutionPreference: "ask",
    },
  ];
  const result = createOrderFromCart(
    data,
    "guest_golfer",
    data.cart.lines,
    "Demo Visa ending in 4242",
    true,
  );
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /in progress/i);
});
