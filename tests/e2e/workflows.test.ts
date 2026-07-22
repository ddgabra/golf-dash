import test from "node:test";
import assert from "node:assert/strict";
import {
  canAccessCourse,
  canAccessRoute,
  canManageOrders,
  summarizeOrder,
} from "../../lib/core/access";
import { createSeedData } from "../../lib/core/seed";
import { createOrderFromCart } from "../../lib/core/orders";

const menu = [
  {
    id: "water",
    courseId: "c1",
    name: "Water",
    category: "drink",
    description: "Water",
    priceCents: 300,
    memberPriceCents: 250,
    alcohol: false,
    allergens: [],
    dietary: [],
    prepMinutes: 1,
    fulfilmentSources: ["cart_delivery" as const],
    cartAvailable: true,
    clubhouseAvailable: true,
    variants: [],
    requiredModifiers: [],
    optionalModifiers: [],
    addOns: [],
    imageToken: "WA",
    available: true,
    favourite: false,
  },
  {
    id: "beer",
    courseId: "c1",
    name: "Beer",
    category: "Beer",
    description: "Beer",
    priceCents: 900,
    memberPriceCents: 800,
    alcohol: true,
    allergens: [],
    dietary: [],
    prepMinutes: 2,
    fulfilmentSources: ["cart_delivery" as const],
    cartAvailable: true,
    clubhouseAvailable: true,
    variants: [],
    requiredModifiers: [],
    optionalModifiers: [],
    addOns: [],
    imageToken: "BE",
    available: true,
    favourite: false,
  },
  {
    id: "burger",
    courseId: "c1",
    name: "Burger",
    category: "Hot meals",
    description: "Burger",
    priceCents: 1600,
    memberPriceCents: 1400,
    alcohol: false,
    allergens: ["gluten"],
    dietary: [],
    prepMinutes: 15,
    fulfilmentSources: ["clubhouse_pickup" as const],
    cartAvailable: false,
    clubhouseAvailable: true,
    variants: [],
    requiredModifiers: [],
    optionalModifiers: [],
    addOns: [],
    imageToken: "BU",
    available: true,
    favourite: false,
  },
];

test("summarizeOrder calculates totals and flags", () => {
  const summary = summarizeOrder(
    {
      courseId: "c1",
      role: "guest_golfer",
      lines: [
        {
          id: "l1",
          itemId: "beer",
          quantity: 1,
          fulfilmentType: "cart_delivery",
          deliveryTiming: "immediate",
          modifiers: [],
          addOns: [],
          substitutionPreference: "ask",
        },
        {
          id: "l2",
          itemId: "burger",
          quantity: 1,
          fulfilmentType: "clubhouse_pickup",
          deliveryTiming: "immediate",
          modifiers: [],
          addOns: [],
          substitutionPreference: "ask",
        },
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
});

test("course access is tenant isolated except platform admin", () => {
  assert.equal(canAccessCourse("c1", "c1", "course_manager"), true);
  assert.equal(canAccessCourse("c1", "c2", "course_manager"), false);
  assert.equal(canAccessCourse("c1", "c2", "platform_admin"), true);
  assert.equal(canManageOrders("guest_golfer"), false);
  assert.equal(canManageOrders("runner"), true);
});

test("guest golfer workflow: round, menu, checkout, order", () => {
  const data = createSeedData();
  assert.ok(canAccessRoute("/round", "guest_golfer"));
  assert.ok(canAccessRoute("/menu", "guest_golfer"));
  assert.ok(!canAccessRoute("/staff", "guest_golfer"));

  const result = createOrderFromCart(
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
    false,
  );
  assert.equal(result.ok, true);
  assert.equal(data.orders.length, 1);
});

test("club member beer and sandwich creates separate fulfilments", () => {
  const data = createSeedData();
  const result = createOrderFromCart(
    data,
    "club_member",
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
      {
        id: "l2",
        itemId: "prod-25",
        quantity: 1,
        fulfilmentType: "clubhouse_pickup",
        deliveryTiming: "immediate",
        modifiers: [],
        addOns: [],
        substitutionPreference: "ask",
      },
    ],
    "Member club account",
    true,
  );
  assert.equal(result.ok, true);
  assert.equal(result.order!.fulfilmentIds.length, 2);
});

test("staff role can access staff route", () => {
  assert.ok(canAccessRoute("/staff", "beverage_cart_staff"));
  assert.ok(canAccessRoute("/kitchen", "kitchen_employee"));
  assert.ok(canAccessRoute("/manager", "course_manager"));
});

test("manager pausing alcohol blocks new alcohol orders", () => {
  const data = createSeedData();
  data.settings.alcoholOrderingOpen = false;
  const result = createOrderFromCart(
    data,
    "club_member",
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
    "Member club account",
    true,
  );
  assert.equal(result.ok, false);
});
