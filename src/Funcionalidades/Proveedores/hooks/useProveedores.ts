import * as React from "react";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import { useProveedoresData } from "./useProveedoresData";
import { useProveedoresForm } from "./useProveedoresForm";


export function useProveedores() {
  const graph = useGraphServices()
  const data = useProveedoresData();
  const form = useProveedoresForm();

  const addTiendaZona = React.useCallback(async () => {
    const isValid = form.validate();
    if (!isValid) return false;

    form.setSubmitting(true);
    data.setError(null);

    try {
      await graph.proveedor.create(form.state);
      await data.loadProveedores();
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
    proveedoresOptions: data.tiendaZonaOptions,

    state: form.state,
    errors: form.errors,
    submitting: form.submitting,

    setField: form.setField,
    addTiendaZona,
    ...data
  };
}