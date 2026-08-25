// currentuser?$expand=Groups no resuelve grupos de SharePoint asignados vía un grupo
// de Entra ID anidado (ej. "Todos EDM"), así que esos casos se mapean aquí por ID.
export const ENTRA_GROUP_TO_SP_GROUP: Record<string, string> = {
  "a85e845a-5914-4176-8c95-8fbde117c30d": "SA-TICKETS-USUARIOS", // Todos EDM
};
