"use client";

import { authClient } from "@/lib/auth-client";

export function OrganizationSwitcher() {
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  if (isPending || !organizations?.length) return null;

  return (
    <select
      aria-label="Switch workspace"
      value={activeOrganization?.id ?? "personal"}
      onChange={(event) => {
        void authClient.organization.setActive({
          organizationId: event.target.value === "personal" ? null : event.target.value,
        });
      }}
      className="hidden h-8 rounded-none border border-black/15 bg-white px-2 font-mono text-[10px] uppercase tracking-widest text-black/60 outline-none hover:border-black hover:text-black sm:block"
    >
      <option value="personal">Personal workspace</option>
      {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
    </select>
  );
}
