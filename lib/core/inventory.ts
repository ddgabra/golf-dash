import type { AppData, InventoryAdjustment, InventoryRecord } from "./models";
import { generateId, nowIso } from "./store";

export function findInventory(
  data: AppData,
  locationId: string,
  productId: string,
): InventoryRecord | undefined {
  return data.inventory.find(
    (i) => i.locationId === locationId && i.productId === productId,
  );
}

export function getLocationForFulfilment(
  fulfilmentType: string,
  cartId = "cart-1",
): string {
  if (fulfilmentType === "cart_delivery") return cartId;
  if (fulfilmentType === "scheduled_meal") return "restaurant";
  if (fulfilmentType.includes("patio")) return "patio";
  return "clubhouse";
}

function recordAdjustment(
  data: AppData,
  record: InventoryRecord,
  type: InventoryAdjustment["type"],
  quantity: number,
  note: string,
): void {
  data.inventoryAdjustments.push({
    id: generateId("inv-adj"),
    recordId: record.id,
    type,
    quantity,
    note,
    createdAt: nowIso(),
  });
  record.history.push(`${type}: ${note} (${quantity})`);
}

export function reserveInventory(
  data: AppData,
  locationId: string,
  productId: string,
  quantity: number,
  orderId: string,
): boolean {
  const record = findInventory(data, locationId, productId);
  if (!record || record.available < quantity) return false;
  record.available -= quantity;
  record.reserved += quantity;
  recordAdjustment(data, record, "reservation", quantity, `Reserved for ${orderId}`);
  return true;
}

export function releaseReservation(
  data: AppData,
  locationId: string,
  productId: string,
  quantity: number,
  reason: string,
): void {
  const record = findInventory(data, locationId, productId);
  if (!record) return;
  const releaseQty = Math.min(quantity, record.reserved);
  record.reserved -= releaseQty;
  record.available += releaseQty;
  recordAdjustment(data, record, "release", releaseQty, reason);
}

export function deductOnDelivery(
  data: AppData,
  locationId: string,
  productId: string,
  quantity: number,
  orderId: string,
): void {
  const record = findInventory(data, locationId, productId);
  if (!record) return;
  const deduct = Math.min(quantity, record.reserved);
  record.reserved -= deduct;
  recordAdjustment(data, record, "delivery", deduct, `Delivered for ${orderId}`);
}

export function transferInventory(
  data: AppData,
  fromLocationId: string,
  toLocationId: string,
  productId: string,
  quantity: number,
): boolean {
  const from = findInventory(data, fromLocationId, productId);
  const to = findInventory(data, toLocationId, productId);
  if (!from || !to || from.available < quantity) return false;
  from.available -= quantity;
  to.available += quantity;
  recordAdjustment(data, from, "transfer", -quantity, `Transfer to ${toLocationId}`);
  recordAdjustment(data, to, "transfer", quantity, `Transfer from ${fromLocationId}`);
  return true;
}

export function adjustInventory(
  data: AppData,
  locationId: string,
  productId: string,
  quantity: number,
  type: "adjustment" | "waste" | "damage" | "spoilage" | "complimentary",
  note: string,
): void {
  const record = findInventory(data, locationId, productId);
  if (!record) return;
  if (type === "complimentary" || type === "adjustment") {
    record.available += quantity;
  } else {
    record.available = Math.max(0, record.available - quantity);
  }
  recordAdjustment(data, record, type, quantity, note);
}

export function confirmShiftInventory(data: AppData, locationId: string): void {
  data.inventory
    .filter((i) => i.locationId === locationId)
    .forEach((record) => {
      recordAdjustment(
        data,
        record,
        "shift_start",
        record.available,
        "Shift start count",
      );
    });
}

export function reconcileShiftInventory(
  data: AppData,
  locationId: string,
  counts: Record<string, number>,
): void {
  for (const [productId, count] of Object.entries(counts)) {
    const record = findInventory(data, locationId, productId);
    if (!record) continue;
    const variance = count - (record.available + record.reserved);
    record.available = count - record.reserved;
    recordAdjustment(
      data,
      record,
      "shift_end",
      variance,
      `Shift end reconciliation variance ${variance}`,
    );
  }
}

export function getStockoutCount(data: AppData): number {
  return data.inventory.filter((i) => i.available <= 0).length;
}

export function getInventoryVariance(data: AppData): number {
  return data.inventoryAdjustments
    .filter((a) => a.type === "shift_end")
    .reduce((sum, a) => sum + Math.abs(a.quantity), 0);
}
