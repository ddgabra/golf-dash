"use client";

import { useAppData } from "@/lib/hooks/useAppData";
import { canAccessRoute } from "@/lib/core/access";
import Link from "next/link";

export function RouteGuard({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  const { data } = useAppData();
  if (!data) return null;

  if (!canAccessRoute(path, data.activeRole)) {
    return (
      <article className="panel max-w-xl">
        <h2 className="text-xl font-bold text-fairway-900">Demo route restricted</h2>
        <p className="mt-2 text-fairway-700">
          This non-production role cannot access this workflow. Switch role to continue
          — your data is preserved.
        </p>
        <Link href="/round" className="btn-primary mt-4 inline-flex">
          Go to Round
        </Link>
      </article>
    );
  }

  return <>{children}</>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <article className="panel text-center">
      <h2 className="text-lg font-bold text-fairway-900">{title}</h2>
      <p className="mt-2 text-fairway-600">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </article>
  );
}

export function StatusBadge({
  status,
  variant = "default",
}: {
  status: string;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const colors = {
    default: "bg-fairway-100 text-fairway-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-900",
    danger: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${colors[variant]}`}
    >
      <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-current opacity-60" />
      {status.replaceAll("_", " ")}
    </span>
  );
}
