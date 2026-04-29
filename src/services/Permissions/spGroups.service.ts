import { SharePointRestClient } from "../../Api/Sharepoint/spClient";
import { spEndpoints } from "../../Api/Sharepoint/spEndpoints";
import type { AppGroupUser, AppSharePointGroup, SharePointGroup, SharePointUser } from "../../Models/SharepointGroups";


const sp = new SharePointRestClient();

function toMembershipLogin(email: string) {
  return `i:0#.f|membership|${String(email).trim().toLowerCase()}`;
}

function mapGroup(row: SharePointGroup): AppSharePointGroup {
  return {
    id: row.Id,
    title: row.Title,
    description: row.Description,
  };
}

function mapUser(row: SharePointUser): AppGroupUser {
  return {
    spUserId: row.Id,
    nombre: row.Title ?? "(Sin nombre)",
    correo: row.Email ?? "",
    loginName: row.LoginName,
  };
}

export async function getSiteGroups(): Promise<AppSharePointGroup[]> {
  const data = await sp.get<{ value: SharePointGroup[] }>(spEndpoints.siteGroups());
  return (data?.value ?? []).map(mapGroup);
}

export async function getGroupByName(groupName: string): Promise<AppSharePointGroup | null> {
  try {
    const row = await sp.get<SharePointGroup>(spEndpoints.siteGroupByName(groupName));
    return mapGroup(row);
  } catch {
    return null;
  }
}

export async function getGroupMembersByName(groupName: string): Promise<AppGroupUser[]> {
  const data = await sp.get<{ value: SharePointUser[] }>(
    spEndpoints.siteGroupUsersByName(groupName)
  );
  return (data?.value ?? []).map(mapUser);
}

export async function ensureUser(email: string): Promise<SharePointUser> {
  const loginName = toMembershipLogin(email);

  return sp.post<SharePointUser>(spEndpoints.ensureUser(), {
    logonName: loginName,
  });
}

export async function addUserToGroup(groupName: string, email: string) {
  const ensured = await ensureUser(email);
  const loginName = ensured.LoginName || toMembershipLogin(email);

  try {
    await sp.post(spEndpoints.siteGroupUsersByName(groupName), {
      LoginName: loginName,
    });

    return { ok: true as const };
  } catch (e: any) {
    const msg = String(e?.message ?? "");
    if (
      msg.includes("A user with the specified name") ||
      msg.includes("already exists") ||
      msg.includes("ya existe")
    ) {
      return { ok: true as const, already: true as const };
    }
    throw e;
  }
}

export async function removeUserFromGroup(groupName: string, spUserId: number) {
  const group = await getGroupByName(groupName);
  if (!group) throw new Error(`No existe el grupo "${groupName}" en SharePoint.`);

  await sp.post(spEndpoints.removeUserByIdFromGroup(group.id, spUserId));

  return { ok: true as const };
}