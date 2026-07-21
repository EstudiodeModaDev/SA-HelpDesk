import * as React from "react";
import { tiendaZonaInitialState, } from "../utils/jefeZonaState";
import { isJefeZonaValid, validateJefeZona, } from "../utils/jefeZonaValidation";
import type { jefeZona, JefeZonaErrors } from "../../../Models/TiendasZonas";


export function useJefeZonaForm() {
  const [state, setState] = React.useState<jefeZona>(tiendaZonaInitialState);
  const [errors, setErrors] = React.useState<JefeZonaErrors>({});
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const setField = React.useCallback(
    <K extends keyof jefeZona>(key: K, value: jefeZona[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const validate = React.useCallback(() => {
    const nextErrors = validateJefeZona(state);
    setErrors(nextErrors);
    return isJefeZonaValid(nextErrors);
  }, [state]);

  const resetForm = React.useCallback(() => {
    setState(tiendaZonaInitialState);
    setErrors({});
    setSubmitting(false);
  }, []);

  return {
    state,
    errors,
    submitting,
    setSubmitting,
    setField,
    validate,
    resetForm,
  };
}