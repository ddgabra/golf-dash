export type Role =
  | "guest_golfer"
  | "registered_golfer"
  | "club_member"
  | "beverage_cart_staff"
  | "runner"
  | "kitchen_employee"
  | "restaurant_server"
  | "course_manager"
  | "platform_admin";

export type Coordinate = { x: number; y: number };

export type FulfilmentType =
  | "cart_delivery"
  | "clubhouse_pickup"
  | "clubhouse_dine_in"
  | "patio_dine_in"
  | "takeout"
  | "scheduled_meal";

export type DeliveryTiming =
  "immediate" | "at_hole" | "delayed" | "meet_at_turn" | "future_meal";

export type PaymentStatus =
  "pending" | "authorized" | "paid" | "failed" | "partially_refunded" | "refunded";

export type OrderStatus =
  | "draft"
  | "submitted"
  | "accepted"
  | "partially_fulfilled"
  | "delivered"
  | "partially_cancelled"
  | "cancelled";

export type FulfilmentStatus =
  | "new"
  | "assigned"
  | "accepted"
  | "collecting"
  | "en_route"
  | "arrived"
  | "partially_completed"
  | "completed"
  | "cancelled"
  | "delayed";

export type StaffStatus = "available" | "busy" | "break" | "offline";

export type NotificationType =
  | "order_placed"
  | "order_accepted"
  | "substitution_requested"
  | "staff_assigned"
  | "staff_approaching"
  | "staff_arrived"
  | "delivery_delayed"
  | "unable_to_locate"
  | "item_unavailable"
  | "alcohol_refused"
  | "order_delivered"
  | "kitchen_started"
  | "food_ready"
  | "table_ready"
  | "payment_failure"
  | "refund_issued"
  | "minimum_spend_update";

export interface CourseScopedEntity {
  id: string;
  courseId: string;
}

export interface Hole {
  number: number;
  par: number;
  tee: Coordinate;
  fairway: Coordinate;
  green: Coordinate;
}

export interface Facility {
  id: string;
  name: string;
  type:
    | "clubhouse"
    | "halfway_house"
    | "restaurant"
    | "patio"
    | "beverage_cart"
    | "pro_shop";
  coordinate: Coordinate;
}

export interface DeliveryZone {
  id: string;
  name: string;
  holeNumbers: number[];
  alcoholAllowed: boolean;
}

export interface MeetingPoint {
  id: string;
  label: string;
  holeNumber: number;
  coordinate: Coordinate;
}

export interface Course extends CourseScopedEntity {
  name: string;
  holes: Hole[];
  facilities: Facility[];
  deliveryZones: DeliveryZone[];
  alcoholRestrictedAreas: string[];
  meetingPoints: MeetingPoint[];
}

export interface Product extends CourseScopedEntity {
  name: string;
  category: string;
  description: string;
  priceCents: number;
  memberPriceCents: number;
  alcohol: boolean;
  allergens: string[];
  dietary: string[];
  prepMinutes: number;
  fulfilmentSources: FulfilmentType[];
  cartAvailable: boolean;
  clubhouseAvailable: boolean;
  variants: string[];
  requiredModifiers: string[];
  optionalModifiers: string[];
  addOns: string[];
  imageToken: string;
  available: boolean;
  favourite: boolean;
  excludesMinimumSpend?: boolean;
}

export interface CartLine {
  id: string;
  itemId: string;
  quantity: number;
  fulfilmentType: FulfilmentType;
  deliveryTiming: DeliveryTiming;
  deliveryDelayMinutes?: number;
  variant?: string;
  modifiers: string[];
  addOns: string[];
  notes?: string;
  substitutionPreference: "allow" | "ask" | "none";
}

export interface DemoIdentity {
  role: Role;
  name: string;
  profile: string;
  navigation: string[];
  memberAccountId?: string;
  alcoholVerified?: boolean;
}

export interface GolfSession extends CourseScopedEntity {
  playerName: string;
  teeTime: string;
  groupSize: number;
  cartNumber: string;
  startingHole: number;
  currentHole: number;
  joinedGroupId?: string;
  simulatedLocationEnabled: boolean;
  selectedMeetingPointId: string;
  active: boolean;
}

export interface InventoryRecord {
  id: string;
  locationId: string;
  productId: string;
  available: number;
  reserved: number;
  reorderThreshold: number;
  history: string[];
}

export interface InventoryAdjustment {
  id: string;
  recordId: string;
  type:
    | "transfer"
    | "adjustment"
    | "waste"
    | "damage"
    | "spoilage"
    | "complimentary"
    | "shift_start"
    | "shift_end"
    | "delivery"
    | "reservation"
    | "release";
  quantity: number;
  note: string;
  createdAt: string;
}

export interface FulfilmentItem {
  itemId: string;
  quantity: number;
  status: "pending" | "ready" | "delivered" | "refused" | "unavailable" | "substituted";
  refusalReason?: string;
  substitutionItemId?: string;
}

