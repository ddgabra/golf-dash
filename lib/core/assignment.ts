import type {
  AppData,
  Coordinate,
  FulfilmentType,
  GolfSession,
  StaffProfile,
} from "./models";
import { generateId, nowIso } from "./store";

export function distance(a: Coordinate, b: Coordinate): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function estimateEtaMinutes(from: Coordinate, to: Coordinate): number {
  const d = distance(from, to);
  return Math.max(3, Math.round(d / 8));
}

export function buildRoute(from: Coordinate, to: Coordinate): Coordinate[] {
  const steps = 4;
  return Array.from({ length: steps + 1 }, (_, i) => ({
    x: from.x + ((to.x - from.x) * i) / steps,
    y: from.y + ((to.y - from.y) * i) / steps,
  }));
}

export interface AssignmentResult {
  staffId: string;
  explanation: string;
  etaMinutes: number;
  routeCoordinates: Coordinate[];
}

export function findBestStaff(
  data: AppData,
  type: FulfilmentType,
  session: GolfSession | undefined,
  requiresAlcohol: boolean,
): AssignmentResult | null {
  const course = data.courses[0];
  if (!course) return null;

  const destination =
    session && course.holes.find((h) => h.number === session.currentHole)?.green
      ? course.holes.find((h) => h.number === session.currentHole)!.green
      : course.facilities.find((f) => f.id === "clubhouse")!.coordinate;

  let candidates: StaffProfile[] = [];

  if (type === "cart_delivery") {
    candidates = data.staff.filter(
      (s) =>
        s.role === "beverage_cart_staff" &&
        s.status === "available" &&
        s.shiftActive &&
        (!requiresAlcohol || s.alcoholEligible),
    );
  } else if (type === "scheduled_meal" || type === "clubhouse_dine_in") {
    candidates = data.staff.filter(
      (s) => s.role === "kitchen_employee" && s.status !== "offline",
    );
  } else {
    candidates = data.staff.filter(
      (s) => s.role === "runner" && s.status === "available",
    );
  }

  if (candidates.length === 0) {
    const fallback = data.staff.find((s) => s.status !== "offline");
    if (!fallback) return null;
    candidates = [fallback];
  }

  candidates.sort((a, b) => {
    const distA = distance(a.location, destination);
    const distB = distance(b.location, destination);
    if (a.workload !== b.workload) return a.workload - b.workload;
    return distA - distB;
  });

  const best = candidates[0]!;
  const eta = estimateEtaMinutes(best.location, destination);
  const clubhouseNeeded = ["clubhouse_pickup", "scheduled_meal"].includes(type);

  const explanation = [
    `Assigned to ${best.name}`,
    `status: ${best.status}`,
    `workload: ${best.workload}`,
    clubhouseNeeded ? "clubhouse pickup required" : "cart stock confirmed",
    requiresAlcohol ? "alcohol eligible staff" : "non-alcohol delivery",
    `ETA ${eta} min`,
  ].join("; ");

  return {
    staffId: best.id,
    explanation,
    etaMinutes: eta,
    routeCoordinates: buildRoute(best.location, destination),
  };
}

export function acceptExclusiveTask(
  data: AppData,
  fulfilmentId: string,
  staffId: string,
): { ok: boolean; error?: string } {
  const fulfilment = data.fulfilments.find((f) => f.id === fulfilmentId);
  if (!fulfilment) return { ok: false, error: "Fulfilment not found" };
  if (fulfilment.lockedBy && fulfilment.lockedBy !== staffId) {
    return { ok: false, error: "Task already accepted by another worker" };
  }
  fulfilment.lockedBy = staffId;
  fulfilment.assignedStaffId = staffId;
  fulfilment.status = "accepted";
  fulfilment.statusHistory.push({
    status: "accepted",
    at: nowIso(),
    note: `Accepted by ${staffId}`,
  });
  fulfilment.assignmentHistory.push({
    staffId,
    at: nowIso(),
    explanation: "Self-accepted exclusive task",
  });
  const staff = data.staff.find((s) => s.id === staffId);
  if (staff) staff.workload += 1;
  return { ok: true };
}

export function managerReassign(
  data: AppData,
  fulfilmentId: string,
  newStaffId: string,
  reason: string,
): boolean {
  const fulfilment = data.fulfilments.find((f) => f.id === fulfilmentId);
  if (!fulfilment) return false;
  const prev = fulfilment.assignedStaffId;
  if (prev) {
    const prevStaff = data.staff.find((s) => s.id === prev);
    if (prevStaff) prevStaff.workload = Math.max(0, prevStaff.workload - 1);
  }
  fulfilment.assignedStaffId = newStaffId;
  fulfilment.lockedBy = newStaffId;
  fulfilment.assignmentHistory.push({
    staffId: newStaffId,
    at: nowIso(),
    explanation: `Manager override: ${reason}`,
  });
  const staff = data.staff.find((s) => s.id === newStaffId);
  if (staff) staff.workload += 1;
  return true;
}

export function moveCartStaff(
  data: AppData,
  staffId: string,
  coordinate: Coordinate,
): void {
  const staff = data.staff.find((s) => s.id === staffId);
  if (!staff) return;
  staff.location = coordinate;
  const cart = data.courses[0]?.facilities.find((f) => f.id === staff.cartId);
  if (cart) cart.coordinate = coordinate;
}

export function simulateCartMovement(data: AppData, fulfilmentId: string): void {
  const fulfilment = data.fulfilments.find((f) => f.id === fulfilmentId);
  if (!fulfilment || !fulfilment.assignedStaffId) return;
  const staff = data.staff.find((s) => s.id === fulfilment.assignedStaffId);
  if (!staff || fulfilment.routeCoordinates.length < 2) return;
  const next = fulfilment.routeCoordinates[1];
  if (next) {
    staff.location = next;
    fulfilment.routeCoordinates = fulfilment.routeCoordinates.slice(1);
  }
}

export function createAssignmentId(): string {
  return generateId("assign");
}
