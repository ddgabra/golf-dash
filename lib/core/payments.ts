import type { AppData, MemberAccount, PaymentStatus } from "./models";
import { generateId, nowIso } from "./store";
import { applyRefund, reverseMinimumSpend } from "./pricing";

export type DemoPaymentMethod =
  | "Demo Visa ending in 4242"
  | "Demo Mastercard ending in 4444"
  | "Member club account"
  | "Tournament account"
  | "Pay at counter"
  | "fail payment simulation";

export const DEMO_PAYMENT_METHODS: DemoPaymentMethod[] = [
  "Demo Visa ending in 4242",
  "Demo Mastercard ending in 4444",
  "Member club account",
  "Tournament account",
  "Pay at counter",
  "fail payment simulation",
];

export function processPayment(
  data: AppData,
  method: string,
  totalCents: number,
  memberId?: string,
  simulateFailure = false,
): { status: PaymentStatus; message: string } {
  if (simulateFailure || method.includes("fail")) {
    return { status: "failed", message: "Simulated payment failure" };
  }

  if (method === "Member club account") {
    const member = data.members.find((m) => m.id === memberId);
    if (!member) {
      return { status: "failed", message: "Member account not found" };
    }
    const limit = 50000;
    if (member.completedCents + totalCents > limit) {
      return {
        status: "failed",
        message: "Over-limit personal payment on member account",
      };
    }
    member.pendingCents += totalCents;
    return { status: "paid", message: "Charged to member club account" };
  }

  if (method === "Tournament account") {
    if (!data.settings.tournamentMode) {
      return { status: "failed", message: "Tournament account not enabled" };
    }
    return { status: "paid", message: "Charged to tournament allowance" };
  }

  if (method === "Pay at counter") {
    if (!data.settings.payAtCounterEnabled) {
      return { status: "failed", message: "Pay at counter not enabled" };
    }
    return { status: "pending", message: "Pay at counter when you arrive" };
  }

  return { status: "paid", message: "Demo card payment authorized" };
}

export function issueRefund(
  data: AppData,
  orderId: string,
  refundCents: number,
  memberId?: string,
  minimumSpendCredit?: number,
): PaymentStatus {
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) return "paid";

  const result = applyRefund(order.totalCents, refundCents);
  order.paymentStatus = result.status;
  order.totalCents = result.remainingCents;

  if (memberId && minimumSpendCredit) {
    reverseMinimumSpend(data, memberId, minimumSpendCredit, `Refund on ${orderId}`);
  }

  data.notifications.push({
    id: generateId("note"),
    type: "refund_issued",
    role: order.customerRole,
    message: `Refund of $${(refundCents / 100).toFixed(2)} issued for ${orderId}`,
    createdAt: nowIso(),
    read: false,
    orderId,
  });

  return result.status;
}

export function settleMemberPending(member: MemberAccount, amountCents: number): void {
  member.pendingCents = Math.max(0, member.pendingCents - amountCents);
  member.completedCents += amountCents;
  member.adjustments.push({
    amountCents,
    note: "Pending purchase settled",
    at: nowIso(),
  });
}
