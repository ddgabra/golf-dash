import type {
  AppData,
  Course,
  DemoIdentity,
  InventoryRecord,
  Product,
  Settings,
  StaffProfile,
} from "./models";

export const SCHEMA_VERSION = 24;
export const STORAGE_KEY = "fairwayserve.prototype.v24";
export const SYNC_CHANNEL = "fairwayserve-sync";

export const identities: DemoIdentity[] = [
  {
    role: "guest_golfer",
    name: "Maya Brooks",
    profile: "Guest golfer testing on-course delivery",
    navigation: ["Round", "Menu", "Checkout", "Orders"],
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
    alcoholVerified: true,
  },
  {
    role: "beverage_cart_staff",
    name: "Nora Patel",
    profile: "Beverage Cart 1 attendant",
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
    profile: "Kitchen expo display",
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

const categories: [string, boolean][] = [
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
  ["Sunscreen and personal items", false],
];

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

function buildCourse(): Course {
  const holes = Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    par: i % 3 === 0 ? 5 : i % 3 === 1 ? 4 : 3,
    tee: { x: 8 + i * 5, y: 10 + (i % 6) * 12 },
    fairway: { x: 12 + i * 5, y: 16 + (i % 6) * 12 },
    green: { x: 16 + i * 5, y: 22 + (i % 6) * 12 },
  }));

  return {
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
        name: "Pro Shop",
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
    alcoholRestrictedAreas: ["Practice range family zone", "Junior clinic lawn"],
    meetingPoints: holes.map((h) => ({
      id: `mp-${h.number}`,
      label: `Hole ${h.number} green-side path`,
      holeNumber: h.number,
      coordinate: h.green,
    })),
  };
}

function buildProducts(courseId: string): Product[] {
  return productNames.map((name, i) => {
    const cat = categories[Math.min(Math.floor(i / 3), categories.length - 1)]!;
    const isFood = ["Sandwiches", "Hot meals", "Breakfast", "Desserts"].includes(
      cat[0],
    );
    const isGolfEssential = cat[0] === "Golf essentials";
    return {
      id: `prod-${String(i + 1).padStart(2, "0")}`,
      courseId,
      name,
      category: cat[0],
      description: `${name} — prepared for on-course hospitality with modifiers, add-ons, and substitution options.`,
      priceCents: 300 + (i % 9) * 175 + (cat[1] ? 450 : 0),
      memberPriceCents: 250 + (i % 9) * 160 + (cat[1] ? 400 : 0),
      alcohol: cat[1],
      allergens: isFood ? ["gluten", i % 2 ? "dairy" : "egg"] : [],
      dietary: isFood && i % 2 === 0 ? ["vegetarian option"] : [],
      prepMinutes: isFood ? 12 + (i % 5) * 4 : 2,
      fulfilmentSources: isFood
        ? [
            "clubhouse_pickup",
            "scheduled_meal",
            "patio_dine_in",
            "takeout",
            "clubhouse_dine_in",
          ]
        : ["cart_delivery", "clubhouse_pickup"],
      cartAvailable: !isFood || i % 4 === 0,
      clubhouseAvailable: true,
      variants: ["standard", "large"],
      requiredModifiers: isFood ? ["bread or bowl"] : [],
      optionalModifiers: ["chilled", "no utensils", "extra napkins"],
      addOns: isFood ? ["chips", "fruit cup"] : ["ice cup"],
      imageToken: cat[0].slice(0, 2).toUpperCase(),
      available: true,
      favourite: i % 7 === 0,
      excludesMinimumSpend: isGolfEssential,
    };
  });
}

function buildInventory(products: Product[]): InventoryRecord[] {
  const locations = [
    "clubhouse",
    "restaurant",
    "halfway",
    "cart-1",
    "cart-2",
    "pro-shop",
  ];
  return locations.flatMap((loc) =>
    products.slice(0, 30).map((p, i) => ({
      id: `${loc}-${p.id}`,
      locationId: loc,
      productId: p.id,
      available: loc.startsWith("cart") ? (p.cartAvailable ? 12 : 0) : 40 + (i % 8),
      reserved: 0,
      reorderThreshold: 5,
      history: ["Seed count confirmed"],
    })),
  );
}

function buildStaff(courseId: string): StaffProfile[] {
  return [
    {
      id: "staff-cart-1",
      courseId,
      name: "Nora Patel",
      role: "beverage_cart_staff",
      status: "available",
      cartId: "cart-1",
      location: { x: 30, y: 30 },
      alcoholEligible: true,
      workload: 0,
      shiftActive: false,
      shiftInventoryConfirmed: false,
    },
    {
      id: "staff-cart-2",
      courseId,
      name: "Sam Rivera",
      role: "beverage_cart_staff",
      status: "available",
      cartId: "cart-2",
      location: { x: 70, y: 55 },
      alcoholEligible: true,
      workload: 0,
      shiftActive: false,
      shiftInventoryConfirmed: false,
    },
    {
      id: "staff-runner",
      courseId,
      name: "Caleb Martin",
      role: "runner",
      status: "available",
      location: { x: 8, y: 8 },
      alcoholEligible: false,
      workload: 0,
      shiftActive: false,
      shiftInventoryConfirmed: false,
    },
    {
      id: "staff-kitchen",
      courseId,
      name: "Grace Thompson",
      role: "kitchen_employee",
      status: "available",
      location: { x: 7, y: 8 },
      alcoholEligible: false,
      workload: 0,
      shiftActive: false,
      shiftInventoryConfirmed: false,
    },
    {
      id: "staff-restaurant",
      courseId,
      name: "Leo Martinez",
      role: "restaurant_server",
      status: "available",
      location: { x: 9, y: 10 },
      alcoholEligible: true,
      workload: 0,
      shiftActive: false,
      shiftInventoryConfirmed: false,
    },
  ];
}

function defaultSettings(): Settings {
  return {
    orderingOpen: true,
    alcoholOrderingOpen: true,
    kitchenOpen: true,
    weatherClosed: false,
    tournamentMode: false,
    alcoholAgeThreshold: 18,
    jurisdiction: "Manitoba demo settings — prototype only, not legal advice",
    demoPaymentNotice: "Demo payment — no real money will be charged.",
    payAtCounterEnabled: true,
    lockerRoomDeliveryEnabled: false,
    serviceDelayMinutes: 0,
    orderingHoursStart: "07:00",
    orderingHoursEnd: "21:00",
    minimumSpendExclusions: [
      "taxes",
      "tips",
      "fees",
      "golf_essentials",
      "promotional",
      "tournament",
    ],
  };
}

export function createSeedData(): AppData {
  const course = buildCourse();
  const products = buildProducts(course.id);
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
        active: true,
      },
    ],
    inventory: buildInventory(products),
    inventoryAdjustments: [],
    orders: [],
    fulfilments: [],
    staff: buildStaff(course.id),
    kitchenTickets: [],
    restaurantRequests: [
      {
        id: "rest-1",
        status: "requested",
        area: "patio",
        partySize: 4,
        accessibilityNote: "Shade preferred",
        foodReady: false,
        memberContext: "Guest party approaching turn",
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
        excludeTaxes: true,
        excludeTips: true,
        excludeFees: true,
        excludeGolfEssentials: true,
        excludePromotional: true,
        excludeTournament: true,
      },
    ],
    notifications: [],
    settings: defaultSettings(),
    cart: { lines: [] },
    favouriteIds: products.filter((p) => p.favourite).map((p) => p.id),
    previousOrderIds: [],
    poorConnection: false,
    offline: false,
    checkoutInProgress: false,
  };
}
