import { createSeedData, SCHEMA_VERSION, STORAGE_KEY, SYNC_CHANNEL } from "./seed";
import type { AppData } from "./models";

function emitSync(): void {
  if (typeof BroadcastChannel !== "undefined") {
    const bc = new BroadcastChannel(SYNC_CHANNEL);
    bc.postMessage({ type: "changed", at: Date.now() });
    bc.close();
  }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(`${STORAGE_KEY}.ping`, String(Date.now()));
  }
}

function isValidAppData(parsed: Partial<AppData>): parsed is AppData {
  return (
    parsed.schemaVersion === SCHEMA_VERSION &&
    Array.isArray(parsed.products) &&
    Array.isArray(parsed.courses) &&
    Array.isArray(parsed.orders) &&
    typeof parsed.activeRole === "string" &&
    parsed.settings !== undefined
  );
}

export const store = {
  async load(): Promise<AppData> {
    if (typeof localStorage === "undefined") return createSeedData();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedData();
      await this.save(seed);
      return seed;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<AppData>;
      if (!isValidAppData(parsed)) {
        const seed = createSeedData();
        await this.save(seed);
        return seed;
      }
      if (!parsed.cart) parsed.cart = { lines: [] };
      if (!parsed.favouriteIds) parsed.favouriteIds = [];
      if (!parsed.previousOrderIds) parsed.previousOrderIds = [];
      if (!parsed.inventoryAdjustments) parsed.inventoryAdjustments = [];
      return parsed;
    } catch {
      const seed = createSeedData();
      await this.save(seed);
      return seed;
    }
  },

  async save(data: AppData): Promise<void> {
    data.schemaVersion = SCHEMA_VERSION;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    emitSync();
  },

  async reset(): Promise<AppData> {
    const seed = createSeedData();
    await this.save(seed);
    return seed;
  },
};

export function subscribeSync(callback: () => void): () => void {
  let bc: BroadcastChannel | undefined;
  if (typeof BroadcastChannel !== "undefined") {
    bc = new BroadcastChannel(SYNC_CHANNEL);
    bc.onmessage = () => callback();
  }
  const handler = (e: StorageEvent): void => {
    if (e.key?.startsWith(STORAGE_KEY)) callback();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handler);
  }
  return () => {
    bc?.close();
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handler);
    }
  };
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
