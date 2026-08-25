export const PERMISSIONS = {
  VIEW_TICKETS: "tickets.view",
  VIEW_ALL_TICKETS: "tickets.view.all",
  CREATE_TICKETS: "tickets.create",
  VIEW_DASHBOARD: "dashboard.view",
  MANAGE_USERS: "users.manage",
  CREATE_TEMPLATE: "template.create",
  TICKETS_CHANGE: "tickets.change",
  VIEW_EXCEL: "excel.view",
  BULK_CREATE_TICKETS: "tickets.bulk_create",
  APPROVE_TICKETS: "tickets.approve"
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];