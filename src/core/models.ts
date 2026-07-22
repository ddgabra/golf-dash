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
export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "partially_refunded"
  | "refunded";
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

export interface CourseScopedEntity {
  id: string;
  courseId: string;
}

export interface Course extends CourseScopedEntity {
  name: string;
  holes: Hole[];
  facilities: Facility[];
  deliveryZones: DeliveryZone[];
  alcoholRestrictedAreas: string[];
  meetingPoints: MeetingPoint[];
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
}
export type MenuItem = Product;

export interface CartLine {
  itemId: string;
  quantity: number;
  fulfilmentType?: FulfilmentType;
  notes?: string;
  substitutionPreference?: "allow" | "ask" | "none";
}
export interface OrderDraft {
  courseId: string;
  role: Role;
  lines: CartLine[];
  deliveryMode: "course_delivery" | "clubhouse_pickup" | "restaurant_table";
  paymentMode: "card" | "member_account" | "minimum_spend";
  locationNote: string;
}
export interface OrderSummary {
  status: OrderStatus;
  subtotalCents: number;
  alcoholRequiresPhysicalId: boolean;
  kitchenRequired: boolean;
  inventoryReservations: CartLine[];
  warnings: string[];
}

export interface DemoIdentity {
  role: Role;
  name: string;
  profile: string;
  navigation: string[];
  memberAccountId?: string;
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
export interface Fulfilment {
  id: string;
  orderId: string;
  type: FulfilmentType;
  status: FulfilmentStatus;
  itemIds: string[];
  assignedStaffId?: string;
  statusHistory: string[];
  assignmentHistory: string[];
  etaMinutes: number;
  explanation: string;
}
export interface Order {
  id: string;
  courseId: string;
  customerRole: Role;
  customerName: string;
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
  statusHistory: string[];
  fulfilmentIds: string[];
  minimumSpendCreditCents: number;
}
export interface StaffProfile extends CourseScopedEntity {
  name: string;
  role: Role;
  status: "available" | "busy" | "break" | "offline";
  cartId?: string;
  location: Coordinate;
  alcoholEligible: boolean;
  workload: number;
}
export interface KitchenTicket {
  id: string;
  orderId: string;
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
  items: string[];
  allergyWarnings: string[];
  prepEstimateMinutes: number;
}
export interface RestaurantRequest {
  id: string;
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
}
export interface MemberAccount {
  id: string;
  memberName: string;
  requirementCents: number;
  completedCents: number;
  pendingCents: number;
  periodEnd: string;
  adjustments: string[];
}
export interface NotificationRecord {
  id: string;
  role: Role | "all";
  message: string;
  createdAt: string;
  read: boolean;
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
}
export interface AppData {
  schemaVersion: number;
  activeRole: Role;
  courses: Course[];
  products: Product[];
  sessions: GolfSession[];
  inventory: InventoryRecord[];
  orders: Order[];
  fulfilments: Fulfilment[];
  staff: StaffProfile[];
  kitchenTickets: KitchenTicket[];
  restaurantRequests: RestaurantRequest[];
  members: MemberAccount[];
  notifications: NotificationRecord[];
  settings: Settings;
}
