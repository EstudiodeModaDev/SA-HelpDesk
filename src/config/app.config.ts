export const APP_CONFIG = {
  tenantName: import.meta.env.VITE_TENANT_NAME ?? "estudiodemoda",
  sharePointSiteUrl:
    import.meta.env.VITE_SP_SITE_URL ??
    "https://estudiodemoda.sharepoint.com/sites/TransformacionDigital/IN/SA",

  sharePointGroups: {
    resolutores: "SA-TICKETS-RESOLUTOR",
    administradores: "SA-TICKETS-ADMINISTRADOR",
    usuarios: "SA - Tickets"
  },
} as const;

export type SharePointGroupKey = keyof typeof APP_CONFIG.sharePointGroups;