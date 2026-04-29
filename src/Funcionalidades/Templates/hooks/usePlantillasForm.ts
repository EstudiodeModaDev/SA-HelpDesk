import * as React from "react";
import { plantillaInitialState } from "../utils/templatesState";
import type { Plantillas } from "../../../Models/Plantilla";


export function usePlantillasForm() {
  const [state, setState] = React.useState<Plantillas>(plantillaInitialState);
  const [submitting, setSubmitting] = React.useState(false);

  const setField = React.useCallback(
    <K extends keyof Plantillas>(key: K, value: Plantillas[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetForm = React.useCallback(() => {
    setState(plantillaInitialState);
    setSubmitting(false);
  }, []);

  return {
    state,
    submitting,
    setSubmitting,
    setField,
    resetForm,
  };
}