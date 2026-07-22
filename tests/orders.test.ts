import test from "node:test";
import assert from "node:assert/strict";
import { canAccessCourse, canManageOrders, summarizeOrder } from "../lib/core/access";

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

test("summarizeOrder legacy menu shape compatibility", () => {
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
      ],
      deliveryMode: "course_delivery",
      paymentMode: "card",
      locationNote: "Hole 4",
    },
    menu.map((m) => ({
      ...m,
      courseId: m.courseId,
      description: m.name,
      memberPriceCents: m.priceCents,
      alcohol: m.id === "beer",
      allergens: [],
      dietary: [],
      prepMinutes: m.requiresKitchen ? 15 : 2,
      fulfilmentSources: ["cart_delivery" as const],
      cartAvailable: true,
      clubhouseAvailable: true,
      variants: [],
      requiredModifiers: [],
      optionalModifiers: [],
      addOns: [],
      imageToken: "XX",
      favourite: false,
    })),
  );
  assert.equal(summary.alcoholRequiresPhysicalId, true);
  assert.equal(canManageOrders("runner"), true);
  assert.equal(canAccessCourse("c1", "c2", "platform_admin"), true);
});
