"use client";

import { useAppData } from "@/lib/hooks/useAppData";
import { formatMoney } from "@/lib/utils";
import { RouteGuard } from "@/components/ui";

export function MemberPage() {
  const { data } = useAppData();
  if (!data) return null;

  const member = data.members.find((m) => m.id === "member-olivia") ?? data.members[0];
  if (!member) return null;

  const remaining = Math.max(0, member.requirementCents - member.completedCents);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <article className="panel">
        <h2 className="text-xl font-bold">Club account — {member.memberName}</h2>
        <dl className="mt-4 grid gap-3">
          <div className="flex justify-between">
            <dt className="text-fairway-600">Monthly requirement</dt>
            <dd className="font-bold">{formatMoney(member.requirementCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fairway-600">Completed</dt>
            <dd className="font-bold text-green-700">
              {formatMoney(member.completedCents)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fairway-600">Pending</dt>
            <dd className="font-bold">{formatMoney(member.pendingCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fairway-600">Remaining</dt>
            <dd className="font-bold text-amber-700">{formatMoney(remaining)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fairway-600">Period ends</dt>
            <dd className="font-bold">{member.periodEnd}</dd>
          </div>
        </dl>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-fairway-100">
          <div
            className="h-full rounded-full bg-fairway-600"
            style={{
              width: `${Math.min(100, (member.completedCents / member.requirementCents) * 100)}%`,
            }}
          />
        </div>
      </article>

      <article className="panel">
        <h2 className="text-xl font-bold">Exclusions & adjustments</h2>
        <ul className="mt-4 space-y-2 text-sm text-fairway-700">
          <li>Taxes excluded: {member.excludeTaxes ? "Yes" : "No"}</li>
          <li>Tips excluded: {member.excludeTips ? "Yes" : "No"}</li>
          <li>Fees excluded: {member.excludeFees ? "Yes" : "No"}</li>
          <li>
            Golf essentials excluded: {member.excludeGolfEssentials ? "Yes" : "No"}
          </li>
        </ul>
        <h3 className="mt-6 font-bold">Recent adjustments</h3>
        {member.adjustments.length === 0 ? (
          <p className="mt-2 text-sm text-fairway-500">No adjustments yet.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {member.adjustments.slice(-5).map((a, i) => (
              <li key={i}>
                {formatMoney(a.amountCents)} — {a.note}
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}

export function MemberPageGuarded() {
  return (
    <RouteGuard path="/member">
      <MemberPage />
    </RouteGuard>
  );
}
