"use client";

import Link from "next/link";
import { useAppData } from "@/lib/hooks/useAppData";
import { generateId } from "@/lib/core/store";
import { estimateFinishTime, estimatePace, formatMoney } from "@/lib/utils";
import type { GolfSession } from "@/lib/core/models";

export function RoundPage() {
  const { data, save } = useAppData();
  if (!data) return null;

  const course = data.courses[0]!;
  const session = data.sessions.find((s) => s.active) ?? data.sessions[0]!;
  const meetingPoint = course.meetingPoints.find(
    (m) => m.id === session.selectedMeetingPointId,
  );
  const activeOrder = data.orders[data.orders.length - 1];
  const progress = Math.round((session.currentHole / 18) * 100);

  const updateSession = async (updates: Partial<GolfSession>) => {
    const sessions = data.sessions.map((s) =>
      s.id === session.id ? { ...s, ...updates } : s,
    );
    await save({ ...data, sessions });
  };

  const startRound = async () => {
    const newSession: GolfSession = {
      id: generateId("session"),
      courseId: course.id,
      playerName: data.sessions[0]?.playerName ?? "Demo Golfer",
      teeTime: "09:20",
      groupSize: 4,
      cartNumber: "Cart 14",
      startingHole: 1,
      currentHole: 1,
      joinedGroupId: "seeded-smith-four",
      simulatedLocationEnabled: true,
      selectedMeetingPointId: "mp-1",
      active: true,
    };
    const sessions = data.sessions.map((s) => ({ ...s, active: false }));
    sessions.unshift(newSession);
    await save({ ...data, sessions });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <article className="panel">
        <h2 className="text-2xl font-bold text-fairway-900">{course.name}</h2>
        <p className="mt-2 text-fairway-600">
          18 holes with tee, fairway, and green coordinates. Clubhouse, halfway house,
          restaurant, patio, two beverage carts, delivery zones, alcohol restricted
          areas, and approved meeting points.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-fairway-50 p-3 text-center">
            <p className="stat-label">Current hole</p>
            <p className="stat-value">{session.currentHole}</p>
          </div>
          <div className="rounded-xl bg-fairway-50 p-3 text-center">
            <p className="stat-label">Progress</p>
            <p className="stat-value">{progress}%</p>
          </div>
          <div className="rounded-xl bg-fairway-50 p-3 text-center">
            <p className="stat-label">Est. finish</p>
            <p className="stat-value text-lg">
              {estimateFinishTime(session.currentHole)}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-fairway-600">Meeting point</dt>
            <dd className="font-semibold">{meetingPoint?.label}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fairway-600">Pace</dt>
            <dd className="font-semibold">{estimatePace(session.currentHole)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fairway-600">Golf cart</dt>
            <dd className="font-semibold">{session.cartNumber}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fairway-600">Tee time</dt>
            <dd className="font-semibold">{session.teeTime}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fairway-600">Group size</dt>
            <dd className="font-semibold">{session.groupSize}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fairway-600">Starting hole</dt>
            <dd className="font-semibold">{session.startingHole}</dd>
          </div>
          {session.joinedGroupId && (
            <div className="flex justify-between">
              <dt className="text-fairway-600">Joined group</dt>
              <dd className="font-semibold">{session.joinedGroupId}</dd>
            </div>
          )}
        </dl>

        {activeOrder && (
          <div className="mt-4 rounded-xl border border-fairway-200 bg-fairway-50 p-4">
            <p className="stat-label">Current order</p>
            <p className="font-bold text-fairway-900">
              {activeOrder.id} — {activeOrder.status} —{" "}
              {formatMoney(activeOrder.totalCents)}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void startRound()}
          >
            Start demo round
          </button>
          <Link href="/menu" className="btn-primary">
            Order food or drinks
          </Link>
        </div>

        <details className="mt-6">
          <summary className="cursor-pointer font-bold text-fairway-800">
            Round setup options
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold">
              Tee time
              <input
                type="time"
                className="input-field"
                value={session.teeTime}
                onChange={(e) => void updateSession({ teeTime: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Group size
              <select
                className="input-field"
                value={session.groupSize}
                onChange={(e) =>
                  void updateSession({ groupSize: Number(e.target.value) })
                }
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Cart number
              <input
                className="input-field"
                value={session.cartNumber}
                onChange={(e) => void updateSession({ cartNumber: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Starting hole
              <select
                className="input-field"
                value={session.startingHole}
                onChange={(e) =>
                  void updateSession({ startingHole: Number(e.target.value) })
                }
              >
                {Array.from({ length: 18 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    Hole {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Current hole
              <select
                className="input-field"
                value={session.currentHole}
                onChange={(e) => {
                  const hole = Number(e.target.value);
                  void updateSession({ currentHole: hole });
                }}
              >
                {Array.from({ length: 18 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    Hole {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Meeting point
              <select
                className="input-field"
                value={session.selectedMeetingPointId}
                onChange={(e) =>
                  void updateSession({ selectedMeetingPointId: e.target.value })
                }
              >
                {course.meetingPoints.map((mp) => (
                  <option key={mp.id} value={mp.id}>
                    {mp.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
              <input
                type="checkbox"
                checked={session.simulatedLocationEnabled}
                onChange={(e) =>
                  void updateSession({
                    simulatedLocationEnabled: e.target.checked,
                  })
                }
              />
              Enable simulated location
            </label>
          </div>
        </details>
      </article>

      <article className="panel relative min-h-80 overflow-hidden bg-gradient-to-br from-fairway-300 to-fairway-700">
        <h2 className="sr-only">Course map</h2>
        {course.holes.map((h) => (
          <span
            key={h.number}
            className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-black shadow ${
              h.number === session.currentHole
                ? "bg-gold text-fairway-950 ring-4 ring-white"
                : "bg-white text-fairway-800"
            }`}
            style={{ left: `${h.green.x}%`, top: `${h.green.y}%` }}
            title={`Hole ${h.number}, par ${h.par}`}
          >
            {h.number}
          </span>
        ))}
        {course.facilities.map((f) => (
          <span
            key={f.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg bg-fairway-950/80 px-2 py-1 text-[10px] font-bold text-white"
            style={{ left: `${f.coordinate.x}%`, top: `${f.coordinate.y}%` }}
          >
            {f.name}
          </span>
        ))}
      </article>
    </div>
  );
}
