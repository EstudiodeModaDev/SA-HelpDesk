import * as React from "react";
import { tiendaZonaInitialState, } from "../utils/UsersState";
import { isProveedorValid, validateProveedor, } from "../utils/UsersValidation";
import type { Proveedor, ProveedorErrors } from "../../../Models/Proveedores";


export function useProveedoresForm() {
  const [state, setState] = React.useState<Proveedor>(tiendaZonaInitialState);
  const [errors, setErrors] = React.useState<ProveedorErrors>({});
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const setField = React.useCallback(
    <K extends keyof Proveedor>(key: K, value: Proveedor[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const validate = React.useCallback(() => {
    const nextErrors = validateProveedor(state);
    setErrors(nextErrors);
    return isProveedorValid(nextErrors);
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