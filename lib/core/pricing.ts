import type {
  AppData,
  CartLine,
  MemberAccount,
  PricedOrder,
  Product,
  Role,
  Settings,
} from "./models";

export function getUnitPrice(product: Product, role: Role): number {
  return role === "club_member" ? product.memberPriceCents : product.priceCents;
}

export function priceOrder(
  lines: CartLine[],
  products: Product[],
  role: Role,
  settings?: Settings,
): PricedOrder {
  let subtotalCents = 0;
  let minimumSpendQualifyingCents = 0;

  for (const line of lines) {
    const product = products.find((p) => p.id === line.itemId);
    if (!product) continue;
    const lineTotal = getUnitPrice(product, role) * line.quantity;
    subtotalCents += lineTotal;
    if (!product.excludesMinimumSpend) {
      minimumSpendQualifyingCents += lineTotal;
    }
  }

  const taxCents = Math.round(subtotalCents * 0.07);
  const serviceFeeCents = Math.round(subtotalCents * 0.04);
  const deliveryFeeCents = lines.some((l) => l.fulfilmentType === "cart_delivery")
    ? 350
    : 0;
  const tipCents = Math.round(subtotalCents * 0.15);
  const discountCents = role === "club_member" ? Math.round(subtotalCents * 0.05) : 0;

  const totalCents =
    subtotalCents +
    taxCents +
    serviceFeeCents +
    deliveryFeeCents +
    tipCents -
    discountCents;

  if (settings?.tournamentMode && role !== "club_member") {
    // tournament mode doesn't change pricing in prototype
  }

  return {
    subtotalCents,
    taxCents,
    serviceFeeCents,
    deliveryFeeCents,
    tipCents,
    discountCents,
    totalCents,
    minimumSpendQualifyingCents,
  };
}

export function calculateMinimumSpendCredit(
  member: MemberAccount,
  priced: PricedOrder,
  settings: Settings,
): number {
  let credit = priced.minimumSpendQualifyingCents;
  if (member.excludeTaxes && settings.minimumSpendExclusions.includes("taxes")) {
    // taxes excluded from minimum spend base already
  }
  if (member.excludeTips) credit = Math.min(credit, priced.subtotalCents);
  if (member.excludeFees) {
    // qualifying amount is subtotal only
  }
  if (member.excludeGolfEssentials) {
    // already excluded via product flag
  }
  return credit;
}

export function applyRefund(
  orderTotalCents: number,
  refundCents: number,
): { remainingCents: number; status: "partially_refunded" | "refunded" } {
  const remaining = orderTotalCents - refundCents;
  if (remaining <= 0) return { remainingCents: 0, status: "refunded" };
  return { remainingCents: remaining, status: "partially_refunded" };
}

export function reverseMinimumSpend(
  data: AppData,
  memberId: string,
  amountCents: number,
  note: string,
): void {
  const member = data.members.find((m) => m.id === memberId);
  if (!member) return;
  member.completedCents = Math.max(0, member.completedCents - amountCents);
  member.adjustments.push({
    amountCents: -amountCents,
    note: `Refund reversal: ${note}`,
    at: new Date().toISOString(),
  });
}
