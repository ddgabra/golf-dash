"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/hooks/useAppData";
import { generateId } from "@/lib/core/store";
import { formatMoney } from "@/lib/utils";
import type { CartLine } from "@/lib/core/models";
import { getUnitPrice } from "@/lib/core/pricing";

export function MenuPage() {
  const { data, save } = useAppData();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showFavourites, setShowFavourites] = useState(false);

  const categories = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.products.map((p) => p.category))];
  }, [data]);

  if (!data) return null;

  const isMember = data.activeRole === "club_member";
  const filtered = data.products.filter((p) => {
    if (!p.available) return false;
    if (showFavourites && !data.favouriteIds.includes(p.id)) return false;
    if (category !== "all" && p.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.dietary.some((d) => d.includes(q)) ||
        p.allergens.some((a) => a.includes(q))
      );
    }
    return true;
  });

  const addToCart = async (productId: string) => {
    const product = data.products.find((p) => p.id === productId);
    if (!product) return;
    const line: CartLine = {
      id: generateId("line"),
      itemId: productId,
      quantity: 1,
      fulfilmentType: product.fulfilmentSources[0] ?? "clubhouse_pickup",
      deliveryTiming: "immediate",
      modifiers: product.requiredModifiers.slice(0, 1),
      addOns: [],
      substitutionPreference: "ask",
    };
    await save({
      ...data,
      cart: { lines: [...data.cart.lines, line] },
    });
  };

  const toggleFavourite = async (productId: string) => {
    const ids = data.favouriteIds.includes(productId)
      ? data.favouriteIds.filter((id) => id !== productId)
      : [...data.favouriteIds, productId];
    const products = data.products.map((p) =>
      p.id === productId ? { ...p, favourite: !p.favourite } : p,
    );
    await save({ ...data, favouriteIds: ids, products });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          className="input-field max-w-md flex-1"
          placeholder="Search 40+ products, allergies, dietary tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search catalog"
        />
        <select
          className="input-field w-auto"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={showFavourites ? "btn-primary" : "btn-secondary"}
          onClick={() => setShowFavourites(!showFavourites)}
        >
          {showFavourites ? "Showing favourites" : "Favourites"}
        </button>
        <Link href="/checkout" className="btn-primary">
          Cart ({data.cart.lines.length})
        </Link>
      </div>

      {data.previousOrderIds.length > 0 && (
        <section className="panel mb-6">
          <h2 className="font-bold text-fairway-900">Previous orders</h2>
          <p className="text-sm text-fairway-600">
            {data.previousOrderIds.slice(0, 3).join(", ")}
          </p>
        </section>
      )}

      {filtered.length === 0 ? (
        <article className="panel text-center">
          <h2 className="font-bold">No products match your filters</h2>
          <p className="mt-2 text-fairway-600">Try clearing search or filters.</p>
        </article>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <article key={p.id} className="product-card">
              <div className="flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-fairway-600 to-fairway-400 text-lg font-black uppercase tracking-widest text-white">
                {p.imageToken}
              </div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-fairway-900">
                  <Link
                    href={`/menu/${p.id}`}
                    className="hover:text-fairway-700 hover:underline"
                  >
                    {p.name}
                  </Link>
                </h3>
                <button
                  type="button"
                  className="text-xl"
                  onClick={() => void toggleFavourite(p.id)}
                  aria-label={p.favourite ? "Remove favourite" : "Add favourite"}
                >
                  {data.favouriteIds.includes(p.id) ? "★" : "☆"}
                </button>
              </div>
              <p className="text-sm text-fairway-600">{p.description}</p>
              <p className="text-xs text-fairway-500">
                {p.category} • {p.prepMinutes} min prep •{" "}
                {p.fulfilmentSources.join(", ").replaceAll("_", " ")}
              </p>
              {p.alcohol && (
                <span className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                  🍺 Alcohol — ID required
                </span>
              )}
              {p.allergens.length > 0 && (
                <p className="text-xs text-red-700">
                  Allergens: {p.allergens.join(", ")}
                </p>
              )}
              {p.dietary.length > 0 && (
                <p className="text-xs text-fairway-600">
                  Dietary: {p.dietary.join(", ")}
                </p>
              )}
              <p className="text-xs text-fairway-500">
                {p.cartAvailable ? "Cart available" : "Clubhouse only"} • Variants:{" "}
                {p.variants.join(", ")}
              </p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-black text-fairway-900">
                    {formatMoney(getUnitPrice(p, data.activeRole))}
                  </p>
                  {isMember && p.memberPriceCents < p.priceCents && (
                    <p className="text-xs text-fairway-500 line-through">
                      {formatMoney(p.priceCents)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => void addToCart(p.id)}
                  disabled={!data.settings.orderingOpen}
                >
                  Quick add
                </button>
                <Link href={`/menu/${p.id}`} className="btn-secondary text-sm">
                  Customize
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
