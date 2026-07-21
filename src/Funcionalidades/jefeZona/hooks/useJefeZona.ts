import * as React from "react";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import { useJefeZonaList } from "./useJefeZonaList";
import { useJefeZonaForm } from "./useJefeZonaForm";


/**
 * Agrupa el listado, las opciones y el alta de jefes de zona.
 */
export function useJefeZona() {
  const graph = useGraphServices();
  const data = useJefeZonaList();
  const form = useJefeZonaForm();

  const addJefeZona = React.useCallback(async () => {
    const isValid = form.validate();
    if (!isValid) return false;

    form.setSubmitting(true);
    data.setError(null);

    try {
      await graph.jefesZona.create(form.state);
      await data.loadJefesZonas();
      form.resetForm();
      return true;
    } catch (e: any) {
      data.setError(e?.message ?? "Error creando jefe de zona");
      return false;
    } finally {
      form.setSubmitting(false);
    }
  }, [graph, form, data]);


  return {
    state: form.state,
    errors: form.errors,
    submitting: form.submitting,

    setField: form.setField,
    addJefeZona,
    ...data
  };
}
