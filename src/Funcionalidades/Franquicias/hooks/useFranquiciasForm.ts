import React from "react";
import type { FormFranquinciasError, Franquicias } from "../../../Models/Usuarios";
import { franquiciaInitialState } from "../utils/franquiciasState";
import { isFranquiciaValid, validateFranquicia } from "../utils/franquiciasValidation";

export function useFranquiciasForm() {
  const [state, setState] = React.useState<Franquicias>(franquiciaInitialState);
  const [errors, setErrors] = React.useState<FormFranquinciasError>({});
  const [submitting, setSubmitting] = React.useState(false);

  const setField = React.useCallback(
    <K extends keyof Franquicias>(key: K, value: Franquicias[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetForm = React.useCallback(() => {
    setState(franquiciaInitialState);
    setErrors({});
    setSubmitting(false);
  }, []);

  const validate = React.useCallback(() => {
    const nextErrors = validateFranquicia(state);
    setErrors(nextErrors);
    return isFranquiciaValid(nextErrors);
  }, [state]);

  return {
    state,
    errors,
    submitting,
    setSubmitting,
    setField,
    setErrors,
    validate,
    resetForm,
  };
}