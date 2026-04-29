import * as React from "react";
import type { FormNewUserErrors, UsuariosSP } from "../../../Models/Usuarios";
import { usuarioInitialState } from "../utils/UsersState";
import { isUsuarioValid, validateUsuario } from "../utils/UsersValidation";


export function useUsuariosForm() {
  const [state, setState] = React.useState<UsuariosSP>(usuarioInitialState);
  const [errors, setErrors] = React.useState<FormNewUserErrors>({});
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const setField = React.useCallback(
    <K extends keyof UsuariosSP>(key: K, value: UsuariosSP[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const validate = React.useCallback(() => {
    const nextErrors = validateUsuario(state);
    setErrors(nextErrors);
    return isUsuarioValid(nextErrors);
  }, [state]);

  const resetForm = React.useCallback(() => {
    setState(usuarioInitialState);
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