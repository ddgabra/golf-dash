import "./styles.js";
import { summarizeOrder } from "./core/orders.js";
import type { MenuItem, OrderDraft } from "./core/models.js";

const demoMenu: MenuItem[] = [
  {
    id: "water-1",
    courseId: "demo-course",
    name: "Cold Water",
    category: "drink",
    priceCents: 300,
    available: true,
    requiresKitchen: false,
    requiresIdCheck: false,
    stockOnCart: 18,
  },
  {
    id: "lager-1",
    courseId: "demo-course",
    name: "Local Lager",
    category: "alcohol",
    priceCents: 800,
    available: true,
    requiresKitchen: false,
    requiresIdCheck: true,
    stockOnCart: 8,
  },
  {
    id: "wrap-1",
    courseId: "demo-course",
    name: "Turkey Club Wrap",
    category: "food",
    priceCents: 1400,
    available: true,
    requiresKitchen: true,
    requiresIdCheck: false,
    stockOnCart: 6,
  },
];

const demoDraft: OrderDraft = {
  courseId: "demo-course",
  role: "guest_golfer",
  lines: [
    { itemId: "water-1", quantity: 2 },
    { itemId: "wrap-1", quantity: 1 },
  ],
  deliveryMode: "course_delivery",
  paymentMode: "card",
  locationNote: "Hole 7 fairway, left bunker",
};

function dollars(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function render(): void {
  const root = document.querySelector<HTMLElement>("#root");
  if (!root) return;
  const summary = summarizeOrder(demoDraft, demoMenu);
  root.innerHTML = `
    <section class="shell">
      <p class="eyebrow">FairwayServe phase 1 foundation</p>
      <h1>Order food and drinks without leaving the round.</h1>
      <p class="lede">This build establishes the documented autonomous loop, course-scoped order rules, alcohol ID flags, kitchen routing, inventory reservations, and validation checks.</p>
      <dl class="cards" aria-label="Demo order summary">
        <div><dt>Status</dt><dd>${summary.status}</dd></div>
        <div><dt>Subtotal</dt><dd>${dollars(summary.subtotalCents)}</dd></div>
        <div><dt>Kitchen</dt><dd>${summary.kitchenRequired ? "Required" : "Not required"}</dd></div>
        <div><dt>Alcohol ID</dt><dd>${summary.alcoholRequiresPhysicalId ? "Physical check required" : "Not required"}</dd></div>
      </dl>
      <button type="button" aria-describedby="checkout-note">Review checkout</button>
      <p id="checkout-note">Payments, realtime staff workflows, and database-backed persistence are tracked in later phase gates.</p>
    </section>`;
}

render();
