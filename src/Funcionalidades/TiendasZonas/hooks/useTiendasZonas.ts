import * as React from "react";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import { useTiendasZonasData } from "./useUsuariosData";
import { useTiendaZonaForm } from "./useUsuariosForm";
import type { TiendaZona } from "../../../Models/TiendasZonas";

/**
 * Agrupa el listado, las opciones y el alta de espacios fisicos o tiendas por zona.
 */
export function useTiendasZonas() {
  const graph = useGraphServices();
  const data = useTiendasZonasData();
  const form = useTiendaZonaForm();

  const addTiendaZona = React.useCallback(async () => {
    const isValid = form.validate();
    if (!isValid) return false;

    form.setSubmitting(true);
    data.setError(null);

    try {
      const payload: TiendaZona = {
        Title: form.state.Title,
        Zona: form.state.Zona,
        JefeZonaId: form.state.JefeZonaId
      } 
      await graph.tiendasZonas.create(payload);
      await data.loadTiendasZonas();
      form.resetForm();
      return true;
    } catch (e: any) {
      data.setError(e?.message ?? "Error creando usuario");
      return false;
    } finally {
      form.setSubmitting(false);
    }
  }, [graph, form, data]);

  return {
    tiendasZonas: data.tiendaZona,
    tiendasZonasOptions: data.tiendaZonaOptions,

    state: form.state,
    errors: form.errors,
    submitting: form.submitting,

    setField: form.setField,
    addTiendaZona,
    ...data
  };
}
