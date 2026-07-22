"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppData, Role } from "@/lib/core/models";
import { store, subscribeSync } from "@/lib/core/store";

interface AppDataContextValue {
  data: AppData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  save: (data: AppData) => Promise<void>;
  reset: () => Promise<void>;
  setRole: (role: Role) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const loaded = await store.load();
      setData(loaded);
      setError(null);
    } catch {
      setError("Failed to load application data. Storage may be corrupted.");
      const seed = await store.reset();
      setData(seed);
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (next: AppData) => {
    await store.save(next);
    setData({ ...next });
  }, []);

  const reset = useCallback(async () => {
    const seed = await store.reset();
    setData(seed);
  }, []);

  const setRole = useCallback(
    async (role: Role) => {
      if (!data) return;
      const next = { ...data, activeRole: role };
      await save(next);
    },
    [data, save],
  );

  useEffect(() => {
    void refresh();
    const unsub = subscribeSync(() => {
      void refresh();
    });
    return unsub;
  }, [refresh]);

  useEffect(() => {
    const handleOnline = () => {
      if (data) void save({ ...data, offline: false });
    };
    const handleOffline = () => {
      if (data) void save({ ...data, offline: true });
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [data, save]);

  const value = useMemo(
    () => ({ data, loading, error, refresh, save, reset, setRole }),
    [data, loading, error, refresh, save, reset, setRole],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
