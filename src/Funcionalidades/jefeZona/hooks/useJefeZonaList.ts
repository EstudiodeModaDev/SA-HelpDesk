import * as React from "react";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import { mapJefesZonaToOptions,} from "../utils/jefeZonaMappers";
import type { jefeZona } from "../../../Models/TiendasZonas";
import { buildJefeZonaFilter,} from "../utils/filters";

export function useJefeZonaList() {
  const graph = useGraphServices();
  const [jefesZona, setJefesZona] = React.useState<jefeZona[]>([]);
  const [jefeZonaOptions, setJefeZonaOptions] = React.useState<{value: string; label: string}[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState<string>("");


  const loadJefesZonas = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await graph.jefesZona.getAll(buildJefeZonaFilter({s: search}));

      const itemsRaw: jefeZona[] = res.items ;

      setJefesZona(itemsRaw);
      setJefeZonaOptions(mapJefesZonaToOptions(itemsRaw));
    } catch (e: any) {
      setError(e?.message ?? "Error cargando usuarios");
      setJefesZona([]);
      setJefeZonaOptions([]);
    } finally {
      setLoading(false);
    }
  }, [graph, search]);


  React.useEffect(() => {
    void loadJefesZonas();
  }, [loadJefesZonas]);

  const inactivateJefeZona = React.useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await graph.jefesZona.update(id, { Activo: false });
      await loadJefesZonas();
      return true;
    } catch (e: any) {
      setError(e?.message ?? "Error actualizando jefe de zona");
      return false;
    } finally {
      setLoading(false);
    }
  }, [graph, loadJefesZonas]);

  return {
    jefesZona, jefeZonaOptions, loading,  error, setError, loadJefesZonas, inactivateJefeZona, setSearch, search, 
  };
}

