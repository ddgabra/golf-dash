import test from "node:test";
import assert from "node:assert/strict";
import {
  canAccessCourse,
  canManageOrders,
  summarizeOrder,
} from "../dist/assets/core/orders.js";

const menu = [
  {
    id: "water",
    courseId: "c1",
    name: "Water",
    category: "drink",
    priceCents: 300,
    available: true,
    requiresKitchen: false,
    requiresIdCheck: false,
    stockOnCart: 10,
  },
  {
    id: "beer",
    courseId: "c1",
    name: "Beer",
    category: "alcohol",
    priceCents: 900,
    available: true,
    requiresKitchen: false,
    requiresIdCheck: true,
    stockOnCart: 2,
  },
  {
    id: "burger",
    courseId: "c1",
    name: "Burger",
    category: "food",
    priceCents: 1600,
    available: true,
    requiresKitchen: true,
    requiresIdCheck: false,
    stockOnCart: 5,
  },
];

test("summarizeOrder calculates totals, kitchen routing, inventory reservations, and alcohol ID flags", () => {
  const summary = summarizeOrder(
    {
      courseId: "c1",
      role: "guest_golfer",
      lines: [
        { itemId: "beer", quantity: 1 },
        { itemId: "burger", quantity: 1 },
      ],
      deliveryMode: "course_delivery",
      paymentMode: "card",
      locationNote: "Hole 4",
    },
    menu,
  );
  assert.equal(summary.status, "submitted");
  assert.equal(summary.subtotalCents, 2500);
  assert.equal(summary.alcoholRequiresPhysicalId, true);
  assert.equal(summary.kitchenRequired, true);
  assert.deepEqual(summary.inventoryReservations, [
    { itemId: "beer", quantity: 1 },
    { itemId: "burger", quantity: 1 },
  ]);
});

test("summarizeOrder rejects cross-course items and non-member account charges", () => {
  const summary = summarizeOrder(
    {
      courseId: "c2",
      role: "registered_golfer",
      lines: [{ itemId: "water", quantity: 1 }],
      deliveryMode: "course_delivery",
      paymentMode: "member_account",
      locationNote: "Hole 1",
    },
    menu,
  );
  assert.equal(summary.status, "draft");
  assert.match(summary.warnings.join(" "), /not available for this course/);
  assert.match(summary.warnings.join(" "), /Only club members/);
});

test("course access is tenant isolated except for platform administrators", () => {
  assert.equal(canAccessCourse("c1", "c1", "course_manager"), true);
  assert.equal(canAccessCourse("c1", "c2", "course_manager"), false);
  assert.equal(canAccessCourse("c1", "c2", "platform_admin"), true);
  assert.equal(canManageOrders("guest_golfer"), false);
  assert.equal(canManageOrders("runner"), true);
});
