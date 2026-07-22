import type {
  AppData,
  CartLine,
  Course,
  DemoIdentity,
  Fulfilment,
  FulfilmentStatus,
  FulfilmentType,
  GolfSession,
  InventoryRecord,
  KitchenTicket,
  MemberAccount,
  NotificationRecord,
  Order,
  Product,
  RestaurantRequest,
  Role,
  Settings,
  StaffProfile,
} from "./models.js";

export const SCHEMA_VERSION = 24;
export const STORAGE_KEY = "fairwayserve.prototype.v24";
const channelName = "fairwayserve-sync";

export const identities: DemoIdentity[] = [
  {
    role: "guest_golfer",
    name: "Maya Brooks",
    profile: "Guest golfer testing course delivery",
    navigation: ["Round", "Menu", "Checkout", "Receipt"],
  },
  {
    role: "registered_golfer",
    name: "Ethan Singh",
    profile: "Registered public golfer with saved favourites",
    navigation: ["Round", "Menu", "Orders"],
  },
  {
    role: "club_member",
    name: "Olivia Chen",
    profile: "Club member with account charging and minimum spend",
    navigation: ["Round", "Menu", "Member", "Orders"],
    memberAccountId: "member-olivia",
  },
  {
    role: "beverage_cart_staff",
    name: "Nora Patel",
    profile: "Cart 1 attendant",
    navigation: ["Shift", "Incoming", "Inventory", "Route"],
  },
  {
    role: "runner",
    name: "Caleb Martin",
    profile: "Runner for clubhouse collections",
    navigation: ["Tasks", "Route", "Inventory"],
  },
  {
    role: "kitchen_employee",
    name: "Grace Thompson",
    profile: "Kitchen expo",
    navigation: ["Kitchen Display", "Prep", "Messages"],
  },
  {
    role: "restaurant_server",
    name: "Leo Martinez",
    profile: "Restaurant and patio server",
    navigation: ["Tables", "Approaching Groups", "Food Ready"],
  },
  {
    role: "course_manager",
    name: "Priya Shah",
    profile: "Course operations manager",
    navigation: ["Manager", "Inventory", "Staff", "Analytics", "Settings"],
  },
  {
    role: "platform_admin",
    name: "Jordan Wells",
    profile: "Platform administrator demo",
    navigation: ["Demo", "All Roles", "Audit"],
  },
];

const cats = [
  ["Beer", true],
  ["Canned cocktails", true],
  ["Wine", true],
  ["Non-alcoholic beverages", false],
  ["Water", false],
  ["Sports drinks", false],
  ["Coffee", false],
  ["Snacks", false],
  ["Sandwiches", false],
  ["Hot meals", false],
  ["Breakfast", false],
  ["Desserts", false],
  ["Golf essentials", false],
  ["Personal items", false],
] as const;
const productNames = [
  "Prairie Lager",
  "Session IPA",
  "Light Pilsner",
  "Ready Caesar",
  "Vodka Soda Lime",
  "Whisky Ginger Can",
  "Pinot Grigio",
  "Rosé Cup",
  "Cabernet Split",
  "Iced Tea",
  "Sparkling Lemonade",
  "Ginger Ale",
  "Still Water",
  "Premium Mineral Water",
  "Coconut Water",
  "Blue Electrolyte",
  "Orange Sports Drink",
  "Protein Shake",
  "Drip Coffee",
  "Cold Brew",
  "Espresso Tonic",
  "Trail Mix",
  "Pretzels",
  "Energy Bar",
  "Turkey Club",
  "Chicken Caesar Wrap",
  "Veggie Hummus Sandwich",
  "Cheeseburger",
  "Chicken Tenders",
  "Veggie Rice Bowl",
  "Breakfast Burrito",
  "Greek Yogurt Parfait",
  "Bagel Sandwich",
  "Brownie",
  "Cookie Pack",
  "Ice Cream Cup",
  "Sleeve of Balls",
  "Golf Glove",
  "Tees Pack",
  "Sunscreen SPF 50",
  "Bug Spray",
  "Lip Balm",
];

