"use client";

import { useAppData } from "@/lib/hooks/useAppData";
import { computeAnalytics } from "@/lib/core/analytics";
import { formatMoney, formatPercent } from "@/lib/utils";

export function AnalyticsPage() {
  const { data } = useAppData();
  if (!data) return null;

  const a = computeAnalytics(data);

  const metrics = [
    ["Gross sales", formatMoney(a.grossSalesCents)],
    ["Net sales", formatMoney(a.netSalesCents)],
    ["Orders", String(a.orderCount)],
    ["Average order value", formatMoney(a.averageOrderValueCents)],
    ["Avg delivery time", `${a.avgDeliveryTimeMin} min`],
    ["Avg acceptance time", `${a.avgAcceptanceTimeMin} min`],
    ["Avg kitchen prep", `${a.avgKitchenPrepMin} min`],
    ["Cancellation rate", formatPercent(a.cancellationRate)],
    ["Refund rate", formatPercent(a.refundRate)],
    ["Substitution rate", formatPercent(a.substitutionRate)],
    ["Stockouts", String(a.stockouts)],
    ["Inventory variance", String(a.inventoryVariance)],
    ["Total tips", formatMoney(a.totalTipsCents)],
    ["Ratings", `${a.ratings} / 5`],
    ["Min-spend contribution", formatMoney(a.minimumSpendContributionCents)],
    ["Member sales", formatMoney(a.memberVsGuest.member)],
    ["Guest sales", formatMoney(a.memberVsGuest.guest)],
    ["Alcohol sales", formatMoney(a.alcoholVsNonAlcohol.alcohol)],
    ["Non-alcohol sales", formatMoney(a.alcoholVsNonAlcohol.nonAlcohol)],
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="panel text-center">
            <p className="stat-label">{label}</p>
            <p className="stat-value text-xl">{value}</p>
          </div>
        ))}
      </div>

      {Object.keys(a.salesByCategory).length > 0 && (
        <article className="panel mt-6">
          <h2 className="text-xl font-bold">Sales by category</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {Object.entries(a.salesByCategory).map(([cat, cents]) => (
              <li key={cat} className="flex justify-between">
                <span>{cat}</span>
                <span className="font-bold">{formatMoney(cents)}</span>
              </li>
            ))}
          </ul>
        </article>
      )}

      <article className="panel mt-6">
        <h2 className="text-xl font-bold">Staff workload</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {Object.entries(a.staffWorkload).map(([name, load]) => (
            <li key={name} className="flex justify-between">
              <span>{name}</span>
              <span className="font-bold">{load} tasks</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
