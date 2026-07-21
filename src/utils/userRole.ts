export type AppRole = "Administrador" | "Observador" | "Usuario";

const ROLE_GROUPS: Record<AppRole, readonly string[]> = {
  Administrador: ["SA-TICKETS-ADMINISTRADOR"],
  Observador: ["SA-TICKETS-OBSERVADORES"],
  Usuario: ["SA-TICKETS-USUARIOS", "SA-TICKETS-RESOLUTOR"],
};

export function resolveRoleFromGroups(groups: string[] | null | undefined): AppRole {
  const safeGroups = new Set((groups ?? []).map((group) => String(group).trim()));

  if (ROLE_GROUPS.Administrador.some((group) => safeGroups.has(group))) {
    return "Administrador";
  }

  if (ROLE_GROUPS.Observador.some((group) => safeGroups.has(group))) {
    return "Observador";
  }

  return "Usuario";
}

export function normalizeRoleLabel(value: string | null | undefined): AppRole {
  const safe = String(value ?? "").trim().toLowerCase();

  if (safe === "administrador" || safe === "admin") {
    return "Administrador";
  }

  if (safe === "observador") {
    return "Observador";
  }

  return "Usuario";
}

export function canBypassTicketApproval(groups: string[] | null | undefined): boolean {
  const safeGroups = new Set((groups ?? []).map((group) => String(group).trim()));
  return safeGroups.has("SA-TICKETS-ADMINISTRADOR") || safeGroups.has("SA-TICKETS-RESOLUTOR");
}
