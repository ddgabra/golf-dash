export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function estimateFinishTime(currentHole: number): string {
  const hoursLeft = Math.max(1, Math.ceil((18 - currentHole) / 3));
  const finishHour = 9 + hoursLeft;
  return `${String(finishHour).padStart(2, "0")}:30`;
}

export function estimatePace(currentHole: number): string {
  if (currentHole <= 6) return "On target";
  if (currentHole <= 12) return "Slightly ahead";
  return "Steady pace";
}
