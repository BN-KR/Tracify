import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, memberAc, ownerAc } from "better-auth/plugins/organization/access";

// Owner, admin and member (shown as "Developer") are Better Auth's built-ins.
// Viewer is the read-only role: it can open traces but not write, share or comment (enforced in Convex).
export const ac = createAccessControl(defaultStatements);
export const roles = {
  owner: ac.newRole(ownerAc.statements),
  admin: ac.newRole(adminAc.statements),
  member: ac.newRole(memberAc.statements),
  viewer: ac.newRole({ organization: [], member: [], invitation: [] }),
};
