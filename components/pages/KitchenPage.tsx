"use client";

import { useAppData } from "@/lib/hooks/useAppData";
import {
  advanceKitchenTicket,
  contactGolferPreset,
  delayKitchenTicket,
  rejectKitchenItem,
} from "@/lib/core/operations";
import { StatusBadge } from "@/components/ui";

const COLUMNS = [
  "new",
  "accepted",
  "scheduled",
  "preparing",
  "ready",
  "delayed",
  "completed",
  "cancelled",
] as const;

export function KitchenPage() {
  const { data, save } = useAppData();
  if (!data) return null;

  const advance = async (ticketId: string) => {
    const snapshot = { ...data };
    const ticket = snapshot.kitchenTickets.find((t) => t.id === ticketId);
    if (ticket) advanceKitchenTicket(ticket);
    await save(snapshot);
  };

  const delay = async (ticketId: string) => {
    const snapshot = { ...data };
    delayKitchenTicket(snapshot, ticketId, 10);
    await save(snapshot);
  };

  const contact = async (ticketId: string) => {
    const snapshot = { ...data };
    contactGolferPreset(snapshot, ticketId, "Your order is delayed by 10 minutes");
    await save(snapshot);
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-4">
        {COLUMNS.map((col) => {
          const tickets = data.kitchenTickets.filter((t) => t.status === col);
          return (
            <section key={col} className="panel w-64 shrink-0">
              <h2 className="mb-3 font-bold capitalize">{col}</h2>
              {tickets.length === 0 ? (
                <p className="text-sm text-fairway-500">Empty</p>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="mb-3 rounded-xl border border-fairway-100 bg-fairway-50 p-3 text-sm"
                  >
                    <p className="font-bold">{t.id}</p>
                    <StatusBadge status={t.status} />
                    <p className="mt-2">Ready: {t.requestedReadyTime}</p>
                    <p>Start: {t.recommendedStartTime}</p>
                    <p>Finish est: {t.estimatedGolferFinish}</p>
                    <p>Confidence: {t.timingConfidence}</p>
                    <p>Party: {t.partySize}</p>
                    <p>Prep: {t.prepEstimateMinutes} min</p>
                    <p className="mt-1">{t.fulfilmentType.replaceAll("_", " ")}</p>
                    {t.allergyWarnings.length > 0 && (
                      <p className="font-bold text-red-700">
                        ⚠ {t.allergyWarnings.join(", ")}
                      </p>
                    )}
                    <ul className="mt-1">
                      {t.items.map((id) => {
                        const p = data.products.find((x) => x.id === id);
                        return <li key={id}>{p?.name ?? id}</li>;
                      })}
                    </ul>
                    {col !== "completed" && col !== "cancelled" && (
                      <div className="mt-2 flex flex-col gap-1">
                        <button
                          type="button"
                          className="btn-secondary text-xs"
                          onClick={() => void advance(t.id)}
                        >
                          Advance
                        </button>
                        <button
                          type="button"
                          className="btn-secondary text-xs"
                          onClick={() => void delay(t.id)}
                        >
                          Delay +10 min
                        </button>
                        <button
                          type="button"
                          className="btn-secondary text-xs"
                          onClick={() => void contact(t.id)}
                        >
                          Contact golfer
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
