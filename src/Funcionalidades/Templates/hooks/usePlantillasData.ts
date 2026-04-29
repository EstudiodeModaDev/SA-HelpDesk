import * as React from "react";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import type { Plantillas } from "../../../Models/Plantilla";

export function usePlantillasData() {
  const graph = useGraphServices()
  const [listaPlantillas, setListaPlantillas] = React.useState<Plantillas[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadPlantillas = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await graph.Plantillas.getAll();
      setListaPlantillas(res?.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando plantillas");
      setListaPlantillas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadPlantillas();
  }, [loadPlantillas]);

  const refresh = React.useCallback(async () => {
    await loadPlantillas();
  }, [loadPlantillas]);

  return {
    listaPlantillas,
    loading,
    error,
    setError,
    refresh,
  };
}