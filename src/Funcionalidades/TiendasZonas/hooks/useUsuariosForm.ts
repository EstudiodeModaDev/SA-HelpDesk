import * as React from "react";
import { tiendaZonaInitialState, } from "../utils/UsersState";
import { isTiendaZonaValid, validateTiendaZona, } from "../utils/UsersValidation";
import type { TiendaZona, TiendaZonaErrors } from "../../../Models/TiendasZonas";


export function useTiendaZonaForm() {
  const [state, setState] = React.useState<TiendaZona>(tiendaZonaInitialState);
  const [errors, setErrors] = React.useState<TiendaZonaErrors>({});
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const setField = React.useCallback(
    <K extends keyof TiendaZona>(key: K, value: TiendaZona[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const validate = React.useCallback(() => {
    const nextErrors = validateTiendaZona(state);
    setErrors(nextErrors);
    return isTiendaZonaValid(nextErrors);
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