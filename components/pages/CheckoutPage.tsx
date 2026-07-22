"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/hooks/useAppData";
import { createOrderFromCart, priceOrder } from "@/lib/core/orders";
import { DEMO_PAYMENT_METHODS } from "@/lib/core/payments";
import { formatMoney } from "@/lib/utils";
import type { DeliveryTiming, FulfilmentType } from "@/lib/core/models";
import { EmptyState } from "@/components/ui";

export function CheckoutPage() {
  const { data, save } = useAppData();
  const [alcoholConfirmed, setAlcoholConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>(DEMO_PAYMENT_METHODS[0]!);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!data) return null;

  const lines = data.cart.lines;
  const priced = priceOrder(lines, data.products, data.activeRole, data.settings);
  const hasAlcohol = lines.some(
    (l) => data.products.find((p) => p.id === l.itemId)?.alcohol,
  );
  const member = data.members[0];
  const remainingSpend = member ? member.requirementCents - member.completedCents : 0;

  const grouped = lines.reduce(
    (acc, line) => {
      const key = line.fulfilmentType;
      acc[key] = [...(acc[key] ?? []), line];
      return acc;
    },
    {} as Record<string, typeof lines>,
  );

  const updateLine = async (lineId: string, updates: Partial<(typeof lines)[0]>) => {
    const cart = {
      lines: lines.map((l) => (l.id === lineId ? { ...l, ...updates } : l)),
    };
    await save({ ...data, cart });
  };

  const removeLine = async (lineId: string) => {
    await save({
      ...data,
      cart: { lines: lines.filter((l) => l.id !== lineId) },
    });
  };

  const checkout = async () => {
    if (processing) return;
    setProcessing(true);
    setError(null);
    const snapshot = { ...data };
    const result = createOrderFromCart(
      snapshot,
      data.activeRole,
      lines,
      paymentMethod,
      alcoholConfirmed,
    );
    if (!result.ok) {
      setError(result.error ?? "Checkout failed");
      setProcessing(false);
      return;
    }
    await save(snapshot);
    setProcessing(false);
    window.location.href = "/orders";
  };

  if (lines.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add products from the menu to begin checkout."
        action={
          <Link href="/menu" className="btn-primary">
            Browse menu
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <article className="panel">
        <h2 className="text-xl font-bold">Cart items</h2>
        <div className="mt-4 space-y-4">
          {Object.entries(grouped).map(([type, groupLines]) => (
            <div key={type}>
              <h3 className="text-sm font-bold uppercase text-fairway-600">
                {type.replaceAll("_", " ")}
              </h3>
              {groupLines.map((line) => {
                const product = data.products.find((p) => p.id === line.itemId)!;
                return (
                  <div key={line.id} className="border-t border-fairway-100 py-3">
                    <div className="flex justify-between font-semibold">
                      <span>
                        {product.name} × {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="text-sm text-red-600"
                        onClick={() => void removeLine(line.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <label className="text-xs font-bold">
                        Fulfilment
                        <select
                          className="input-field mt-1"
                          value={line.fulfilmentType}
                          onChange={(e) =>
                            void updateLine(line.id, {
                              fulfilmentType: e.target.value as FulfilmentType,
                            })
                          }
                        >
                          {product.fulfilmentSources.map((f) => (
                            <option key={f} value={f}>
                              {f.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs font-bold">
                        Delivery timing
                        <select
                          className="input-field mt-1"
                          value={line.deliveryTiming}
                          onChange={(e) =>
                            void updateLine(line.id, {
                              deliveryTiming: e.target.value as DeliveryTiming,
                            })
                          }
                        >
                          <option value="immediate">Immediate delivery</option>
                          <option value="at_hole">At selected hole</option>
                          <option value="delayed">After delay</option>
                          <option value="meet_at_turn">Meet at the turn</option>
                          <option value="future_meal">Future meal prep</option>
                        </select>
                      </label>
                      <label className="text-xs font-bold sm:col-span-2">
                        Notes
                        <input
                          className="input-field mt-1"
                          value={line.notes ?? ""}
                          onChange={(e) =>
                            void updateLine(line.id, { notes: e.target.value })
                          }
                          placeholder="Special instructions"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <h2 className="text-xl font-bold">Checkout summary</h2>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <dt>Subtotal</dt>
          <dd className="text-right font-semibold">
            {formatMoney(priced.subtotalCents)}
          </dd>
          <dt>Taxes</dt>
          <dd className="text-right font-semibold">{formatMoney(priced.taxCents)}</dd>
          <dt>Service fee</dt>
          <dd className="text-right font-semibold">
            {formatMoney(priced.serviceFeeCents)}
          </dd>
          <dt>Delivery fee</dt>
          <dd className="text-right font-semibold">
            {formatMoney(priced.deliveryFeeCents)}
          </dd>
          <dt>Tip (15%)</dt>
          <dd className="text-right font-semibold">{formatMoney(priced.tipCents)}</dd>
          <dt>Member discount</dt>
          <dd className="text-right font-semibold text-green-700">
            -{formatMoney(priced.discountCents)}
          </dd>
          <dt className="border-t border-fairway-200 pt-2 text-lg font-bold">Total</dt>
          <dd className="border-t border-fairway-200 pt-2 text-right text-lg font-black">
            {formatMoney(priced.totalCents)}
          </dd>
        </dl>

        {data.activeRole === "club_member" && member && (
          <div className="mt-4 rounded-xl bg-fairway-50 p-4 text-sm">
            <p className="font-bold">Minimum spend qualification</p>
            <p>
              This order qualifies for {formatMoney(priced.minimumSpendQualifyingCents)}{" "}
              toward minimum spend.
            </p>
            <p className="mt-1 text-fairway-600">
              Remaining this period: {formatMoney(Math.max(0, remainingSpend))}
            </p>
          </div>
        )}

        {hasAlcohol && (
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={alcoholConfirmed}
              onChange={(e) => setAlcoholConfirmed(e.target.checked)}
            />
            <span>
              I confirm alcohol eligibility under Manitoba demo settings (18+) and
              understand staff may refuse service.
            </span>
          </label>
        )}

        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          {data.settings.demoPaymentNotice}
        </p>

        <label className="mt-4 grid gap-1 text-sm font-bold">
          Simulated payment method
          <select
            className="input-field"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {DEMO_PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p role="alert" className="mt-4 text-sm font-bold text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          className="btn-primary mt-6 w-full"
          onClick={() => void checkout()}
          disabled={
            processing ||
            !data.settings.orderingOpen ||
            (hasAlcohol && !data.settings.alcoholOrderingOpen) ||
            (hasAlcohol && !alcoholConfirmed && data.activeRole !== "club_member")
          }
        >
          {processing ? "Processing…" : "Place simulated order"}
        </button>
      </article>
    </div>
  );
}
