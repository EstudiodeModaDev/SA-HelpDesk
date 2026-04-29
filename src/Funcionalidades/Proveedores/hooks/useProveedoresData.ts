import * as React from "react";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import { buildProveedoresFilter, } from "../utils/filters";
import type { Proveedor } from "../../../Models/Proveedores";
import { mapProveedoresToOptions } from "../utils/UsersMapper";

export function useProveedoresData() {
  const graph = useGraphServices()
  const [tiendaZona, setTiendaZona] = React.useState<Proveedor[]>([]);
  const [tiendaZonaOptions, setTiendaZonaOptions] = React.useState<{value: string; label: string}[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searc, setSearch] = React.useState<string>("")


  const loadProveedores = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await graph.proveedor.getAll(buildProveedoresFilter({s: searc}));

      const itemsRaw: Proveedor[] = res.items ;

      setTiendaZona(itemsRaw);
      setTiendaZonaOptions(mapProveedoresToOptions(itemsRaw));
    } catch (e: any) {
      setError(e?.message ?? "Error cargando usuarios");
      setTiendaZona([]);
      setTiendaZonaOptions([]);
    } finally {
      setLoading(false);
    }
  }, [searc,]);


  React.useEffect(() => {
    void loadProveedores();
  }, [loadProveedores, searc,]);

  const deleteTiendaZona = React.useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await graph.proveedor.delete(id);
      await loadProveedores();
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
    loadProveedores,
    deleteTiendaZona,
    setSearch,  
    searc, 
  };
}

