import * as React from "react";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import { useTiendasZonasData } from "./useUsuariosData";
import { useTiendaZonaForm } from "./useUsuariosForm";

export function useTiendasZonas() {
  const graph = useGraphServices()
  const data = useTiendasZonasData();
  const form = useTiendaZonaForm();

  const addTiendaZona = React.useCallback(async () => {
    const isValid = form.validate();
    if (!isValid) return false;

    form.setSubmitting(true);
    data.setError(null);

    try {
      await graph.tiendasZonas.create(form.state);
      await data.loadTiendasZonas();
      form.resetForm();
      return true;
    } catch (e: any) {
      data.setError(e?.message ?? "Error creando usuario");
      return false;
    } finally {
      form.setSubmitting(false);
    }
  }, [, form, data]);

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