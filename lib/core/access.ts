import type { MenuItem, OrderDraft, OrderSummary, Role } from "./models";

const staffRoles: Role[] = [
  "beverage_cart_staff",
  "runner",
  "kitchen_employee",
  "restaurant_server",
  "course_manager",
  "platform_admin",
];

const golferRoles: Role[] = ["guest_golfer", "registered_golfer", "club_member"];

export function canAccessCourse(
  userCourseId: string,
  entityCourseId: string,
  role: Role,
): boolean {
  return role === "platform_admin" || userCourseId === entityCourseId;
}

export function canManageOrders(role: Role): boolean {
  return staffRoles.includes(role);
}

export function isGolferRole(role: Role): boolean {
  return golferRoles.includes(role);
}

export function isStaffRole(role: Role): boolean {
  return [
    "beverage_cart_staff",
    "runner",
    "kitchen_employee",
    "restaurant_server",
  ].includes(role);
}

export function isManagerRole(role: Role): boolean {
  return ["course_manager", "platform_admin"].includes(role);
}

export const routeAccess: Record<string, Role[]> = {
  "/round": [...golferRoles, "course_manager", "platform_admin"],
  "/menu": [...golferRoles, "course_manager", "platform_admin"],
  "/checkout": [...golferRoles, "course_manager", "platform_admin"],
  "/orders": [...golferRoles, "course_manager", "platform_admin"],
  "/member": ["club_member", "course_manager", "platform_admin"],
  "/staff": ["beverage_cart_staff", "runner", "course_manager", "platform_admin"],
  "/kitchen": ["kitchen_employee", "course_manager", "platform_admin"],
  "/restaurant": ["restaurant_server", "course_manager", "platform_admin"],
  "/manager": ["course_manager", "platform_admin"],
  "/analytics": ["course_manager", "platform_admin"],
  "/demo": ["platform_admin", "course_manager"],
};

export function canAccessRoute(path: string, role: Role): boolean {
  const allowed = routeAccess[path];
  if (!allowed) return true;
  return allowed.includes(role);
}

export function getNavRoutes(role: Role): { href: string; label: string }[] {
  const all = [
    { href: "/round", label: "Round" },
    { href: "/menu", label: "Menu" },
    { href: "/checkout", label: "Checkout" },
    { href: "/orders", label: "Orders" },
    { href: "/member", label: "Member" },
    { href: "/staff", label: "Staff" },
    { href: "/kitchen", label: "Kitchen" },
    { href: "/restaurant", label: "Restaurant" },
    { href: "/manager", label: "Manager" },
    { href: "/analytics", label: "Analytics" },
    { href: "/demo", label: "Demo" },
  ];
  return all.filter((r) => canAccessRoute(r.href, role));
}

export function summarizeOrder(draft: OrderDraft, menuItems: MenuItem[]): OrderSummary {
  const warnings: string[] = [];
  let subtotalCents = 0;
  let alcoholRequiresPhysicalId = false;
  let kitchenRequired = false;
  const inventoryReservations: OrderSummary["inventoryReservations"] = [];

  for (const line of draft.lines) {
    const item = menuItems.find(
      (c) => c.id === line.itemId && c.courseId === draft.courseId,
    );
    if (!item) {
      warnings.push(`Item ${line.itemId} is not available for this course.`);
      continue;
    }
    if (!item.available) warnings.push(`${item.name} is currently unavailable.`);
    if (line.quantity <= 0)
      warnings.push(`${item.name} must have a positive quantity.`);
    subtotalCents += item.priceCents * Math.max(line.quantity, 0);
    alcoholRequiresPhysicalId ||= item.alcohol;
    kitchenRequired ||= item.prepMinutes > 5;
    inventoryReservations.push({
      itemId: item.id,
      quantity: Math.max(line.quantity, 0),
    });
  }

  if (draft.paymentMode === "member_account" && draft.role !== "club_member") {
    warnings.push("Only club members may charge orders to a member account.");
  }
  if (draft.lines.length === 0) {
    warnings.push("Add at least one item before checkout.");
  }

  return {
    status: warnings.length ? "draft" : "submitted",
    subtotalCents,
    alcoholRequiresPhysicalId,
    kitchenRequired,
    inventoryReservations,
    warnings,
  };
}