export interface Fulfilment {
  id: string;
  orderId: string;
  type: FulfilmentType;
  status: FulfilmentStatus;
  items: FulfilmentItem[];
  assignedStaffId?: string;
  statusHistory: { status: FulfilmentStatus; at: string; note?: string }[];
  assignmentHistory: { staffId: string; at: string; explanation: string }[];
  etaMinutes: number;
  explanation: string;
  routeCoordinates: Coordinate[];
  lockedBy?: string;
}

export interface Order {
  id: string;
  courseId: string;
  customerRole: Role;
  customerName: string;
  sessionId?: string;
  lines: CartLine[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotalCents: number;
  taxCents: number;
  serviceFeeCents: number;
  deliveryFeeCents: number;
  tipCents: number;
  discountCents: number;
  totalCents: number;
  statusHistory: { status: OrderStatus; at: string }[];
  fulfilmentIds: string[];
  minimumSpendCreditCents: number;
  alcoholConfirmed: boolean;
  createdAt: string;
  checkoutLocked?: boolean;
}

export interface StaffProfile extends CourseScopedEntity {
  name: string;
  role: Role;
  status: StaffStatus;
  cartId?: string;
  location: Coordinate;
  alcoholEligible: boolean;
  workload: number;
  shiftActive: boolean;
  shiftInventoryConfirmed: boolean;
}

export interface KitchenTicket {
  id: string;
  orderId: string;
  fulfilmentId?: string;
  status:
    | "new"
    | "accepted"
    | "scheduled"
    | "preparing"
    | "ready"
    | "delayed"
    | "completed"
    | "cancelled";
  requestedReadyTime: string;
  recommendedStartTime: string;
  estimatedGolferFinish: string;
  timingConfidence: "high" | "medium" | "low";
  partySize: number;
  items: string[];
  modifiers: string[];
  allergyWarnings: string[];
  prepEstimateMinutes: number;
  fulfilmentType: FulfilmentType;
  pickupLocation?: string;
}

export interface RestaurantRequest {
  id: string;
  orderId?: string;
  status:
    | "requested"
    | "confirmed"
    | "waitlisted"
    | "table_assigned"
    | "table_ready"
    | "guest_seated"
    | "closed";
  area: "dining_room" | "patio" | "takeout" | "locker_room";
  partySize: number;
  accessibilityNote: string;
  table?: string;
  memberContext?: string;
  foodReady: boolean;
}

export interface MemberAccount {
  id: string;
  memberName: string;
  requirementCents: number;
  completedCents: number;
  pendingCents: number;
  periodEnd: string;
  adjustments: { amountCents: number; note: string; at: string }[];
  excludeTaxes: boolean;
  excludeTips: boolean;
  excludeFees: boolean;
  excludeGolfEssentials: boolean;
  excludePromotional: boolean;
  excludeTournament: boolean;
}

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  role: Role | "all";
  message: string;
  createdAt: string;
  read: boolean;
  orderId?: string;
}

export interface Settings {
  orderingOpen: boolean;
  alcoholOrderingOpen: boolean;
  kitchenOpen: boolean;
  weatherClosed: boolean;
  tournamentMode: boolean;
  alcoholAgeThreshold: number;
  jurisdiction: string;
  demoPaymentNotice: string;
  payAtCounterEnabled: boolean;
  lockerRoomDeliveryEnabled: boolean;
  serviceDelayMinutes: number;
  orderingHoursStart: string;
  orderingHoursEnd: string;
  minimumSpendExclusions: string[];
}

export interface CartState {
  lines: CartLine[];
}

export interface AppData {
  schemaVersion: number;
  activeRole: Role;
  courses: Course[];
  products: Product[];
  sessions: GolfSession[];
  inventory: InventoryRecord[];
  inventoryAdjustments: InventoryAdjustment[];
  orders: Order[];
  fulfilments: Fulfilment[];
  staff: StaffProfile[];
  kitchenTickets: KitchenTicket[];
  restaurantRequests: RestaurantRequest[];
  members: MemberAccount[];
  notifications: NotificationRecord[];
  settings: Settings;
  cart: CartState;
  favouriteIds: string[];
  previousOrderIds: string[];
  poorConnection: boolean;
  offline: boolean;
}

export interface PricedOrder {
  subtotalCents: number;
  taxCents: number;
  serviceFeeCents: number;
  deliveryFeeCents: number;
  tipCents: number;
  discountCents: number;
  totalCents: number;
  minimumSpendQualifyingCents: number;
}

export interface OrderDraft {
  courseId: string;
  role: Role;
  lines: CartLine[];
  deliveryMode: "course_delivery" | "clubhouse_pickup" | "restaurant_table";
  paymentMode: "card" | "member_account" | "tournament" | "pay_at_counter";
  locationNote: string;
}

export interface OrderSummary {
  status: OrderStatus;
  subtotalCents: number;
  alcoholRequiresPhysicalId: boolean;
  kitchenRequired: boolean;
  inventoryReservations: { itemId: string; quantity: number }[];
  warnings: string[];
}

export type MenuItem = Product;
