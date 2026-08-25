import * as React from "react";
import type { Permission } from "../config/permissions.config";
import { getCurrentUserGroups } from "../services/Sharepoint/spUser.service";
import { getCurrentUserEntraGroupIds } from "../services/Graph/graphGroups.service";
import { ENTRA_GROUP_TO_SP_GROUP } from "../config/entraGroupMapping.config";
import { buildPermissions } from "../services/Permissions/PermissionsEngine";
import { resolveRoleFromGroups, type AppRole } from "../utils/userRole";

type PermissionsEngine = {
  can: (perm: Permission) => boolean;
  canAny: (...perms: Permission[]) => boolean;
  canAll: (...perms: Permission[]) => boolean;
  list: () => Permission[];
};

const EMPTY_ENGINE: PermissionsEngine = {
  can: (_perm) => false,
  canAny: (..._perms) => false,
  canAll: (..._perms) => false,
  list: () => [],
};

/**
 * Carga los grupos SharePoint del usuario actual y construye el motor de permisos de UI.
 */
export function usePermissions() {
  const [engine, setEngine] = React.useState<PermissionsEngine>(EMPTY_ENGINE);
  const [groups, setGroups] = React.useState<string[]>([]);
  const [role, setRole] = React.useState<AppRole>("Usuario");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        const spGroups = await getCurrentUserGroups();

        let entraGroupIds: string[] = [];
        try {
          entraGroupIds = await getCurrentUserEntraGroupIds();
        } catch (e) {
          console.warn("No se pudo resolver membresía de grupos de Entra ID:", e);
        }
        const mappedGroups = entraGroupIds
          .map((id) => ENTRA_GROUP_TO_SP_GROUP[id])
          .filter((g): g is string => Boolean(g));

        const groups = Array.from(new Set([...spGroups, ...mappedGroups]));
        console.log(groups)
        const permissions = buildPermissions(groups);

        if (!alive) return;
        setGroups(groups);
        setRole(resolveRoleFromGroups(groups));
        setEngine(permissions);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "No se pudieron cargar permisos");
        setGroups([]);
        setRole("Usuario");
        setEngine(EMPTY_ENGINE);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { engine, groups, role, loading, error };
}
