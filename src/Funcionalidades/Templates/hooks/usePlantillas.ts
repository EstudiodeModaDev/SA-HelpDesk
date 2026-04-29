import * as React from "react";
import { usePlantillasData } from "./usePlantillasData";
import { usePlantillasForm } from "./usePlantillasForm";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import { mapFormToPlantillaPayload } from "../utils/templatesMapper";


export function usePlantillas() {
  const graph = useGraphServices()
  const data = usePlantillasData();
  const form = usePlantillasForm();

  const createPlantilla = React.useCallback(async () => {
    form.setSubmitting(true);
    data.setError(null);

    try {
      const payload = mapFormToPlantillaPayload(form.state);
      const created = await graph.Plantillas.create(payload);

      console.log("Plantilla creada", created);

      await data.refresh();
      form.resetForm();

      return created;
    } catch (e: any) {
      data.setError(e?.message ?? "Error creando la plantilla");
      return null;
    } finally {
      form.setSubmitting(false);
    }
  }, [form, data]);

  return {
    ListaPlantillas: data.listaPlantillas,
    loading: data.loading,
    error: data.error,
    createPlantilla,
    submitting: form.submitting,
    state: form.state,
    setField: form.setField,
    refresh: data.refresh,
  };
}