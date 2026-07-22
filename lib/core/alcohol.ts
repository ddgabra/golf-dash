import type { AppData, CartLine, GolfSession, Product, Settings } from "./models";

export interface AlcoholCheckResult {
  allowed: boolean;
  reasons: string[];
}

export function checkAlcoholOrder(
  data: AppData,
  lines: CartLine[],
  session: GolfSession | undefined,
  alcoholConfirmed: boolean,
  role: string,
  identityVerified?: boolean,
): AlcoholCheckResult {
  const reasons: string[] = [];
  const settings = data.settings;
  const products = data.products;
  const hasAlcohol = lines.some((l) => {
    const p = products.find((x) => x.id === l.itemId);
    return p?.alcohol;
  });

  if (!hasAlcohol) return { allowed: true, reasons: [] };

  if (!settings.alcoholOrderingOpen) {
    reasons.push("Alcohol ordering is currently paused by course management");
  }

  if (!settings.orderingOpen || settings.weatherClosed) {
    reasons.push("Ordering is closed");
  }

  const now = new Date();
  const hour = now.getHours();
  const start = parseInt(settings.orderingHoursStart.split(":")[0] ?? "7", 10);
  const end = parseInt(settings.orderingHoursEnd.split(":")[0] ?? "21", 10);
  if (hour < start || hour >= end) {
    reasons.push(
      `Alcohol only available ${settings.orderingHoursStart}–${settings.orderingHoursEnd}`,
    );
  }

  if (session) {
    const course = data.courses[0];
    const zone = course?.deliveryZones.find((z) =>
      z.holeNumbers.includes(session.currentHole),
    );
    if (zone && !zone.alcoholAllowed) {
      reasons.push(`Alcohol not permitted in ${zone.name}`);
    }
  }

  if (!alcoholConfirmed && !identityVerified) {
    reasons.push(
      `Customer must confirm eligibility (age ${settings.alcoholAgeThreshold}+)`,
    );
  }

  if (role === "guest_golfer" && !alcoholConfirmed) {
    reasons.push("Guest must confirm age eligibility");
  }

  return { allowed: reasons.length === 0, reasons };
}

export function staffCanServeAlcohol(
  staffAlcoholEligible: boolean,
  settings: Settings,
): boolean {
  return staffAlcoholEligible && settings.alcoholOrderingOpen;
}

export function refuseAlcoholItem(
  product: Product,
  reason: string,
): { refused: boolean; reason: string } {
  if (!product.alcohol) {
    return { refused: false, reason: "Item is not alcohol" };
  }
  return {
    refused: true,
    reason: reason || "ID not verified / under age threshold",
  };
}

export const REFUSAL_REASONS = [
  "ID not presented",
  "Appears under age threshold",
  "Intoxication concern",
  "Restricted delivery zone",
  "Course alcohol limit reached",
  "Staff not alcohol eligible",
];

export function isInOrderingHours(settings: Settings): boolean {
  const hour = new Date().getHours();
  const start = parseInt(settings.orderingHoursStart.split(":")[0] ?? "7", 10);
  const end = parseInt(settings.orderingHoursEnd.split(":")[0] ?? "21", 10);
  return hour >= start && hour < end;
}
