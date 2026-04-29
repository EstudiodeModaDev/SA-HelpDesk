import * as React from "react";
import { listPermissionGroups } from "../services/Permissions/PermissionEngine";
import type { AppSharePointGroup } from "../Models/SharepointGroups";

export function useSharePointGroups() {
  const [groups, setGroups] = React.useState<AppSharePointGroup[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPermissionGroups();
      setGroups(data);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando grupos de SharePoint");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return { groups, loading, error, refresh };
}