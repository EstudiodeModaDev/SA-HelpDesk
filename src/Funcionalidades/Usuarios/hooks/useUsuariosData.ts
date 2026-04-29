import * as React from "react";
import type { UsuariosSPService } from "../../../services/Usuarios.service";
import type { UsuariosSP } from "../../../Models/Usuarios";
import type { UserOption } from "../../../Models/Commons";
import { mapUsuariosToOptions } from "../utils/UsersMapper";

export function useUsuariosData(usuariosSvc: UsuariosSPService) {
  const [usuarios, setUsuarios] = React.useState<UsuariosSP[]>([]);
  const [userOptions, setUserOptions] = React.useState<UserOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [pageSize, setPageSize] = React.useState<number>(10);
  const [pageIndex, setPageIndex] = React.useState<number>(1);
  const [nextLink, setNextLink] = React.useState<string | null>(null);

  const loadUsuarios = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await usuariosSvc.getAll();
      

      const itemsRaw: UsuariosSP[] = res.items ;
      const newNextLink = Array.isArray(res) ? null : (res?.nextLink ?? null);

      setUsuarios(itemsRaw);
      setUserOptions(mapUsuariosToOptions(itemsRaw));
      setNextLink(newNextLink);
      setPageIndex(1);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando usuarios");
      setUsuarios([]);
      setUserOptions([]);
      setNextLink(null);
      setPageIndex(1);
    } finally {
      setLoading(false);
    }
  }, [usuariosSvc]);

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadUsuarios(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadUsuarios,]);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const refreshUsers = React.useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  const deleteUser = React.useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await usuariosSvc.update(id, {Disponible: "Inactivo"});
      await loadAll();
      return true;
    } catch (e: any) {
      setError(e?.message ?? "Error eliminando usuario");
      return false;
    } finally {
      setLoading(false);
    }
  }, [usuariosSvc, loadAll]);

  return {
    usuarios,
    userOptions,
    loading,
    error,
    setError,
    pageSize,
    pageIndex,
    nextLink,
    hasNext: !!nextLink,
    setPageSize,
    refreshUsers,
    deleteUser,
  };
}

