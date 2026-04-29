import * as React from "react";
import { mapTiendaZonaToOptions, } from "../utils/UsersMapper";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import type { TiendaZona } from "../../../Models/TiendasZonas";
import { buildTiendasFilter } from "../utils/filters";

export function useTiendasZonasData() {
  const graph = useGraphServices()
  const [tiendaZona, setTiendaZona] = React.useState<TiendaZona[]>([]);
  const [tiendaZonaOptions, setTiendaZonaOptions] = React.useState<{value: string; label: string}[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [zona, setZona] = React.useState<string>("")
  const [searc, setSearch] = React.useState<string>("")

  const [pageSize, setPageSize] = React.useState<number>(30);
  const [pageIndex, setPageIndex] = React.useState<number>(1);
  const [nextLink, setNextLink] = React.useState<string | null>(null);

  const loadTiendasZonas = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await graph.tiendasZonas.getAll(buildTiendasFilter({s: searc, zona}));

      const itemsRaw: TiendaZona[] = res.items ;
      const newNextLink = Array.isArray(res) ? null : (res?.nextLink ?? null);

      setTiendaZona(itemsRaw);
      setTiendaZonaOptions(mapTiendaZonaToOptions(itemsRaw));
      setNextLink(newNextLink);
      setPageIndex(1);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando usuarios");
      setTiendaZona([]);
      setTiendaZonaOptions([]);
      setNextLink(null);
      setPageIndex(1);
    } finally {
      setLoading(false);
    }
  }, [searc, zona]);


  React.useEffect(() => {
    void loadTiendasZonas();
  }, [loadTiendasZonas, searc, zona]);

  const deleteTiendaZona = React.useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await graph.tiendasZonas.delete(id);
      await loadTiendasZonas();
      return true;
    } catch (e: any) {
      setError(e?.message ?? "Error eliminando usuario");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tiendaZona,
    tiendaZonaOptions,
    loading,
    error,
    setError,
    pageSize,
    pageIndex,
    nextLink,
    hasNext: !!nextLink,
    setPageSize,
    deleteTiendaZona,
    loadTiendasZonas, setSearch, setZona, searc, zona
  };
}

