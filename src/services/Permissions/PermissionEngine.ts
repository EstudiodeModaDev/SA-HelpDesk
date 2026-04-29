import { APP_CONFIG, type SharePointGroupKey } from "../../config/app.config";
import type { AppGroupUser } from "../../Models/SharepointGroups";
import { addUserToGroup, getGroupMembersByName, getSiteGroups, removeUserFromGroup } from "./spGroups.service";


function resolveGroupName(groupKey: SharePointGroupKey) {
  return APP_CONFIG.sharePointGroups[groupKey];
}

export async function listPermissionGroups() {
  const groups = await getSiteGroups();
  const allowed = new Set(Object.values(APP_CONFIG.sharePointGroups));

  return groups.filter((g) => allowed.has(g.title as any));
}

export async function listGroupUsers(groupKey: SharePointGroupKey): Promise<AppGroupUser[]> {
  const groupName = resolveGroupName(groupKey);
  return getGroupMembersByName(groupName);
}

export async function grantGroupAccess(groupKey: SharePointGroupKey, email: string) {
  const groupName = resolveGroupName(groupKey);
  return addUserToGroup(groupName, email);
}

export async function revokeGroupAccess(groupKey: SharePointGroupKey, spUserId: number) {
  const groupName = resolveGroupName(groupKey);
  return removeUserFromGroup(groupName, spUserId);
}