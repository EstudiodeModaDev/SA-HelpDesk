import * as React from "react";
import type { Permission } from "../config/permissions.config";
import { getCurrentUserGroups } from "../services/Sharepoint/spUser.service";
import { buildPermissions } from "../services/Permissions/PermissionsEngine";

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

export function usePermissions() {
  const [engine, setEngine] = React.useState<PermissionsEngine>(EMPTY_ENGINE);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        const groups = await getCurrentUserGroups();
        console.log(groups)
        const permissions = buildPermissions(groups);

        if (!alive) return;
        setEngine(permissions);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "No se pudieron cargar permisos");
        setEngine(EMPTY_ENGINE);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { engine, loading, error };
}