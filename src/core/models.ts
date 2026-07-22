export type Role =
  | "guest_golfer"
  | "registered_golfer"
  | "club_member"
  | "beverage_cart_staff"
  | "runner"
  | "kitchen_employee"
  | "restaurant_server"
  | "inventory_manager"
  | "course_manager"
  | "course_owner"
  | "platform_admin";

export type OrderStatus =
  | "draft"
  | "submitted"
  | "accepted"
  | "preparing"
  | "en_route"
  | "delivered"
  | "cancelled";

export interface CourseScopedEntity {
  id: string;
  courseId: string;
}

export interface MenuItem extends CourseScopedEntity {
  name: string;
  category: "food" | "drink" | "alcohol" | "merchandise";
  priceCents: number;
  available: boolean;
  requiresKitchen: boolean;
  requiresIdCheck: boolean;
  stockOnCart: number;
}

export interface CartLine {
  itemId: string;
  quantity: number;
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
