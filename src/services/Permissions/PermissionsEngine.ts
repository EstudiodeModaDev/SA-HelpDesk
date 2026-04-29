import { GROUP_PERMISSIONS } from "../../config/groupPermissions.config";
import type { Permission } from "../../config/permissions.config";

function isBusinessGroup(name: string): boolean {
  return name.startsWith("SA-TICKETS-");
}

export function buildPermissions(userGroups: string[]) {
  const set = new Set<Permission>();

  for (const group of userGroups) {
    if (!isBusinessGroup(group)) continue;
    
    console.log(group)
    const perms = GROUP_PERMISSIONS[group as keyof typeof GROUP_PERMISSIONS];
    console.log(perms)
    perms.forEach((p) => set.add(p));
  }

  return {
    can: (perm: Permission) => set.has(perm),
    canAny: (...perms: Permission[]) => perms.some((p) => set.has(p)),
    canAll: (...perms: Permission[]) => perms.every((p) => set.has(p)),
    list: () => Array.from(set),
  };
}