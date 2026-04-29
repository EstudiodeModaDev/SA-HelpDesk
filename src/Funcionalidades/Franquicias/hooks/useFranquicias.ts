import * as React from "react";
import { useFranquiciasData } from "./useFranquiciasData";
import { useFranquiciasForm } from "./useFranquiciasForm";
import type { FranquiciasService } from "../../../services/Franquicias.service";

export function useFranquicias(FranquiciasSvc: FranquiciasService) {
  const data = useFranquiciasData(FranquiciasSvc);
  const form = useFranquiciasForm();

  const addFranquicia = React.useCallback(async () => {
    const isValid = form.validate();
    if (!isValid) return false;

    form.setSubmitting(true);
    data.setError(null);

    try {
      await FranquiciasSvc.create(form.state);
      await data.refresh();
      form.resetForm();
      return true;
    } catch (e: any) {
      data.setError(e?.message ?? "Error creando franquicia");
      return false;
    } finally {
      form.setSubmitting(false);
    }
  }, [FranquiciasSvc, form, data]);

  return {
    ...data,
    state: form.state,
    errors: form.errors,
    submitting: form.submitting,
    setField: form.setField,
    addFranquicia,
  };
}