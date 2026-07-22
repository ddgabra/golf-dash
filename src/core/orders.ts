import type { MenuItem, OrderDraft, OrderSummary, Role } from "./models.js";
export { createOrder, priceOrder, transitionFulfilment } from "./data.js";

const staffRoles: Role[] = [
  "beverage_cart_staff",
  "runner",
  "kitchen_employee",
  "restaurant_server",
  "course_manager",
  "platform_admin",
];

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

export function summarizeOrder(
  draft: OrderDraft,
  menuItems: MenuItem[],
): OrderSummary {
  const warnings: string[] = [];
  let subtotalCents = 0;
  let alcoholRequiresPhysicalId = false;
  let kitchenRequired = false;
  const inventoryReservations: OrderSummary["inventoryReservations"] = [];
  for (const line of draft.lines) {
    const item = menuItems.find(
      (candidate) =>
        candidate.id === line.itemId && candidate.courseId === draft.courseId,
    );
    if (!item) {
      warnings.push(`Item ${line.itemId} is not available for this course.`);
      continue;
    }
    if (!item.available)
      warnings.push(`${item.name} is currently unavailable.`);
    if (line.quantity <= 0)
      warnings.push(`${item.name} must have a positive quantity.`);
    if ("stockOnCart" in item && line.quantity > Number(item.stockOnCart))
      warnings.push(`${item.name} has insufficient cart stock.`);
    subtotalCents += item.priceCents * Math.max(line.quantity, 0);
    alcoholRequiresPhysicalId ||=
      item.alcohol ||
      Boolean("requiresIdCheck" in item && item.requiresIdCheck);
    kitchenRequired ||=
      item.prepMinutes > 5 ||
      Boolean("requiresKitchen" in item && item.requiresKitchen);
    inventoryReservations.push({
      itemId: item.id,
      quantity: Math.max(line.quantity, 0),
    });
  }
  if (draft.paymentMode === "member_account" && draft.role !== "club_member")
    warnings.push("Only club members may charge orders to a member account.");
  if (draft.lines.length === 0)
    warnings.push("Add at least one item before checkout.");
  return {
    status: warnings.length ? "draft" : "submitted",
    subtotalCents,
    alcoholRequiresPhysicalId,
    kitchenRequired,
    inventoryReservations,
    warnings,
  };
}
