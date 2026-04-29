export const spEndpoints = {
  siteGroups: () => `/_api/web/sitegroups`,
  siteGroupByName: (groupName: string) => `/_api/web/sitegroups/getByName('${encodeURIComponent(groupName)}')`,
  siteGroupUsersByName: (groupName: string) => `/_api/web/sitegroups/getByName('${encodeURIComponent(groupName)}')/users`,
  ensureUser: () => `/_api/web/ensureuser`,
  removeUserByIdFromGroup: (groupId: number, userId: number) => `/_api/web/sitegroups(${groupId})/users/removeById(${userId})`,
};