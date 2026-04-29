import * as React from "react";
import type { SharePointGroupKey } from "../config/app.config";
import type { AppGroupUser } from "../Models/SharepointGroups";
import { grantGroupAccess, listGroupUsers, revokeGroupAccess } from "../services/Permissions/PermissionEngine";
import { norm } from "../utils/Commons";

export function useSharePointGroupMembers(groupKey: SharePointGroupKey) {
  const [rows, setRows] = React.useState<AppGroupUser[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(0);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listGroupUsers(groupKey);
      setRows(data);
      setPageIndex(0);
    } catch (e: any) {
      setRows([]);
      setError(e?.message ?? "Error cargando miembros del grupo");
    } finally {
      setLoading(false);
    }
  }, [groupKey]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return rows;

    const q = norm(search);
    return rows.filter((r) =>
      norm(`${r.nombre} ${r.correo} ${r.loginName}`).includes(q)
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);

  const viewRows = React.useMemo(() => {
    const start = safePageIndex * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePageIndex, pageSize]);

  const hasNext = safePageIndex + 1 < totalPages;
  const nextPage = () => hasNext && setPageIndex((p) => p + 1);
  const prevPage = () => safePageIndex > 0 && setPageIndex((p) => p - 1);

  const grantAccess = React.useCallback(
    async (email: string) => {
      setSaving(true);
      setError(null);
      try {
        await grantGroupAccess(groupKey, email);
        await refresh();
      } catch (e: any) {
        setError(e?.message ?? "No se pudo otorgar acceso");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [groupKey, refresh]
  );

  const revokeAccess = React.useCallback(
    async (spUserId: number) => {
      setSaving(true);
      setError(null);
      try {
        await revokeGroupAccess(groupKey, spUserId);
        await refresh();
      } catch (e: any) {
        setError(e?.message ?? "No se pudo retirar acceso");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [groupKey, refresh]
  );

  return {
    rows: viewRows,
    rawRows: rows,
    filteredRows: filtered,
    loading,
    saving,
    error,
    refresh,
    search,
    setSearch,
    pageSize,
    setPageSize,
    pageIndex: safePageIndex,
    hasNext,
    nextPage,
    prevPage,
    grantAccess,
    revokeAccess,
  };
}