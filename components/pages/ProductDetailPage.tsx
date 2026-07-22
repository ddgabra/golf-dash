"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/hooks/useAppData";
import { generateId } from "@/lib/core/store";
import { formatMoney } from "@/lib/utils";
import type { CartLine } from "@/lib/core/models";
import { getUnitPrice } from "@/lib/core/pricing";

export function ProductDetailPage({ productId }: { productId: string }) {
  const router = useRouter();
  const { data, save } = useAppData();
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState<string>("");
  const [requiredModifier, setRequiredModifier] = useState("");
  const [optionalModifiers, setOptionalModifiers] = useState<string[]>([]);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [substitutionPreference, setSubstitutionPreference] =
    useState<CartLine["substitutionPreference"]>("ask");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const product = useMemo(
    () => data?.products.find((p) => p.id === productId),
    [data, productId],
  );

  if (!data) return null;

  if (!product) {
    return (
      <article className="panel text-center">
        <h2 className="text-lg font-bold">Product not found</h2>
        <Link href="/menu" className="btn-primary mt-4 inline-flex">
          Back to menu
        </Link>
      </article>
    );
  }

  const isMember = data.activeRole === "club_member";
  const needsRequiredModifier =
    product.requiredModifiers.length > 0 && !requiredModifier;
  const canAdd =
    data.settings.orderingOpen &&
    product.available &&
    quantity >= 1 &&
    quantity <= 99 &&
    !needsRequiredModifier &&
    !adding;

  const toggleOptional = (mod: string) => {
    setOptionalModifiers((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
    );
  };

  const toggleAddOn = (addon: string) => {
    setAddOns((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon],
    );
  };

  const addToCart = async () => {
    if (!canAdd) return;
    setAdding(true);
    setError(null);
    setSuccess(false);

    const modifiers = [
      ...(requiredModifier ? [requiredModifier] : []),
      ...optionalModifiers,
    ];

    const line: CartLine = {
      id: generateId("line"),
      itemId: productId,
      quantity,
      fulfilmentType: product.fulfilmentSources[0] ?? "clubhouse_pickup",
      deliveryTiming: "immediate",
      ...(variant ? { variant } : {}),
      modifiers,
      addOns,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      substitutionPreference,
    };

    try {
      await save({
        ...data,
        cart: { lines: [...data.cart.lines, line] },
      });
      setSuccess(true);
      setTimeout(() => router.push("/menu"), 600);
    } catch {
      setError("Could not add to cart. Please try again.");
      setAdding(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/menu"
        className="mb-4 inline-flex text-sm font-semibold text-fairway-700"
      >
        ← Back to menu
      </Link>

      <article className="product-card">
        <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-fairway-600 to-fairway-400 text-2xl font-black uppercase tracking-widest text-white">
          {product.imageToken}
        </div>

        <h1 className="text-2xl font-bold text-fairway-900">{product.name}</h1>
        <p className="text-fairway-600">{product.description}</p>
        <p className="text-sm text-fairway-500">
          {product.category} • {product.prepMinutes} min prep
        </p>

        {product.alcohol && (
          <span className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
            Alcohol — ID required at delivery
          </span>
        )}

        <p className="text-2xl font-black text-fairway-900">
          {formatMoney(getUnitPrice(product, data.activeRole))}
          {isMember && product.memberPriceCents < product.priceCents && (
            <span className="ml-2 text-sm font-normal text-fairway-500 line-through">
              {formatMoney(product.priceCents)}
            </span>
          )}
        </p>

        {product.variants.length > 0 && (
          <fieldset className="mt-4">
            <legend className="text-sm font-bold">Size / variant</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <label key={v} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="variant"
                    value={v}
                    checked={variant === v}
                    onChange={() => setVariant(v)}
                  />
                  {v}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {product.requiredModifiers.length > 0 && (
          <label className="mt-4 grid gap-1 text-sm font-bold">
            Required selection *
            <select
              className="input-field"
              value={requiredModifier}
              onChange={(e) => setRequiredModifier(e.target.value)}
              aria-required
            >
              <option value="">Choose one…</option>
              {product.requiredModifiers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        )}

        {product.optionalModifiers.length > 0 && (
          <fieldset className="mt-4">
            <legend className="text-sm font-bold">Optional modifiers</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {product.optionalModifiers.map((m) => (
                <label key={m} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={optionalModifiers.includes(m)}
                    onChange={() => toggleOptional(m)}
                  />
                  {m}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {product.addOns.length > 0 && (
          <fieldset className="mt-4">
            <legend className="text-sm font-bold">Add-ons</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {product.addOns.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={addOns.includes(a)}
                    onChange={() => toggleAddOn(a)}
                  />
                  {a}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <label className="mt-4 grid gap-1 text-sm font-bold">
          Quantity
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary min-h-touch min-w-touch"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              className="input-field w-20 text-center"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.min(99, Math.max(1, Number(e.target.value) || 1)))
              }
              aria-label="Quantity"
            />
            <button
              type="button"
              className="btn-secondary min-h-touch min-w-touch"
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </label>

        <label className="mt-4 grid gap-1 text-sm font-bold">
          Special instructions
          <textarea
            className="input-field min-h-20"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Allergies, preferences, meeting location details…"
          />
        </label>

        <label className="mt-4 grid gap-1 text-sm font-bold">
          If unavailable
          <select
            className="input-field"
            value={substitutionPreference}
            onChange={(e) =>
              setSubstitutionPreference(
                e.target.value as CartLine["substitutionPreference"],
              )
            }
          >
            <option value="ask">Ask me before substituting</option>
            <option value="allow">Allow similar substitute</option>
            <option value="none">Do not substitute — remove item</option>
          </select>
        </label>

        {needsRequiredModifier && (
          <p className="mt-4 text-sm font-semibold text-amber-800" role="status">
            Select a required option before adding to your order.
          </p>
        )}

        {!data.settings.orderingOpen && (
          <p className="mt-4 text-sm font-semibold text-red-700" role="alert">
            Ordering is currently closed.
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm font-bold text-red-700" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-4 text-sm font-bold text-green-700" role="status">
            Added to cart — returning to menu…
          </p>
        )}

        <button
          type="button"
          className="btn-primary mt-6 w-full"
          onClick={() => void addToCart()}
          disabled={!canAdd}
          aria-disabled={!canAdd}
        >
          {adding ? "Adding…" : success ? "Added!" : `Add ${quantity} to order`}
        </button>
      </article>
    </div>
  );
}
