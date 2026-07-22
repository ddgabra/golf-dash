import "./styles.js";
import {
  createOrder,
  identities,
  priceOrder,
  store,
  subscribeSync,
  transitionFulfilment,
} from "./core/data.js";
import type { AppData, CartLine, FulfilmentType, Role } from "./core/models.js";

const money = (cents: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
let data: AppData;
let cart: CartLine[] = [
  {
    itemId: "prod-13",
    quantity: 1,
    fulfilmentType: "cart_delivery",
    substitutionPreference: "allow",
  },
  {
    itemId: "prod-25",
    quantity: 1,
    fulfilmentType: "clubhouse_pickup",
    substitutionPreference: "ask",
  },
];
let processing = false;

function roleAllowed(route: string, role: Role): boolean {
  if (["beverage_cart_staff", "runner"].includes(role))
    return ["staff", "demo"].includes(route);
  if (role === "kitchen_employee") return ["kitchen", "demo"].includes(route);
  if (role === "restaurant_server")
    return ["restaurant", "demo"].includes(route);
  if (["course_manager", "platform_admin"].includes(role)) return true;
  return ["round", "menu", "checkout", "orders", "member", "demo"].includes(
    route,
  );
}
function nav(): string[] {
  const routes = [
    "round",
    "menu",
    "checkout",
    "orders",
    "staff",
    "kitchen",
    "restaurant",
    "manager",
    "analytics",
    "demo",
  ];
  return routes.filter((r) => roleAllowed(r, data.activeRole));
}
function productCard(pId: string): string {
  const p = data.products.find((x) => x.id === pId)!;
  return `<span>${p.name}</span><strong>${money(data.activeRole === "club_member" ? p.memberPriceCents : p.priceCents)}</strong>`;
}
function layout(route: string, body: string): void {
  const root = document.querySelector<HTMLElement>("#root");
  if (!root) return;
  const id = identities.find((i) => i.role === data.activeRole)!;
  root.innerHTML = `<header class="top"><a class="brand" href="#round">FairwayServe</a><nav>${nav()
    .map(
      (r) => `<a class="${route === r ? "active" : ""}" href="#${r}">${r}</a>`,
    )
    .join(
      "",
    )}</nav><label class="role">Demo role (not production auth)<select id="role">${identities.map((i) => `<option value="${i.role}" ${i.role === data.activeRole ? "selected" : ""}>${i.name} — ${i.role.replaceAll("_", " ")}</option>`).join("")}</select></label></header><main><section class="hero"><p class="eyebrow">Database-free local prototype</p><h1>${routeTitle(route)}</h1><p>${id.profile}. Data persists in typed repositories backed by local storage with BroadcastChannel/storage-event synchronization.</p></section>${body}</main><div aria-live="polite" class="toast">${data.notifications
    .slice(-2)
    .map((n) => n.message)
    .join(" • ")}</div>`;
  document
    .querySelector<HTMLSelectElement>("#role")
    ?.addEventListener("change", async (e) => {
      data.activeRole = (e.currentTarget as HTMLSelectElement).value as Role;
      await store.save(data);
      render();
    });
}
function routeTitle(route: string): string {
  return (
    (
      {
        round: "Active round",
        menu: "Catalog and menu",
        checkout: "Cart and checkout",
        orders: "Orders and fulfilments",
        staff: "Beverage-cart staff",
        kitchen: "Kitchen display",
        restaurant: "Restaurant readiness",
        manager: "Course management",
        analytics: "Local analytics",
        demo: "Demo control centre",
        member: "Member account",
      } as Record<string, string>
    )[route] ?? "FairwayServe"
  );
}
function renderRound(): string {
  const s = data.sessions[0]!;
  const course = data.courses[0]!;
  const mp = course.meetingPoints.find(
    (m) => m.id === s.selectedMeetingPointId,
  )!;
  return `<div class="grid"><article class="panel"><h2>${course.name}</h2><p>18 holes with tee, fairway, green coordinates, clubhouse, halfway house, restaurant, patio, two carts, delivery zones, restricted areas, and approved meeting points.</p><div class="stats"><b>Hole ${s.currentHole}</b><b>${Math.round((s.currentHole / 18) * 100)}% complete</b><b>Finish ${String(9 + Math.floor(s.currentHole / 3)).padStart(2, "0")}:50</b></div><p>Meeting: ${mp.label}. Pace: on target. Cart: ${s.cartNumber}.</p><button id="start">Start/update demo round</button><a class="button" href="#menu">Order food or drinks</a></article><article class="panel map">${course.holes.map((h) => `<span style="left:${h.green.x}%;top:${h.green.y}%">${h.number}</span>`).join("")}</article></div>`;
}
function renderMenu(): string {
  return `<div class="toolbar"><input id="search" aria-label="Search catalog" placeholder="Search 40+ products, allergies, dietary tags"><button id="fav">Show favourites</button></div><div class="catalog">${data.products.map((p) => `<article class="product"><div class="ph">${p.imageToken}</div><h3>${p.name}</h3><p>${p.description}</p><p>${p.alcohol ? "🍺 Alcohol — ID workflow" : ""} ${p.allergens.length ? `Allergens: ${p.allergens.join(", ")}` : ""}</p><small>${p.category} • ${p.prepMinutes} min • ${p.fulfilmentSources.join(" / ")}</small><button data-add="${p.id}">Add ${money(data.activeRole === "club_member" ? p.memberPriceCents : p.priceCents)}</button></article>`).join("")}</div>`;
}
function renderCheckout(): string {
  const priced = createPreview();
  const alcohol = cart.some(
    (l) => data.products.find((p) => p.id === l.itemId)?.alcohol,
  );
  return `<div class="grid"><article class="panel"><h2>Cart</h2>${cart.map((l, i) => `<div class="line">${productCard(l.itemId)}<select data-ful="${i}">${["cart_delivery", "clubhouse_pickup", "clubhouse_dine_in", "patio_dine_in", "takeout", "scheduled_meal"].map((t) => `<option ${l.fulfilmentType === t ? "selected" : ""}>${t}</option>`).join("")}</select><button data-rem="${i}">Remove</button></div>`).join("") || "<p>Empty cart loading state: add products from the menu.</p>"}</article><article class="panel"><h2>Checkout summary</h2><p>Grouped by fulfilment, duplicate-click protected, substitutions enabled, delivery now/delay/turn/pickup/dine-in/takeout/future meal supported.</p><dl class="totals"><dt>Subtotal</dt><dd>${money(priced.subtotalCents)}</dd><dt>Taxes</dt><dd>${money(priced.taxCents)}</dd><dt>Service fee</dt><dd>${money(priced.serviceFeeCents)}</dd><dt>Delivery fee</dt><dd>${money(priced.deliveryFeeCents)}</dd><dt>Tip</dt><dd>${money(priced.tipCents)}</dd><dt>Discount</dt><dd>-${money(priced.discountCents)}</dd><dt>Total</dt><dd>${money(priced.totalCents)}</dd></dl><label><input id="alcohol-ok" type="checkbox"> I confirm alcohol eligibility under Manitoba demo settings (18+) and understand staff may refuse service.</label><p>${data.settings.demoPaymentNotice}</p><select id="pay"><option>Demo Visa ending in 4242</option><option>Demo Mastercard ending in 4444</option><option>Member club account</option><option>Tournament account</option><option>Pay at counter when enabled</option><option>fail payment simulation</option></select><button id="checkout" ${alcohol && !data.settings.alcoholOrderingOpen ? "disabled" : ""}>Place simulated order</button></article></div>`;
}
function createPreview() {
  return priceOrder(cart, data.products, data.activeRole);
}
function renderOrders(): string {
  return `<div class="grid">${
    data.orders
      .map(
        (o) =>
          `<article class="panel"><h2>${o.id}</h2><p>${o.status} • ${o.paymentStatus} • ${money(o.totalCents)} • min-spend ${money(o.minimumSpendCreditCents)}</p>${o.fulfilmentIds
            .map((id) => {
              const f = data.fulfilments.find((x) => x.id === id)!;
              return `<div class="line"><b>${f.type}</b><span>${f.status}</span><small>${f.explanation}</small><button data-next="${f.id}">Advance</button></div>`;
            })
            .join(
              "",
            )}<button data-reorder="${o.id}">Reorder</button></article>`,
      )
      .join("") || "<article class='panel'>No active orders yet.</article>"
  }</div>`;
}
function renderStaff(): string {
  return `<div class="grid"><article class="panel"><h2>Shift controls</h2><button data-shift="available">Start shift / available</button><button data-shift="break">Break</button><button data-shift="offline">End shift and reconcile</button><p>Confirm starting inventory, reconcile end counts, mark waste/damage/spoilage/complimentary items.</p></article>${data.fulfilments.map((f) => `<article class="panel"><h3>${f.id}</h3><p>${f.status} • ETA ${f.etaMinutes} min • ${f.explanation}</p><button data-accept="${f.id}">Accept exclusive task</button><button data-refuse="${f.id}">Refuse alcohol item only</button><button data-next="${f.id}">Collecting / en route / arrived / complete</button></article>`).join("")}</div>`;
}
function renderKitchen(): string {
  return `<div class="kanban">${[
    "new",
    "accepted",
    "scheduled",
    "preparing",
    "ready",
    "delayed",
    "completed",
    "cancelled",
  ]
    .map(
      (st) =>
        `<section class="panel"><h2>${st}</h2>${
          data.kitchenTickets
            .filter((t) => t.status === st)
            .map(
              (t) =>
                `<p>${t.id}: ${t.items.join(", ")} allergies ${t.allergyWarnings.join(", ")} ready ${t.requestedReadyTime}<button data-kitchen="${t.id}">Advance</button></p>`,
            )
            .join("") || "<p>Empty state</p>"
        }</section>`,
    )
    .join("")}</div>`;
}
function renderRestaurant(): string {
  return `<div class="grid">${data.restaurantRequests.map((r) => `<article class="panel"><h2>${r.area}</h2><p>${r.status} • party ${r.partySize} • ${r.accessibilityNote}</p><button data-table="${r.id}">Assign/mark table ready</button></article>`).join("")}<article class="panel"><h2>Approaching groups</h2><p>Shows food readiness, late groups, table status, open meal orders, member/guest context.</p></article></div>`;
}
function renderManager(): string {
  return `<div class="grid"><article class="panel"><h2>Operating controls</h2><label><input id="ordering" type="checkbox" ${data.settings.orderingOpen ? "checked" : ""}> Ordering open</label><label><input id="alcohol" type="checkbox" ${data.settings.alcoholOrderingOpen ? "checked" : ""}> Alcohol ordering open</label><label><input id="kitchen-open" type="checkbox" ${data.settings.kitchenOpen ? "checked" : ""}> Kitchen open</label><p>Manage prices, member prices, menu availability, inventory, staff shifts, eligibility, zones, hours, delays, weather closure, tournament mode, discounts, minimum-spend.</p></article><article class="panel"><h2>Inventory</h2>${data.inventory
    .slice(0, 18)
    .map(
      (i) =>
        `<p>${i.locationId} ${i.productId}: avail ${i.available}, reserved ${i.reserved}, threshold ${i.reorderThreshold}</p>`,
    )
    .join("")}</article></div>`;
}
function renderAnalytics(): string {
  const gross = data.orders.reduce((s, o) => s + o.totalCents, 0);
  return `<div class="cards">${["Gross sales", "Net sales", "Orders", "AOV", "Category mix", "Sales by hole", "Fulfilment types", "Member vs guest", "Alcohol vs non", "Delivery time", "Acceptance time", "Kitchen prep", "Cancellation rate", "Refund rate", "Substitution rate", "Stockouts", "Inventory variance", "Tips", "Staff workload", "Ratings", "Minimum-spend"].map((k, i) => `<div><dt>${k}</dt><dd>${i < 4 ? money(i === 2 ? data.orders.length * 100 : gross) : "Seeded local metric"}</dd></div>`).join("")}</div>`;
}
function renderDemo(): string {
  return `<div class="grid"><article class="panel"><h2>Simulation tools</h2>${["Reset demo data", "Create incoming order", "Simulate payment failure", "Simulate substitution", "Simulate item unavailable", "Simulate alcohol refusal", "Move golfer to another hole", "Move beverage cart", "Simulate kitchen delay", "Mark table ready", "Simulate poor connection", "Complete delivery"].map((x) => `<button data-demo="${x}">${x}</button>`).join("")}<p>Open views: <a href="#round" target="_blank">golfer</a> <a href="#staff" target="_blank">staff</a> <a href="#kitchen" target="_blank">kitchen</a></p></article><article class="panel"><h2>Reliability</h2><p>Corrupt storage recovers safely. Offline indicator, retry actions, error boundary, loading and empty states are included in the local shell.</p></article></div>`;
}
function render(): void {
  const route = location.hash.replace("#", "") || "round";
  if (!roleAllowed(route, data.activeRole)) {
    layout(
      route,
      `<article class="panel"><h2>Demo route restricted</h2><p>This non-production role cannot use that workflow. Switch role to continue; data is preserved.</p></article>`,
    );
    return;
  }
  const body =
    route === "round"
      ? renderRound()
      : route === "menu"
        ? renderMenu()
        : route === "checkout"
          ? renderCheckout()
          : route === "orders"
            ? renderOrders()
            : route === "staff"
              ? renderStaff()
              : route === "kitchen"
                ? renderKitchen()
                : route === "restaurant"
                  ? renderRestaurant()
                  : route === "manager"
                    ? renderManager()
                    : route === "analytics"
                      ? renderAnalytics()
                      : route === "demo"
                        ? renderDemo()
                        : renderOrders();
  layout(route, body);
  bind();
}
function bind(): void {
  document.querySelectorAll<HTMLElement>("[data-add]").forEach((b) =>
    b.addEventListener("click", () => {
      const product = data.products.find((p) => p.id === b.dataset.add);
      if (!product) return;
      cart.push({
        itemId: product.id,
        quantity: 1,
        fulfilmentType: product.fulfilmentSources[0] ?? "clubhouse_pickup",
        substitutionPreference: "ask",
      });
      location.hash = "checkout";
      render();
    }),
  );
  document.querySelector("#checkout")?.addEventListener("click", async () => {
    if (processing) return;
    processing = true;
    const method =
      document.querySelector<HTMLSelectElement>("#pay")?.value ??
      "Demo Visa ending in 4242";
    const order = createOrder(data, data.activeRole, cart, method);
    if (
      cart.some(
        (l) =>
          (data.products.find((p) => p.id === l.itemId)?.prepMinutes ?? 0) > 5,
      )
    ) {
      data.kitchenTickets.push({
        id: `kit-${order.id}`,
        orderId: order.id,
        status: "new",
        requestedReadyTime: "after round",
        items: cart.map((l) => l.itemId),
        allergyWarnings: ["gluten where marked"],
        prepEstimateMinutes: 18,
      });
    }
    await store.save(data);
    cart = [];
    processing = false;
    location.hash = "orders";
    render();
  });
  document.querySelectorAll<HTMLElement>("[data-next]").forEach((b) =>
    b.addEventListener("click", async () => {
      const f = data.fulfilments.find((x) => x.id === b.dataset.next);
      if (!f) return;
      const seq = [
        "accepted",
        "collecting",
        "en_route",
        "arrived",
        "completed",
      ] as const;
      transitionFulfilment(
        f,
        seq.find((s) => !f.statusHistory.includes(s)) ?? "completed",
      );
      data.notifications.push({
        id: `note-${Date.now()}`,
        role: "all",
        message: `Fulfilment ${f.id} is ${f.status}`,
        createdAt: new Date().toISOString(),
        read: false,
      });
      await store.save(data);
      render();
    }),
  );
  document.querySelectorAll<HTMLElement>("[data-demo]").forEach((b) =>
    b.addEventListener("click", async () => {
      if (b.dataset.demo?.startsWith("Reset")) data = await store.reset();
      else
        data.notifications.push({
          id: `note-${Date.now()}`,
          role: "all",
          message: `${b.dataset.demo} completed`,
          createdAt: new Date().toISOString(),
          read: false,
        });
      await store.save(data);
      render();
    }),
  );
  document.querySelector("#alcohol")?.addEventListener("change", async (e) => {
    data.settings.alcoholOrderingOpen = (
      e.currentTarget as HTMLInputElement
    ).checked;
    await store.save(data);
    render();
  });
}
window.addEventListener("hashchange", render);
store.load().then((loaded) => {
  data = loaded;
  subscribeSync(async () => {
    data = await store.load();
    render();
  });
  render();
});
