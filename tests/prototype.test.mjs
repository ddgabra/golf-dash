import test from "node:test";
import assert from "node:assert/strict";
import {
  createOrder,
  createSeedData,
  priceOrder,
  transitionFulfilment,
  SCHEMA_VERSION,
} from "../dist/assets/core/data.js";

test("seed data covers the complete database-free prototype surface", () => {
  const data = createSeedData();
  assert.equal(data.schemaVersion, SCHEMA_VERSION);
  assert.equal(data.courses[0].holes.length, 18);
  assert.ok(data.courses[0].facilities.some((f) => f.id === "cart-1"));
  assert.ok(
    data.courses[0].deliveryZones.some((z) => z.alcoholAllowed === false),
  );
  assert.ok(data.products.length >= 40);
  assert.ok(data.products.some((p) => p.category === "Beer" && p.alcohol));
  assert.ok(data.products.some((p) => p.category === "Golf essentials"));
  assert.ok(data.inventory.some((i) => i.locationId === "restaurant"));
  assert.ok(data.members[0].requirementCents > data.members[0].completedCents);
});

test("pricing includes taxes, fees, tips, discounts, member prices, and minimum spend posting", () => {
  const data = createSeedData();
  const lines = [
    { itemId: "prod-01", quantity: 1, fulfilmentType: "cart_delivery" },
    { itemId: "prod-25", quantity: 1, fulfilmentType: "clubhouse_pickup" },
  ];
  const priced = priceOrder(lines, data.products, "club_member");
  assert.ok(priced.taxCents > 0);
  assert.ok(priced.serviceFeeCents > 0);
  assert.ok(priced.deliveryFeeCents > 0);
  assert.ok(priced.tipCents > 0);
  assert.ok(priced.discountCents > 0);
  const before = data.members[0].completedCents;
  const order = createOrder(data, "club_member", lines, "Member club account");
  assert.equal(order.paymentStatus, "paid");
  assert.equal(data.members[0].completedCents, before + order.subtotalCents);
});

test("mixed checkout creates independent fulfilments and reserves inventory", () => {
  const data = createSeedData();
  const order = createOrder(data, "club_member", [
    { itemId: "prod-01", quantity: 1, fulfilmentType: "cart_delivery" },
    { itemId: "prod-25", quantity: 1, fulfilmentType: "clubhouse_pickup" },
    { itemId: "prod-28", quantity: 1, fulfilmentType: "scheduled_meal" },
  ]);
  assert.equal(order.fulfilmentIds.length, 3);
  assert.deepEqual(data.fulfilments.map((f) => f.type).sort(), [
    "cart_delivery",
    "clubhouse_pickup",
    "scheduled_meal",
  ]);
  assert.ok(data.inventory.some((i) => i.reserved > 0));
});

test("fulfilment state machine rejects invalid transitions", () => {
  const data = createSeedData();
  createOrder(data, "guest_golfer", [
    { itemId: "prod-13", quantity: 1, fulfilmentType: "cart_delivery" },
  ]);
  const fulfilment = data.fulfilments[0];
  assert.equal(transitionFulfilment(fulfilment, "completed"), false);
  assert.equal(transitionFulfilment(fulfilment, "accepted"), true);
  assert.equal(transitionFulfilment(fulfilment, "collecting"), true);
});

test("controlled payment failure is local and uses no real money", () => {
  const data = createSeedData();
  const order = createOrder(
    data,
    "guest_golfer",
    [{ itemId: "prod-13", quantity: 1, fulfilmentType: "cart_delivery" }],
    "fail payment simulation",
  );
  assert.equal(order.paymentStatus, "failed");
  assert.match(data.settings.demoPaymentNotice, /no real money/);
});
