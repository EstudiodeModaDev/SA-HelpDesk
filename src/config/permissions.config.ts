export const PERMISSIONS = {
  VIEW_TICKETS: "tickets.view",
  VIEW_ALL_TICKETS: "tickets.view.all",
  CREATE_TICKETS: "tickets.create",
  VIEW_DASHBOARD: "dashboard.view",
  MANAGE_USERS: "users.manage",
  CREATE_TEMPLATE: "template.create",
  TICKETS_CHANGE: "tickets.change"
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];