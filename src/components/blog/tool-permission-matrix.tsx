"use client";

import { useState } from "react";

type RiskKey = "read-only" | "reversible-write" | "irreversible-write";
type RoleKey = "end-user" | "support-agent" | "admin";
type Decision = "auto-allow" | "require-approval" | "block";

const RISKS: { key: RiskKey; label: string; description: string }[] = [
  {
    key: "read-only",
    label: "Read-only",
    description: "Looks up data with no side effect — e.g. checking an order status or a refund's eligibility.",
  },
  {
    key: "reversible-write",
    label: "Reversible write",
    description: "Changes state that can be undone — e.g. updating a support ticket's priority or a shipping address.",
  },
  {
    key: "irreversible-write",
    label: "Irreversible write",
    description: "Changes state that cannot be cleanly undone — e.g. issuing a refund or deleting a record.",
  },
];

const ROLES: { key: RoleKey; label: string; description: string }[] = [
  { key: "end-user", label: "End user", description: "The customer the agent is acting on behalf of." },
  { key: "support-agent", label: "Support agent", description: "A staff operator supervising the agent's session." },
  { key: "admin", label: "Admin", description: "A staff operator with elevated, account-wide permissions." },
];

const DECISIONS: Record<RiskKey, Record<RoleKey, Decision>> = {
  "read-only": {
    "end-user": "auto-allow",
    "support-agent": "auto-allow",
    admin: "auto-allow",
  },
  "reversible-write": {
    "end-user": "require-approval",
    "support-agent": "auto-allow",
    admin: "auto-allow",
  },
  "irreversible-write": {
    "end-user": "block",
    "support-agent": "require-approval",
    admin: "require-approval",
  },
};

const DECISION_COPY: Record<Decision, { label: string; note: string; className: string }> = {
  "auto-allow": {
    label: "Auto-allow",
    note: "Execute immediately and log it. No human is in the loop, so the audit trail is the only guardrail left standing.",
    className: "border-black bg-[#e9f7e2] text-black",
  },
  "require-approval": {
    label: "Require approval",
    note: "Queue the action for a human to confirm before it runs. The agent proposes; a person decides.",
    className: "border-black bg-[#f4d44d] text-black",
  },
  block: {
    label: "Block",
    note: "Refuse at the authorization layer regardless of what the request contains. This role cannot take this action through the agent, ever.",
    className: "border-black bg-black text-white",
  },
};

export function ToolPermissionMatrix() {
  const [risk, setRisk] = useState<RiskKey>("irreversible-write");
  const [role, setRole] = useState<RoleKey>("end-user");
  const decision = DECISIONS[risk][role];
  const copy = DECISION_COPY[decision];

  return (
    <div className="my-8 border border-black bg-white/70 p-5" role="group" aria-label="Tool-permission matrix builder">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/60">Tool-permission matrix builder</p>
      <p className="mt-2 text-sm leading-6 text-black/70">
        Pick a tool&apos;s risk level and the role attempting to call it. The result is a fixed decision table, not a live
        policy engine — use it to check whether your own agent&apos;s tool authorization follows risk and role, or whether
        every tool gets the same treatment regardless of what it can do.
      </p>

      <div className="mt-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-black/55">Tool risk level</p>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Choose a tool risk level">
          {RISKS.map((r) => {
            const isActive = r.key === risk;
            return (
              <button
                key={r.key}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setRisk(r.key)}
                className={
                  isActive
                    ? "border border-black bg-[#f4d44d] px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-black"
                    : "border border-black bg-transparent px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-black/70 hover:bg-black hover:text-white"
                }
              >
                {r.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm leading-6 text-black/70">{RISKS.find((r) => r.key === risk)?.description}</p>
      </div>

      <div className="mt-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-black/55">Calling role</p>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Choose a calling role">
          {ROLES.map((r) => {
            const isActive = r.key === role;
            return (
              <button
                key={r.key}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setRole(r.key)}
                className={
                  isActive
                    ? "border border-black bg-[#f4d44d] px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-black"
                    : "border border-black bg-transparent px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-black/70 hover:bg-black hover:text-white"
                }
              >
                {r.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm leading-6 text-black/70">{ROLES.find((r) => r.key === role)?.description}</p>
      </div>

      <div className={`mt-5 border p-4 ${copy.className}`}>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-70">Recommended control</p>
        <p className="mt-1 text-lg font-medium">{copy.label}</p>
        <p className="mt-2 text-sm leading-6">{copy.note}</p>
      </div>
    </div>
  );
}