export function createSeedData(): AppData {
  const holes = Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    par: i % 3 === 0 ? 5 : i % 3 === 1 ? 4 : 3,
    tee: { x: 8 + i * 5, y: 10 + (i % 6) * 12 },
    fairway: { x: 12 + i * 5, y: 16 + (i % 6) * 12 },
    green: { x: 16 + i * 5, y: 22 + (i % 6) * 12 },
  }));
  const course: Course = {
    id: "demo-course",
    courseId: "demo-course",
    name: "FairwayServe Demo Club",
    holes,
    facilities: [
      {
        id: "clubhouse",
        name: "Clubhouse",
        type: "clubhouse",
        coordinate: { x: 5, y: 5 },
      },
      {
        id: "halfway",
        name: "Halfway House",
        type: "halfway_house",
        coordinate: { x: 48, y: 38 },
      },
      {
        id: "restaurant",
        name: "Restaurant",
        type: "restaurant",
        coordinate: { x: 7, y: 8 },
      },
      {
        id: "patio",
        name: "Patio",
        type: "patio",
        coordinate: { x: 9, y: 10 },
      },
      {
        id: "cart-1",
        name: "Beverage Cart 1",
        type: "beverage_cart",
        coordinate: { x: 30, y: 30 },
      },
      {
        id: "cart-2",
        name: "Beverage Cart 2",
        type: "beverage_cart",
        coordinate: { x: 70, y: 55 },
      },
      {
        id: "pro-shop",
        name: "Pro shop",
        type: "pro_shop",
        coordinate: { x: 4, y: 6 },
      },
    ],
    deliveryZones: [
      {
        id: "front",
        name: "Front nine",
        holeNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        alcoholAllowed: true,
      },
      {
        id: "back",
        name: "Back nine",
        holeNumbers: [10, 11, 12, 13, 14, 15, 16, 17, 18],
        alcoholAllowed: true,
      },
      {
        id: "range",
        name: "Practice range family zone",
        holeNumbers: [],
        alcoholAllowed: false,
      },
    ],
    alcoholRestrictedAreas: [
      "Practice range family zone",
      "Junior clinic lawn",
    ],
    meetingPoints: holes.map((h) => ({
      id: `mp-${h.number}`,
      label: `Hole ${h.number} green-side path`,
      holeNumber: h.number,
      coordinate: h.green,
    })),
  };
  const products: Product[] = productNames.map((name, i) => {
    const cat = cats[Math.min(Math.floor(i / 3), cats.length - 1)]!;
    const isFood = [
      "Sandwiches",
      "Hot meals",
      "Breakfast",
      "Desserts",
    ].includes(cat[0]);
    return {
      id: `prod-${String(i + 1).padStart(2, "0")}`,
      courseId: course.id,
      name,
      category: cat[0],
      description: `${name} prepared for on-course hospitality with clear demo modifiers and substitutions.`,
      priceCents: 300 + (i % 9) * 175 + (cat[1] ? 450 : 0),
      memberPriceCents: 250 + (i % 9) * 160 + (cat[1] ? 400 : 0),
      alcohol: cat[1],
      allergens: isFood ? ["gluten", i % 2 ? "dairy" : "egg"] : [],
      dietary: isFood && i % 2 === 0 ? ["vegetarian option"] : [],
      prepMinutes: isFood ? 12 + (i % 5) * 4 : 2,
      fulfilmentSources: isFood
        ? ["clubhouse_pickup", "scheduled_meal", "patio_dine_in", "takeout"]
        : ["cart_delivery", "clubhouse_pickup"],
      cartAvailable: !isFood || i % 4 === 0,
      clubhouseAvailable: true,
      variants: ["standard", "large"],
      requiredModifiers: isFood ? ["bread or bowl"] : [],
      optionalModifiers: ["chilled", "no utensils", "extra napkins"],
      addOns: isFood ? ["chips", "fruit cup"] : ["ice cup"],
      imageToken: cat[0],
      available: true,
      favourite: i % 7 === 0,
    };
  });
  const inventory: InventoryRecord[] = [
    "clubhouse",
    "restaurant",
    "halfway",
    "cart-1",
    "cart-2",
    "pro-shop",
  ].flatMap((loc) =>
    products.slice(0, 24).map((p, i) => ({
      id: `${loc}-${p.id}`,
      locationId: loc,
      productId: p.id,
      available: loc.startsWith("cart")
        ? p.cartAvailable
          ? 10
          : 0
        : 35 + (i % 8),
      reserved: 0,
      reorderThreshold: 5,
      history: ["Seed count confirmed"],
    })),
  );
  const staff: StaffProfile[] = [
    {
      id: "staff-cart-1",
      courseId: course.id,
      name: "Nora Patel",
      role: "beverage_cart_staff",
      status: "available",
      cartId: "cart-1",
      location: { x: 30, y: 30 },
      alcoholEligible: true,
      workload: 0,
    },
    {
      id: "staff-runner",
      courseId: course.id,
      name: "Caleb Martin",
      role: "runner",
      status: "available",
      location: { x: 8, y: 8 },
      alcoholEligible: false,
      workload: 0,
    },
    {
      id: "staff-kitchen",
      courseId: course.id,
      name: "Grace Thompson",
      role: "kitchen_employee",
      status: "available",
      location: { x: 7, y: 8 },
      alcoholEligible: false,
      workload: 0,
    },
  ];
  return {
    schemaVersion: SCHEMA_VERSION,
    activeRole: "guest_golfer",
    courses: [course],
    products,
    sessions: [
      {
        id: "session-demo",
        courseId: course.id,
        playerName: "Maya Brooks",
        teeTime: "09:20",
        groupSize: 4,
        cartNumber: "Cart 14",
        startingHole: 1,
        currentHole: 7,
        joinedGroupId: "seeded-smith-four",
        simulatedLocationEnabled: true,
        selectedMeetingPointId: "mp-7",
      },
    ],
    inventory,
    orders: [],
    fulfilments: [],
    staff,
    kitchenTickets: [],
    restaurantRequests: [
      {
        id: "rest-1",
        status: "requested",
        area: "patio",
        partySize: 4,
        accessibilityNote: "Shade preferred",
      },
    ],
    members: [
      {
        id: "member-olivia",
        memberName: "Olivia Chen",
        requirementCents: 30000,
        completedCents: 18450,
        pendingCents: 0,
        periodEnd: "2026-07-31",
        adjustments: [],
      },
    ],
    notifications: [],
    settings: {
      orderingOpen: true,
      alcoholOrderingOpen: true,
      kitchenOpen: true,
      weatherClosed: false,
      tournamentMode: false,
      alcoholAgeThreshold: 18,
      jurisdiction: "Manitoba demo settings — prototype only, not legal advice",
      demoPaymentNotice: "Demo payment — no real money will be charged.",
    },
  };
}

function safeClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}
function emitSync(): void {
  if (typeof BroadcastChannel !== "undefined") {
    const bc = new BroadcastChannel(channelName);
    bc.postMessage({ type: "changed" });
    bc.close();
  }
  if (typeof localStorage !== "undefined")
    localStorage.setItem(`${STORAGE_KEY}.ping`, String(Date.now()));
}
export class LocalRepository<T> {
  constructor(
    private getAll: (d: AppData) => T[],
    private setAll: (d: AppData, v: T[]) => void,
  ) {}
  async list(): Promise<T[]> {
    return this.getAll(await store.load());
  }
  async save(value: T): Promise<void> {
    const d = await store.load();
    const all = this.getAll(d);
    const id = (value as { id: string }).id;
    const idx = all.findIndex((x) => (x as { id: string }).id === id);
    if (idx >= 0) all[idx] = value;
    else all.push(value);
    this.setAll(d, all);
    await store.save(d);
  }
}
export const repositories = {
  course: new LocalRepository<Course>(
    (d) => d.courses,
    (d, v) => {
      d.courses = v;
    },
  ),
  catalog: new LocalRepository<Product>(
    (d) => d.products,
    (d, v) => {
      d.products = v;
    },
  ),
  menu: new LocalRepository<Product>(
    (d) => d.products,
    (d, v) => {
      d.products = v;
    },
  ),
  inventory: new LocalRepository<InventoryRecord>(
    (d) => d.inventory,
    (d, v) => {
      d.inventory = v;
    },
  ),
  golfSession: new LocalRepository<GolfSession>(
    (d) => d.sessions,
    (d, v) => {
      d.sessions = v;
    },
  ),
  order: new LocalRepository<Order>(
    (d) => d.orders,
    (d, v) => {
      d.orders = v;
    },
  ),
  fulfilment: new LocalRepository<Fulfilment>(
    (d) => d.fulfilments,
    (d, v) => {
      d.fulfilments = v;
    },
  ),
  staff: new LocalRepository<StaffProfile>(
    (d) => d.staff,
    (d, v) => {
      d.staff = v;
    },
  ),
  kitchen: new LocalRepository<KitchenTicket>(
    (d) => d.kitchenTickets,
    (d, v) => {
      d.kitchenTickets = v;
    },
  ),
  restaurant: new LocalRepository<RestaurantRequest>(
    (d) => d.restaurantRequests,
    (d, v) => {
      d.restaurantRequests = v;
    },
  ),
  member: new LocalRepository<MemberAccount>(
    (d) => d.members,
    (d, v) => {
      d.members = v;
    },
  ),
  minimumSpend: new LocalRepository<MemberAccount>(
    (d) => d.members,
    (d, v) => {
      d.members = v;
    },
  ),
  notification: new LocalRepository<NotificationRecord>(
    (d) => d.notifications,
    (d, v) => {
      d.notifications = v;
    },
  ),
  settings: {
    async get(): Promise<Settings> {
      return (await store.load()).settings;
    },
    async save(settings: Settings): Promise<void> {
      const d = await store.load();
      d.settings = settings;
      await store.save(d);
    },
  },
};
export const store = {
  async load(): Promise<AppData> {
    if (typeof localStorage === "undefined") return createSeedData();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedData();
      await this.save(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (
      parsed.schemaVersion !== SCHEMA_VERSION ||
      !Array.isArray(parsed.products)
    ) {
      const seed = createSeedData();
      await this.save(seed);
      return seed;
    }
    return parsed as AppData;
  },
  async save(data: AppData): Promise<void> {
    data.schemaVersion = SCHEMA_VERSION;
    if (typeof localStorage !== "undefined")
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    emitSync();
  },
  async reset(): Promise<AppData> {
    const seed = createSeedData();
    await this.save(seed);
    return seed;
  },
};
export function subscribeSync(callback: () => void): () => void {
  let bc: BroadcastChannel | undefined;
  if (typeof BroadcastChannel !== "undefined") {
    bc = new BroadcastChannel(channelName);
    bc.onmessage = callback;
  }
  const handler = (e: StorageEvent): void => {
    if (e.key?.startsWith(STORAGE_KEY)) callback();
  };
  window.addEventListener("storage", handler);
  return () => {
    bc?.close();
    window.removeEventListener("storage", handler);
  };
}
export function priceOrder(lines: CartLine[], products: Product[], role: Role) {
  const subtotalCents = lines.reduce((sum, l) => {
    const p = products.find((x) => x.id === l.itemId);
    return (
      sum +
      (p
        ? (role === "club_member" ? p.memberPriceCents : p.priceCents) *
          l.quantity
        : 0)
    );
  }, 0);
  const taxCents = Math.round(subtotalCents * 0.07);
  const serviceFeeCents = Math.round(subtotalCents * 0.04);
  const deliveryFeeCents = lines.some(
    (l) => l.fulfilmentType === "cart_delivery",
  )
    ? 350
    : 0;
  const tipCents = Math.round(subtotalCents * 0.15);
  const discountCents =
    role === "club_member" ? Math.round(subtotalCents * 0.05) : 0;
  return {
    subtotalCents,
    taxCents,
    serviceFeeCents,
    deliveryFeeCents,
    tipCents,
    discountCents,
    totalCents:
      subtotalCents +
      taxCents +
      serviceFeeCents +
      deliveryFeeCents +
      tipCents -
      discountCents,
  };
}
export function createOrder(
  data: AppData,
  role: Role,
  lines: CartLine[],
  paymentMethod = "Demo Visa ending in 4242",
): Order {
  const identity = identities.find((i) => i.role === role)!;
  const priced = priceOrder(lines, data.products, role);
  const id = `order-${Date.now()}`;
  const groups = new Map<FulfilmentType, string[]>();
  for (const line of lines) {
    const p = data.products.find((x) => x.id === line.itemId);
    const type =
      line.fulfilmentType ?? p?.fulfilmentSources[0] ?? "clubhouse_pickup";
    groups.set(type, [...(groups.get(type) ?? []), line.itemId]);
    const inv = data.inventory.find(
      (x) =>
        x.productId === line.itemId &&
        (type === "cart_delivery"
          ? x.locationId === "cart-1"
          : x.locationId === "clubhouse"),
    );
    if (inv) {
      inv.available -= line.quantity;
      inv.reserved += line.quantity;
      inv.history.push(`Reserved ${line.quantity} for ${id}`);
    }
  }
  const fulfilmentIds: string[] = [];
  for (const [type, itemIds] of groups) {
    const f: Fulfilment = {
      id: `ful-${id}-${type}`,
      orderId: id,
      type,
      status: "assigned",
      itemIds,
      assignedStaffId:
        type === "cart_delivery"
          ? "staff-cart-1"
          : type === "scheduled_meal"
            ? "staff-kitchen"
            : "staff-runner",
      statusHistory: ["new", "assigned"],
      assignmentHistory: [assignmentExplanation(type)],
      etaMinutes: type === "cart_delivery" ? 9 : 22,
      explanation: assignmentExplanation(type),
    };
    data.fulfilments.push(f);
    fulfilmentIds.push(f.id);
  }
  const order: Order = {
    id,
    courseId: "demo-course",
    customerRole: role,
    customerName: identity.name,
    lines,
    status: "submitted",
    paymentStatus: paymentMethod.includes("fail") ? "failed" : "paid",
    paymentMethod,
    ...priced,
    statusHistory: ["submitted"],
    fulfilmentIds,
    minimumSpendCreditCents: role === "club_member" ? priced.subtotalCents : 0,
  };
  data.orders.push(order);
  if (role === "club_member") {
    const m = data.members[0];
    if (m) {
      m.completedCents += order.minimumSpendCreditCents;
      m.adjustments.push(
        `Posted ${order.minimumSpendCreditCents} cents from ${id}`,
      );
    }
  }
  data.notifications.push({
    id: `note-${id}`,
    role,
    message: `Order placed: ${id}`,
    createdAt: new Date().toISOString(),
    read: false,
  });
  return order;
}
export function assignmentExplanation(type: FulfilmentType): string {
  return type === "cart_delivery"
    ? "Assigned to Cart 1: available, nearest zone, alcohol eligible, cart stock confirmed."
    : type === "scheduled_meal"
      ? "Assigned to kitchen: scheduled ready time and party finish estimate matched."
      : "Assigned to runner: clubhouse collection required and runner workload is lowest.";
}
export function transitionFulfilment(
  f: Fulfilment,
  next: FulfilmentStatus,
): boolean {
  const allowed: Record<FulfilmentStatus, FulfilmentStatus[]> = {
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
  if (!allowed[f.status].includes(next)) return false;
  f.status = next;
  f.statusHistory.push(next);
  return true;
}
